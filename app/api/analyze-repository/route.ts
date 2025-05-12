import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { analyzeGitHubRepository } from '@/lib/githubUtils';
import { validateApiKey, incrementApiKeyUsage } from '@/lib/apiKeyUtils';

/**
 * GitHub 저장소 분석 API 엔드포인트
 * GitHub 저장소 URL을 받아 분석 결과 반환
 * 유효한 API 키 필요
 */
export async function POST(req: Request) {
  try {
    // Supabase 클라이언트 생성
    const supabase = createRouteHandlerClient({ cookies });
    
    // API 키 확인 (필수)
    const apiKey = req.headers.get('X-API-Key');
    if (!apiKey) {
      return NextResponse.json(
        { message: 'API 키가 필요합니다. 요청 헤더에 X-API-Key를 포함하세요.' },
        { status: 401 }
      );
    }
    
    // API 키 유효성 검증
    let apiKeyData;
    try {
      apiKeyData = await validateApiKey(apiKey);
      if (!apiKeyData) {
        return NextResponse.json(
          { message: '유효하지 않은 API 키입니다. 대시보드의 API 키 관리에서 발급받은 키를 사용하세요.' },
          { status: 401 }
        );
      }
      
      // 사용량 한도 확인
      if (apiKeyData.usage >= apiKeyData.limit) {
        return NextResponse.json(
          { message: 'API 키 사용 한도를 초과했습니다. API 키 관리에서 사용량을 확인하세요.' },
          { status: 429 }
        );
      }
    } catch (error) {
      console.error('API 키 검증 오류:', error);
      return NextResponse.json(
        { message: 'API 키 검증 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // 요청 바디에서 저장소 URL 추출
    const requestData = await req.json();
    const { url } = requestData;
    
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return NextResponse.json(
        { message: '저장소 URL이 유효하지 않습니다.' },
        { status: 400 }
      );
    }
    
    // GitHub 저장소 URL 유효성 검사
    const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
    if (!githubUrlPattern.test(url)) {
      return NextResponse.json(
        { message: '유효한 GitHub 저장소 URL을 입력해주세요.' },
        { status: 400 }
      );
    }
    
    // URL에서 owner와 repo 추출
    const parts = url.split('/');
    const owner = parts[parts.length - 2];
    const repo = parts[parts.length - 1].replace(/\/$/, '');
    
    // 사용자 ID 가져오기 (로그인한 경우만)
    let userId = null;
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      userId = session.user.id;
    }
    
    // 저장소 정보를 데이터베이스에서 확인
    const { data: existingRepo, error: repoError } = await supabase
      .from('repositories')
      .select('id, summary, purpose, technologies, structure')
      .eq('owner', owner)
      .eq('repo_name', repo)
      .single();
    
    // 저장소가 이미 분석되었는지 확인
    if (existingRepo && existingRepo.summary) {
      // API 키 사용량 증가
      await incrementApiKeyUsage(apiKeyData);
      
      // 사용자와 저장소 연결 (로그인한 경우만)
      if (userId) {
        const { data: userRepo, error: userRepoError } = await supabase
          .from('user_repositories')
          .select('id')
          .eq('user_id', userId)
          .eq('repository_id', existingRepo.id)
          .single();
        
        // 사용자와 저장소 연결이 없으면 생성
        if (userRepoError) {
          await supabase
            .from('user_repositories')
            .insert({
              user_id: userId,
              repository_id: existingRepo.id,
              is_favorite: false,
            });
        }
      }
      
      // 이미 분석된 저장소 정보를 가져옴
      const { data: repoData, error: repoDataError } = await supabase
        .from('repositories')
        .select('*, repository_facts(fact)')
        .eq('id', existingRepo.id)
        .single();
      
      if (repoDataError) {
        throw new Error('저장소 정보를 가져오는 중 오류가 발생했습니다.');
      }
      
      // 분석 결과 반환
      return NextResponse.json({
        summary: repoData.summary,
        purpose: repoData.purpose || '목적 정보가 없습니다.',
        technologies: repoData.technologies || [],
        structure: repoData.structure || '구조 정보가 없습니다.',
        facts: repoData.repository_facts?.map((item: any) => item.fact) || [],
      });
    }
    
    // API 키 사용량 증가
    await incrementApiKeyUsage(apiKeyData);
    
    // 새 저장소 분석 실행
    const analysisResult = await analyzeGitHubRepository(owner, repo);
    
    // 분석 결과가 없으면 에러 반환
    if (!analysisResult) {
      return NextResponse.json(
        { message: '저장소 분석 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // 기본 필드와 추가 분석 필드 분리
    const { summary, purpose, technologies, structure, facts } = analysisResult;
    
    // 데이터베이스에 저장소 정보 저장 (analysis_result 필드 제외)
    // technologies는 배열이므로 JSON 문자열로 변환하여 저장
    const technologiesJson = JSON.stringify(technologies || []);
    
    const { data: newRepo, error: newRepoError } = await supabase
      .from('repositories')
      .insert({
        github_url: url,
        owner,
        repo_name: repo,
        summary,
        purpose,
        technologies: technologiesJson,
        structure
      })
      .select()
      .single();
    
    if (newRepoError) {
      console.error('저장소 정보 저장 오류:', newRepoError);
      throw new Error('저장소 정보를 저장하는 중 오류가 발생했습니다.');
    }
    
    // 사용자와 저장소 연결 (로그인한 경우만)
    if (userId) {
      await supabase
        .from('user_repositories')
        .insert({
          user_id: userId,
          repository_id: newRepo.id,
          is_favorite: false,
        });
    }
    
    // 분석 결과에서 주요 사실 저장
    if (facts && facts.length > 0) {
      const factsToInsert = facts.map(fact => ({
        repository_id: newRepo.id,
        fact,
      }));
      
      await supabase
        .from('repository_facts')
        .insert(factsToInsert);
    }
    
    // 전체 분석 결과 반환
    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('저장소 분석 처리 중 오류:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 