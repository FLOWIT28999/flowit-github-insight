/**
 * GitHub 저장소 정보 인터페이스
 * 저장소 기본 정보와 README 내용을 포함
 */
export interface RepoInfo {
  owner: string;
  repo: string;
  stars: number;
  forks: number;
  description: string;
  languageURL: string;
  language: string;
  readme: string;
}

/**
 * 저장소 분석 결과 인터페이스
 */
export interface AnalysisResult {
  summary: string;
  facts: string[];
  technologies: string[];
  purpose: string;
  structure: string;
}

/**
 * GitHub 저장소 정보 가져오기
 * 저장소 이름과 소유자로부터 기본 정보와 README를 가져옴
 * 
 * @param owner 저장소 소유자 (사용자 또는 조직 이름)
 * @param repo 저장소 이름
 * @returns 저장소 정보 객체
 */
export async function getRepoInfo(owner: string, repo: string): Promise<RepoInfo> {
  try {
    // GitHub API 토큰 사용 (있는 경우)
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
    };
    
    // 환경 변수에 GitHub 토큰이 설정된 경우, 요청 헤더에 추가
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // 저장소 기본 정보 가져오기
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
    });

    if (!repoResponse.ok) {
      throw new Error(`GitHub API error: ${repoResponse.status} ${repoResponse.statusText}`);
    }

    const repoData = await repoResponse.json();

    // README 내용 가져오기
    const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers,
    });

    // 에러 처리 (README가 없을 수 있음)
    let readme = '';
    if (readmeResponse.ok) {
      const readmeData = await readmeResponse.json();
      // Base64로 인코딩된 내용 디코딩
      readme = Buffer.from(readmeData.content, 'base64').toString('utf-8');
    } else {
      console.warn(`README not found for ${owner}/${repo}`);
    }

    // 추출된 정보를 RepoInfo 형태로 반환
    return {
      owner,
      repo,
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      description: repoData.description || '',
      language: repoData.language || 'Not specified',
      languageURL: repoData.languages_url,
      readme,
    };
  } catch (error) {
    console.error(`Error fetching repository info: ${error}`);
    throw error;
  }
}

/**
 * GitHub 저장소 프로그래밍 언어 분석
 * 
 * @param owner 저장소 소유자
 * @param repo 저장소 이름
 * @returns 언어 목록 (사용 비율이 높은 순)
 */
export async function getRepoLanguages(owner: string, repo: string): Promise<string[]> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
    };
    
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const languageData = await response.json();
    
    // 언어 데이터를 배열로 변환하고 사용량이 많은 순으로 정렬
    return Object.entries(languageData)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .map(([language]) => language);
  } catch (error) {
    console.error(`Error fetching repository languages: ${error}`);
    return [];
  }
}

/**
 * GitHub 저장소 파일 구조 가져오기
 * 
 * @param owner 저장소 소유자
 * @param repo 저장소 이름
 * @returns 디렉토리 구조 문자열
 */
export async function getRepoStructure(owner: string, repo: string): Promise<string> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
    };
    
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const contents = await response.json();
    
    // 디렉토리와 파일을 분리하여 구조화
    const directories = contents.filter((item: any) => item.type === 'dir').map((item: any) => item.name);
    const files = contents.filter((item: any) => item.type === 'file').map((item: any) => item.name);
    
    let structureText = "프로젝트 루트 구조:\n";
    
    if (directories.length > 0) {
      structureText += "- 디렉토리: " + directories.join(', ') + "\n";
    }
    
    if (files.length > 0) {
      structureText += "- 파일: " + files.join(', ') + "\n";
    }
    
    return structureText;
  } catch (error) {
    console.error(`Error fetching repository structure: ${error}`);
    return "저장소 구조를 가져올 수 없습니다.";
  }
}

/**
 * GitHub 저장소 분석
 * 저장소의 정보를 기반으로 AI를 통해 분석
 * 
 * @param owner 저장소 소유자
 * @param repo 저장소 이름
 * @returns 분석 결과
 */
export async function analyzeGitHubRepository(owner: string, repo: string): Promise<AnalysisResult> {
  try {
    // 저장소 기본 정보 가져오기
    const repoInfo = await getRepoInfo(owner, repo);
    
    // 프로그래밍 언어 정보 가져오기
    const languages = await getRepoLanguages(owner, repo);
    
    // 저장소 구조 가져오기
    const structure = await getRepoStructure(owner, repo);
    
    // 텍스트 요약: 실제 앱에서는 OpenAI나 유사 서비스를 사용하여 분석
    // 이 예제에서는 간단한 mockup 분석 결과를 반환
    // 실제 구현에서는 langchainUtils를 사용하여 AI 요약을 구현해야 함
    
    // Mockup 분석 결과 (실제 구현 시 AI 서비스로 대체)
    const mockAnalysis: AnalysisResult = {
      summary: `${repoInfo.description || repo}는 ${owner}가 개발한 ${repoInfo.language} 기반 프로젝트입니다. 현재 ${repoInfo.stars}개의 스타와 ${repoInfo.forks}개의 포크가 있습니다.`,
      facts: [
        `${languages.length > 0 ? languages[0] : repoInfo.language}가 주요 개발 언어로 사용됨`,
        `${repoInfo.stars}개의 GitHub 스타를 보유`,
        `라이센스: ${repoInfo.readme.includes('MIT') ? 'MIT License' : '명시되지 않음'}`,
      ],
      technologies: languages.slice(0, 5),
      purpose: repoInfo.description || `${repo} 저장소의 주요 목적은 README에서 명확하게 제시되지 않았습니다.`,
      structure: structure,
    };
    
    return mockAnalysis;
    
    /* 실제 구현 시 AI 서비스 연결 코드
    const { analyzeText } = await import('../langchainUtils');
    
    // 저장소 정보와 README를 조합하여 분석용 텍스트 생성
    const analysisText = `
      Repository: ${owner}/${repo}
      Description: ${repoInfo.description}
      Language: ${repoInfo.language}
      Stars: ${repoInfo.stars}
      Forks: ${repoInfo.forks}
      Languages: ${languages.join(', ')}
      Structure: ${structure}
      README: ${repoInfo.readme}
    `;
    
    // AI 서비스를 통한 분석
    const analysis = await analyzeText(analysisText);
    
    return {
      summary: analysis.summary,
      facts: analysis.facts,
      technologies: languages.slice(0, 5),
      purpose: analysis.purpose,
      structure: analysis.structure,
    };
    */
  } catch (error) {
    console.error(`Error analyzing repository: ${error}`);
    throw new Error(`저장소 분석 중 오류가 발생했습니다: ${error}`);
  }
} 