'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';

/**
 * 저장소 분석 결과 타입 정의
 */
interface AnalysisResult {
  summary: string;
  facts: string[];
  technologies: string[];
  purpose: string;
  structure: string;
}

/**
 * GitHub 저장소 분석 페이지 컴포넌트
 */
export default function AnalyzePage() {
  const { user } = useAuth();
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  /**
   * GitHub 저장소 URL 유효성 검사 함수
   */
  const isValidGitHubUrl = (url: string) => {
    const githubUrlPattern = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;
    return githubUrlPattern.test(url);
  };

  /**
   * 저장소 분석 실행 함수
   */
  const analyzeRepository = async () => {
    if (!repoUrl.trim()) {
      setError('GitHub 저장소 URL을 입력해주세요.');
      return;
    }

    if (!isValidGitHubUrl(repoUrl)) {
      setError('유효한 GitHub 저장소 URL을 입력해주세요. (예: https://github.com/username/repo)');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      
      // 분석 API 호출
      const response = await fetch('/api/analyze-repository', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: repoUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '저장소 분석 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error('저장소 분석 오류:', err);
      setError(err.message || '저장소 분석 중 오류가 발생했습니다.');
      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">GitHub 저장소 분석</h1>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* 분석 폼 */}
      <div className="bg-card border rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">저장소 분석</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="GitHub 저장소 URL (예: https://github.com/username/repo)"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            disabled={isAnalyzing}
          />
          <button
            onClick={analyzeRepository}
            disabled={isAnalyzing || !repoUrl.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
          >
            {isAnalyzing ? '분석 중...' : '분석하기'}
          </button>
        </div>
      </div>
      
      {/* 분석 결과 */}
      {result && (
        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">분석 결과</h2>
          
          <div className="space-y-4">
            <section>
              <h3 className="font-medium text-lg">요약</h3>
              <p className="mt-1">{result.summary}</p>
            </section>
            
            <section>
              <h3 className="font-medium text-lg">주요 목적</h3>
              <p className="mt-1">{result.purpose}</p>
            </section>
            
            <section>
              <h3 className="font-medium text-lg">사용 기술</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {result.technologies.map((tech, i) => (
                  <span 
                    key={i} 
                    className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>
            
            <section>
              <h3 className="font-medium text-lg">프로젝트 구조</h3>
              <p className="mt-1">{result.structure}</p>
            </section>
            
            <section>
              <h3 className="font-medium text-lg">주요 특징</h3>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {result.facts.map((fact, i) => (
                  <li key={i}>{fact}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
} 