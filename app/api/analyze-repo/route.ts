import { NextRequest, NextResponse } from 'next/server';
import { getRepoInfo } from '@/lib/githubUtils';
import { analyzeRepository } from '@/lib/langchainUtils';
import { validateApiKey, incrementApiKeyUsage } from '@/lib/apiKeyUtils';

/**
 * URL에서 GitHub 저장소 정보 추출
 * GitHub URL 형식을 파싱하여 소유자와 저장소 이름 추출
 * 
 * @param url GitHub 저장소 URL
 * @returns 소유자와 저장소 이름을 포함한 객체 또는 null
 */
function extractRepoInfoFromUrl(url: string): { owner: string; repo: string } | null {
  try {
    const urlObj = new URL(url);
    
    // github.com 도메인인지 확인
    if (!urlObj.hostname.includes('github.com')) {
      return null;
    }
    
    // URL 경로에서 소유자와 저장소 이름 추출
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (pathParts.length >= 2) {
      return {
        owner: pathParts[0],
        repo: pathParts[1]
      };
    }
    
    return null;
  } catch (error) {
    console.error('URL 파싱 오류:', error);
    return null;
  }
}

/**
 * GitHub 저장소 분석 API (POST)
 * 저장소 URL과 API 키를 받아 저장소를 분석하고 결과 반환
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const { repoUrl, apiKey } = await request.json();
    
    // 필수 데이터 확인
    if (!repoUrl) {
      return NextResponse.json(
        { error: '저장소 URL이 필요합니다.' },
        { status: 400 }
      );
    }
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // URL에서 저장소 정보 추출
    const repoInfo = extractRepoInfoFromUrl(repoUrl);
    if (!repoInfo) {
      return NextResponse.json(
        { error: '유효한 GitHub 저장소 URL이 아닙니다.' },
        { status: 400 }
      );
    }
    
    // API 키 유효성 검사
    const apiKeyData = await validateApiKey(apiKey);
    if (!apiKeyData) {
      return NextResponse.json(
        { error: '유효하지 않은 API 키입니다.' },
        { status: 401 }
      );
    }
    
    // API 키 사용량 제한 확인
    if (apiKeyData.usage >= apiKeyData.limit) {
      return NextResponse.json(
        { error: 'API 키 사용량 제한에 도달했습니다.' },
        { status: 403 }
      );
    }
    
    // GitHub API로 저장소 정보 가져오기
    const { owner, repo } = repoInfo;
    const fullRepoInfo = await getRepoInfo(owner, repo);
    
    // LangChain으로 저장소 분석
    const analysisResult = await analyzeRepository(fullRepoInfo);
    
    // API 키 사용량 증가
    await incrementApiKeyUsage(apiKeyData);
    
    // 분석 결과와 API 키 사용량 정보 반환
    return NextResponse.json({
      analysis: analysisResult,
      repoInfo: {
        owner,
        repo,
        stars: fullRepoInfo.stars,
        forks: fullRepoInfo.forks,
        language: fullRepoInfo.language
      },
      usage: {
        current: apiKeyData.usage + 1,
        limit: apiKeyData.limit,
        remaining: apiKeyData.limit - (apiKeyData.usage + 1)
      }
    });
  } catch (error) {
    console.error('저장소 분석 오류:', error);
    return NextResponse.json(
      { error: '저장소 분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 