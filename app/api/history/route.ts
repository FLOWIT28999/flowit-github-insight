import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * 저장소 분석 기록 API 엔드포인트
 * 로그인한 사용자의 저장소 분석 기록을 반환
 */
export async function GET(req: Request) {
  try {
    // Supabase 클라이언트 생성
    const supabase = createRouteHandlerClient({ cookies });
    
    // 사용자 세션 확인 - 세션이 없으면 기본 데이터 반환
    const { data: { session } } = await supabase.auth.getSession();
    
    // 세션이 없으면 예시 데이터 반환
    if (!session) {
      const mockData = [
        {
          id: 'mock-1',
          repoId: 'mock-repo-1',
          repoOwner: 'facebook',
          repoName: 'react',
          avatarUrl: 'https://github.com/facebook.png',
          description: 'A JavaScript library for building user interfaces',
          language: 'JavaScript',
          stars: 204000,
          topics: 'javascript,react,ui,library',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 어제
          isFavorite: true
        },
        {
          id: 'mock-2',
          repoId: 'mock-repo-2',
          repoOwner: 'vercel',
          repoName: 'next.js',
          avatarUrl: 'https://github.com/vercel.png',
          description: 'The React Framework for Production',
          language: 'TypeScript',
          stars: 105000,
          topics: 'javascript,react,framework,vercel,nextjs',
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2일 전
          isFavorite: false
        }
      ];
      
      return NextResponse.json(mockData);
    }
    
    const userId = session.user.id;
    
    // 사용자의 저장소 분석 기록 가져오기
    const { data: userRepositories, error: userRepoError } = await supabase
      .from('user_repositories')
      .select(`
        id,
        is_favorite,
        created_at,
        repositories (
          id,
          github_url,
          owner,
          repo_name,
          summary,
          purpose,
          technologies,
          stars,
          analyzed_at,
          repository_facts (
            id,
            fact
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (userRepoError) {
      console.error('분석 기록 로딩 오류:', userRepoError);
      return NextResponse.json(
        { message: '분석 기록을 가져오는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // 결과가 없을 경우 예시 데이터 생성 (개발 테스트용)
    if (!userRepositories || userRepositories.length === 0) {
      const mockData = [
        {
          id: 'mock-1',
          repoId: 'mock-repo-1',
          repoOwner: 'facebook',
          repoName: 'react',
          avatarUrl: 'https://github.com/facebook.png',
          description: 'A JavaScript library for building user interfaces',
          language: 'JavaScript',
          stars: 204000,
          topics: 'javascript,react,ui,library',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // 어제
          isFavorite: true
        },
        {
          id: 'mock-2',
          repoId: 'mock-repo-2',
          repoOwner: 'vercel',
          repoName: 'next.js',
          avatarUrl: 'https://github.com/vercel.png',
          description: 'The React Framework for Production',
          language: 'TypeScript',
          stars: 105000,
          topics: 'javascript,react,framework,vercel,nextjs',
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2일 전
          isFavorite: false
        }
      ];
      
      return NextResponse.json(mockData);
    }
    
    // 실제 데이터 형식 가공
    const formattedResults = userRepositories.map(item => {
      const repo = item.repositories;
      
      // technologies가 JSON 문자열인 경우 파싱
      let technologies = [];
      try {
        technologies = typeof repo.technologies === 'string' 
          ? JSON.parse(repo.technologies) 
          : repo.technologies || [];
      } catch (e) {
        console.error('기술 스택 파싱 오류:', e);
      }
      
      // 첫 번째 기술 스택을 주요 언어로 사용
      const mainLanguage = technologies.length > 0 ? technologies[0] : 'Unknown';
      
      // facts에서 토픽 추출 (최대 5개 키워드)
      const topics = repo.repository_facts
        ?.map((fact: any) => fact.fact)
        .filter((fact: string) => fact.length < 20) // 짧은 키워드만 선택
        .slice(0, 5)
        .join(',') || '';
      
      return {
        id: item.id,
        repoId: repo.id,
        repoOwner: repo.owner,
        repoName: repo.repo_name,
        avatarUrl: `https://github.com/${repo.owner}.png`,
        description: repo.summary,
        language: mainLanguage,
        stars: repo.stars || 0,
        topics: topics,
        createdAt: repo.analyzed_at || item.created_at,
        isFavorite: item.is_favorite
      };
    });
    
    return NextResponse.json(formattedResults);
    
  } catch (error) {
    console.error('분석 기록 API 오류:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 분석 기록 삭제 API
 * 특정 분석 기록을 삭제
 */
export async function DELETE(req: Request) {
  try {
    // URL에서 ID 추출
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { message: '삭제할 기록의 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // Supabase 클라이언트 생성
    const supabase = createRouteHandlerClient({ cookies });
    
    // 사용자 세션 확인
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { message: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // 사용자의 분석 기록인지 확인
    const { data: userRepo, error: checkError } = await supabase
      .from('user_repositories')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();
    
    if (checkError || !userRepo) {
      return NextResponse.json(
        { message: '해당 기록을 찾을 수 없거나 삭제 권한이 없습니다.' },
        { status: 403 }
      );
    }
    
    // 분석 기록 삭제
    const { error: deleteError } = await supabase
      .from('user_repositories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('분석 기록 삭제 오류:', deleteError);
      return NextResponse.json(
        { message: '분석 기록을 삭제하는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('분석 기록 삭제 API 오류:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 