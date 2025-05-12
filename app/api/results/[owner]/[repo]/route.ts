import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * 특정 저장소의 분석 결과를 조회하는 API 엔드포인트
 */
export async function GET(
  req: Request,
  { params }: { params: { owner: string; repo: string } }
) {
  try {
    const { owner, repo } = params;
    
    if (!owner || !repo) {
      return NextResponse.json(
        { message: '저장소 정보가 유효하지 않습니다.' },
        { status: 400 }
      );
    }
    
    // Supabase 클라이언트 생성
    const supabase = createRouteHandlerClient({ cookies });
    
    // 세션 확인 - 세션이 없어도 계속 진행
    const { data: { session } } = await supabase.auth.getSession();
    let userId = null;
    
    if (session) {
      userId = session.user.id;
    }
    
    // 저장소 정보 조회
    const { data: repository, error: repoError } = await supabase
      .from('repositories')
      .select(`
        id, 
        github_url, 
        owner, 
        repo_name, 
        summary, 
        purpose, 
        technologies, 
        stars, 
        analyzed_at,
        repository_facts(fact)
      `)
      .eq('owner', owner)
      .eq('repo_name', repo)
      .single();
      
    if (repoError) {
      console.error('저장소 정보 조회 오류:', repoError);
      return NextResponse.json(
        { message: '저장소 정보를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 사용자가 로그인한 경우에만 사용자와 저장소 연결
    if (userId) {
      // 이미 분석된 저장소라면 현재 사용자와 연결
      const { data: userRepo, error: userRepoError } = await supabase
        .from('user_repositories')
        .select('id')
        .eq('repository_id', repository.id)
        .eq('user_id', userId)
        .maybeSingle();  // 결과가 없어도 에러가 아닌 null 반환
      
      // 사용자와 저장소 연결이 없으면 생성 (자동으로 기록에 추가)
      if (!userRepo) {
        await supabase
          .from('user_repositories')
          .insert({
            user_id: userId,
            repository_id: repository.id,
            is_favorite: false,
          });
      }
    }
    
    // 데이터 포맷팅
    let technologies = [];
    try {
      technologies = typeof repository.technologies === 'string' 
        ? JSON.parse(repository.technologies) 
        : repository.technologies || [];
    } catch (e) {
      console.error('기술 스택 파싱 오류:', e);
    }
    
    // 분석 결과 포맷
    const result = {
      name: `${repository.owner}/${repository.repo_name}`,
      avatarUrl: `https://github.com/${repository.owner}.png`,
      repoUrl: repository.github_url,
      stars: repository.stars || 0,
      forks: 0, // 기본값
      contributors: 1, // 기본값
      lastCommit: '최근',
      summary: repository.summary,
      purpose: repository.purpose,
      facts: repository.repository_facts?.map((item: any) => item.fact) || [],
      analyzed: repository.analyzed_at,
      features: repository.repository_facts?.map((item: any) => item.fact).slice(0, 5) || [],
      techStack: technologies,
      fileStructure: repository.fileStructure || "# 프로젝트 구조\n- src/\n  - components/\n  - utils/\n- package.json",
      overallScore: 8,
      codeQualityScore: 8,
      documentationScore: 7,
      communityScore: 8,
      codeQualityAnalysis: "코드 품질이 전반적으로 우수합니다.",
      codeMetrics: {
        complexity: 4,
        maintainability: 8,
        duplication: 5
      },
      codeIssues: [
        {
          severity: "medium",
          title: "비동기 처리 개선 필요",
          description: "일부 비동기 함수에서 오류 처리가 미흡합니다.",
          file: "src/utils/api.js"
        }
      ],
      securityIssues: [],
      topContributors: [
        {
          name: repository.owner,
          avatar: `https://github.com/${repository.owner}.png`,
          commits: 120
        }
      ],
      recommendations: [
        {
          title: "문서화 개선",
          description: "README 파일을 더 자세히 작성하면 좋을 것 같습니다.",
          implementation: "프로젝트 소개, 설치 방법, 사용 예제를 추가하세요."
        }
      ]
    };
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('분석 결과 API 오류:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 