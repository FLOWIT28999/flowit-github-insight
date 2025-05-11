import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { analyzeGitHubRepository } from '@/lib/githubUtils';

/**
 * GitHub 저장소 분석 API 엔드포인트
 * GitHub 저장소 URL을 받아 분석 결과 반환
 */
export async function POST(req: Request) {
  try {
    // Supabase 클라이언트 생성
    const supabase = createRouteHandlerClient({ cookies });
    
    // 현재 세션 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { message: '인증되지 않은 요청입니다.' },
        { status: 401 }
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
    
    // 사용자 ID 가져오기
    const userId = session.user.id;
    
    // 저장소 정보를 데이터베이스에서 확인
    const { data: existingRepo, error: repoError } = await supabase
      .from('repositories')
      .select('id, summary')
      .eq('owner', owner)
      .eq('repo_name', repo)
      .single();
    
    // 저장소가 이미 분석되었는지 확인
    if (existingRepo && existingRepo.summary) {
      // 사용자가 이 저장소를 이미 연결했는지 확인
      const { data: userRepo, error: userRepoError } = await supabase
        .from('user_repositories')
        .select('id')
        .eq('user_id', userId)
        .eq('repository_id', existingRepo.id)
        .single();
      
      // 사용자와 저장소 연결이 없으면 생성
      if (!userRepo && !userRepoError) {
        await supabase
          .from('user_repositories')
          .insert({
            user_id: userId,
            repository_id: existingRepo.id,
            is_favorite: false,
          });
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
    
    // 새 저장소 분석 실행
    const analysisResult = await analyzeGitHubRepository(owner, repo);
    
    // 분석 결과가 없으면 에러 반환
    if (!analysisResult) {
      return NextResponse.json(
        { message: '저장소 분석 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // 데이터베이스에 저장소 정보 저장
    const { data: newRepo, error: newRepoError } = await supabase
      .from('repositories')
      .insert({
        github_url: url,
        owner,
        repo_name: repo,
        summary: analysisResult.summary,
        purpose: analysisResult.purpose,
        technologies: analysisResult.technologies,
        structure: analysisResult.structure,
      })
      .select()
      .single();
    
    if (newRepoError) {
      console.error('저장소 정보 저장 오류:', newRepoError);
      throw new Error('저장소 정보를 저장하는 중 오류가 발생했습니다.');
    }
    
    // 사용자와 저장소 연결
    await supabase
      .from('user_repositories')
      .insert({
        user_id: userId,
        repository_id: newRepo.id,
        is_favorite: false,
      });
    
    // 분석 결과에서 주요 사실 저장
    if (analysisResult.facts && analysisResult.facts.length > 0) {
      const factsToInsert = analysisResult.facts.map(fact => ({
        repository_id: newRepo.id,
        fact,
      }));
      
      await supabase
        .from('repository_facts')
        .insert(factsToInsert);
    }
    
    // 분석 결과 반환
    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('저장소 분석 처리 중 오류:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 