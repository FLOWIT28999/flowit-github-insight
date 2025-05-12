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
  lastUpdate?: string;
  createdAt?: string;
  issuesCount?: number;
  watchersCount?: number;
  homepage?: string;
  topics?: string[];
  license?: string;
  defaultBranch?: string;
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
  features?: string[];
  coolFacts?: string[];
  developmentStatus?: string;
  setupComplexity?: string;
  architecture?: string;
  codeOrganization?: string;
  bestPractices?: string[];
  improvementSuggestions?: string[];
  complexityAssessment?: string;
  mainComponents?: string[];
  strength?: string[];
  weaknesses?: string[];
  useCase?: string[];
  communityAssessment?: string;
  maintenanceQuality?: string;
  learningValue?: string;
  recommendationScore?: number;
  conclusion?: string;
  contributors?: ContributorInfo[];
  activityData?: ActivityData;
}

/**
 * 기여자 정보 인터페이스
 */
export interface ContributorInfo {
  username: string;
  contributions: number;
  avatarUrl: string;
  profileUrl: string;
}

/**
 * 활동 데이터 인터페이스
 */
export interface ActivityData {
  totalCommits: number;
  lastMonthCommits: number;
  openIssues: number;
  closedIssues: number;
  openPullRequests: number;
  mergedPullRequests: number;
  avgIssueResolutionDays?: number;
  avgPrMergeDays?: number;
  commitFrequency?: string;
  lastCommitDate?: string;
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
      lastUpdate: repoData.updated_at,
      createdAt: repoData.created_at,
      issuesCount: repoData.open_issues_count,
      watchersCount: repoData.watchers_count,
      homepage: repoData.homepage,
      topics: repoData.topics || [],
      license: repoData.license ? repoData.license.name : null,
      defaultBranch: repoData.default_branch,
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
 * GitHub 저장소 기여자 정보 가져오기
 * 
 * @param owner 저장소 소유자
 * @param repo 저장소 이름
 * @param limit 가져올 기여자 수 (기본값: 10)
 * @returns 기여자 정보 배열
 */
export async function getRepoContributors(owner: string, repo: string, limit: number = 10): Promise<ContributorInfo[]> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
    };
    
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=${limit}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const contributorsData = await response.json();
    
    return contributorsData.map((contributor: any) => ({
      username: contributor.login,
      contributions: contributor.contributions,
      avatarUrl: contributor.avatar_url,
      profileUrl: contributor.html_url,
    }));
  } catch (error) {
    console.error(`Error fetching repository contributors: ${error}`);
    return [];
  }
}

/**
 * GitHub 저장소 활동 데이터 가져오기
 * 
 * @param owner 저장소 소유자
 * @param repo 저장소 이름
 * @returns 저장소 활동 데이터
 */
export async function getRepoActivity(owner: string, repo: string): Promise<ActivityData> {
  try {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github+json',
    };
    
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // 병렬로 여러 요청 실행
    const [
      issuesResponse, 
      pullsResponse, 
      commitsResponse
    ] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=100`, { headers })
    ]);

    if (!issuesResponse.ok || !pullsResponse.ok || !commitsResponse.ok) {
      throw new Error(`GitHub API error fetching activity data`);
    }

    const [issues, pulls, commits] = await Promise.all([
      issuesResponse.json(),
      pullsResponse.json(),
      commitsResponse.json()
    ]);

    // 현재 날짜와 한 달 전 날짜 계산
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    // 커밋 분석
    const lastMonthCommits = commits.filter((commit: any) => {
      const commitDate = new Date(commit.commit.committer.date);
      return commitDate >= oneMonthAgo;
    }).length;

    // 이슈 분석
    const openIssues = issues.filter((issue: any) => !issue.pull_request && issue.state === 'open').length;
    const closedIssues = issues.filter((issue: any) => !issue.pull_request && issue.state === 'closed').length;

    // PR 분석
    const openPullRequests = pulls.filter((pr: any) => pr.state === 'open').length;
    const mergedPullRequests = pulls.filter((pr: any) => pr.merged_at !== null).length;

    // 마지막 커밋 날짜
    const lastCommitDate = commits.length > 0 ? commits[0].commit.committer.date : null;

    // 커밋 빈도 평가
    let commitFrequency = '낮음';
    if (lastMonthCommits > 50) {
      commitFrequency = '매우 활발함';
    } else if (lastMonthCommits > 20) {
      commitFrequency = '활발함';
    } else if (lastMonthCommits > 5) {
      commitFrequency = '보통';
    }

    return {
      totalCommits: commits.length,
      lastMonthCommits,
      openIssues,
      closedIssues,
      openPullRequests,
      mergedPullRequests,
      commitFrequency,
      lastCommitDate,
    };
  } catch (error) {
    console.error(`Error fetching repository activity: ${error}`);
    return {
      totalCommits: 0,
      lastMonthCommits: 0,
      openIssues: 0,
      closedIssues: 0,
      openPullRequests: 0,
      mergedPullRequests: 0,
    };
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
      
      // 주요 디렉토리 내용 추가로 가져오기 (최대 3개)
      const importantDirs = ['src', 'app', 'lib', 'components'].filter(dir => directories.includes(dir));
      
      for (const dir of importantDirs.slice(0, 3)) {
        try {
          const dirResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${dir}`, {
            headers,
          });
          
          if (dirResponse.ok) {
            const dirContents = await dirResponse.json();
            const dirDirectories = dirContents.filter((item: any) => item.type === 'dir').map((item: any) => item.name);
            const dirFiles = dirContents.filter((item: any) => item.type === 'file').map((item: any) => item.name);
            
            structureText += `\n${dir} 디렉토리 내용:\n`;
            if (dirDirectories.length > 0) {
              structureText += `- 하위 디렉토리: ${dirDirectories.join(', ')}\n`;
            }
            if (dirFiles.length > 0) {
              structureText += `- 파일: ${dirFiles.join(', ')}\n`;
            }
          }
        } catch (error) {
          console.error(`Error fetching ${dir} directory contents:`, error);
        }
      }
    }
    
    if (files.length > 0) {
      structureText += "- 파일: " + files.join(', ') + "\n";
      
      // 주요 구성 파일 내용 확인
      const configFiles = [
        'package.json', 'tsconfig.json', 'next.config.js', 'tailwind.config.js',
        'Dockerfile', 'docker-compose.yml', '.env.example'
      ].filter(file => files.includes(file));
      
      if (configFiles.length > 0) {
        structureText += "\n주요 구성 파일:\n";
        structureText += "- " + configFiles.join(', ') + "\n";
      }
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
    
    // 기여자 정보 가져오기
    const contributors = await getRepoContributors(owner, repo);
    
    // 활동 데이터 가져오기
    const activityData = await getRepoActivity(owner, repo);
    
    // LangChain을 사용한 분석 기능이 있는 경우
    let langchainAnalysis = {};
    try {
      // 동적으로 모듈 가져오기
      const { analyzeReadme, analyzeStructure, generateComprehensiveAnalysis } = await import('./langchainUtils');
      
      // README 분석
      const readmeAnalysis = await analyzeReadme(repoInfo.readme);
      
      // 구조 분석
      const structureAnalysis = await analyzeStructure(structure, languages);
      
      // 종합 분석
      const comprehensiveAnalysis = await generateComprehensiveAnalysis(
        readmeAnalysis, 
        structureAnalysis,
        {
          name: `${owner}/${repo}`,
          stars: repoInfo.stars,
          forks: repoInfo.forks,
          description: repoInfo.description,
          language: repoInfo.language,
          languagesList: languages,
        }
      );
      
      langchainAnalysis = {
        ...readmeAnalysis,
        ...structureAnalysis,
        ...comprehensiveAnalysis
      };
    } catch (error) {
      console.warn('LangChain 분석을 사용할 수 없습니다:', error);
      // LangChain 분석 실패 시 기본 분석 결과 사용 (계속 진행)
    }
    
    // 기본 분석 결과 생성
    const basicAnalysis: AnalysisResult = {
      summary: `${repoInfo.description || repo}는 ${owner}가 개발한 ${repoInfo.language} 기반 프로젝트입니다. 현재 ${repoInfo.stars}개의 스타와 ${repoInfo.forks}개의 포크가 있습니다.`,
      facts: [
        `저장소는 ${repoInfo.stars}개의 스타와 ${repoInfo.forks}개의 포크를 보유하고 있습니다.`,
        `주요 사용 언어는 ${languages.slice(0, 3).join(', ')}입니다.`,
        `${activityData.lastMonthCommits}개의 커밋이 지난 한 달 동안 있었습니다.`,
        `현재 ${activityData.openIssues}개의 미해결 이슈와 ${activityData.openPullRequests}개의 오픈 PR이 있습니다.`,
      ],
      technologies: languages,
      purpose: repoInfo.description || `${owner}/${repo} 저장소의 목적`,
      structure: structure,
      contributors: contributors,
      activityData: activityData,
    };
    
    // LangChain 분석 결과와 기본 분석 결과 병합
    return {
      ...basicAnalysis,
      ...langchainAnalysis
    };
  } catch (error) {
    console.error(`Error analyzing repository: ${error}`);
    throw error;
  }
} 