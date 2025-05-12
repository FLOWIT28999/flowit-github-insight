'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Star, GitPullRequest, Code, Users, Clock, Download, ArrowLeft, Share2, Github } from 'lucide-react';

/**
 * 저장소 분석 결과 페이지 컴포넌트
 * 분석된 GitHub 저장소의 상세 결과를 보여줌
 */
export default function ResultsPage({ params }) {
  const { owner, repo } = params;
  const fullRepo = `${owner}/${repo}`;
  const { user } = useAuth();
  const router = useRouter();
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // 페이지 로드 시 저장소 분석 결과 가져오기
  useEffect(() => {
    if (user) {
      fetchAnalysisResult();
    }
  }, [user, owner, repo]);

  /**
   * 분석 결과를 가져오는 함수
   */
  const fetchAnalysisResult = async () => {
    setIsLoading(true);
    try {
      // 실제 API 호출
      const response = await fetch(`/api/results/${owner}/${repo}`);
      if (!response.ok) {
        throw new Error('분석 결과를 가져오는데 실패했습니다');
      }
      
      const data = await response.json();
      setAnalysisResult(data);
      setIsLoading(false);
    } catch (error) {
      console.error('분석 결과 로딩 오류:', error);
      setIsLoading(false);
      
      // 오류 발생 시 재분석할 수 있도록 처리
      if (!analysisResult) {
        // 재분석을 위한 fallback
        setTimeout(() => {
          router.push(`/dashboard/analyze?repo=https://github.com/${owner}/${repo}`);
        }, 3000);
      }
    }
  };

  return (
    <>
      {/* 상단 내비게이션 버튼 */}
      <div className="mb-6">
        <Link 
          href="/dashboard/history"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>분석 기록으로 돌아가기</span>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
          <p className="text-white text-lg">저장소 분석 결과를 불러오는 중...</p>
        </div>
      ) : analysisResult ? (
        <>
          {/* 저장소 정보 헤더 */}
          <div className="bg-gradient-to-r from-red-900/20 via-red-800/10 to-red-900/20 border border-red-700/30 rounded-xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="relative w-16 h-16 overflow-hidden rounded-xl border-2 border-red-500/50">
                <Image 
                  src={analysisResult.avatarUrl} 
                  alt={analysisResult.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{analysisResult.name}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{analysisResult.stars.toLocaleString()} 스타</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitPullRequest className="w-4 h-4 text-blue-500" />
                    <span>{analysisResult.forks.toLocaleString()} 포크</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-green-500" />
                    <span>{analysisResult.contributors.toLocaleString()} 기여자</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>마지막 커밋: {analysisResult.lastCommit}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <a 
                  href={analysisResult.repoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-black/30 text-gray-300 hover:bg-black/50 hover:text-white transition-colors border border-gray-800"
                  title="GitHub에서 보기"
                >
                  <Github className="w-5 h-5" />
                </a>
                <button 
                  className="p-2 rounded-lg bg-black/30 text-gray-300 hover:bg-black/50 hover:text-white transition-colors border border-gray-800"
                  title="공유하기"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 rounded-lg bg-black/30 text-gray-300 hover:bg-black/50 hover:text-white transition-colors border border-gray-800"
                  title="보고서 다운로드"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* 탭 메뉴 */}
          <div className="border-b border-gray-800 mb-6">
            <div className="flex overflow-x-auto hide-scrollbar">
              <button
                className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'overview' ? 'border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white'} transition-colors`}
                onClick={() => setActiveTab('overview')}
              >
                개요
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'code' ? 'border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white'} transition-colors`}
                onClick={() => setActiveTab('code')}
              >
                코드 품질
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'insecurities' ? 'border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white'} transition-colors`}
                onClick={() => setActiveTab('insecurities')}
              >
                취약점
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'contributors' ? 'border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white'} transition-colors`}
                onClick={() => setActiveTab('contributors')}
              >
                기여자
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'recommendations' ? 'border-red-500 text-white' : 'border-transparent text-gray-400 hover:text-white'} transition-colors`}
                onClick={() => setActiveTab('recommendations')}
              >
                추천 사항
              </button>
            </div>
          </div>
          
          {/* 탭 콘텐츠 */}
          <div className="space-y-8">
            {/* 개요 탭 */}
            {activeTab === 'overview' && (
              <>
                {/* 개요 및 요약 섹션 */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">분석 요약</h2>
                  <div className="text-gray-300 space-y-4">
                    <p>{analysisResult.summary}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">전반적인 점수</div>
                        <div className="flex items-center gap-2">
                          <div className={`text-2xl font-bold ${
                            analysisResult.overallScore >= 8 ? 'text-green-500' :
                            analysisResult.overallScore >= 6 ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {analysisResult.overallScore}/10
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            analysisResult.overallScore >= 8 ? 'bg-green-500/20 text-green-400' :
                            analysisResult.overallScore >= 6 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {
                              analysisResult.overallScore >= 8 ? '우수' :
                              analysisResult.overallScore >= 6 ? '양호' : '개선 필요'
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">코드 품질</div>
                        <div className="flex items-center gap-2">
                          <div className={`text-2xl font-bold ${
                            analysisResult.codeQualityScore >= 8 ? 'text-green-500' :
                            analysisResult.codeQualityScore >= 6 ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {analysisResult.codeQualityScore}/10
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">문서화</div>
                        <div className="flex items-center gap-2">
                          <div className={`text-2xl font-bold ${
                            analysisResult.documentationScore >= 8 ? 'text-green-500' :
                            analysisResult.documentationScore >= 6 ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {analysisResult.documentationScore}/10
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">커뮤니티 활동</div>
                        <div className="flex items-center gap-2">
                          <div className={`text-2xl font-bold ${
                            analysisResult.communityScore >= 8 ? 'text-green-500' :
                            analysisResult.communityScore >= 6 ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {analysisResult.communityScore}/10
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 주요 특징 및 기능 */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">주요 특징 및 기능</h2>
                  <ul className="text-gray-300 space-y-2 ml-6 list-disc">
                    {analysisResult.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
                
                {/* 기술 스택 */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">기술 스택</h2>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.techStack.map((tech, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* 파일 및 폴더 구조 분석 */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">파일 및 폴더 구조</h2>
                  <div className="text-gray-300 mb-4">
                    이 저장소는 다음과 같은 구조로 구성되어 있습니다:
                  </div>
                  <div className="bg-black/50 p-4 rounded-lg border border-gray-800 font-mono text-sm text-gray-300 overflow-auto">
                    <pre>{analysisResult.fileStructure}</pre>
                  </div>
                </div>
              </>
            )}
            
            {/* 코드 품질 탭 */}
            {activeTab === 'code' && (
              <>
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">코드 품질 분석</h2>
                  <div className="text-gray-300 space-y-4">
                    <p>{analysisResult.codeQualityAnalysis}</p>
                    
                    {/* 코드 품질 지표 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                      <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">코드 복잡도</div>
                        <div className="flex items-center gap-2">
                          <div className={`text-2xl font-bold ${
                            analysisResult.codeMetrics.complexity <= 3 ? 'text-green-500' :
                            analysisResult.codeMetrics.complexity <= 6 ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {analysisResult.codeMetrics.complexity}/10
                          </div>
                          <div className={`text-xs px-2 py-1 rounded-full ${
                            analysisResult.codeMetrics.complexity <= 3 ? 'bg-green-500/20 text-green-400' :
                            analysisResult.codeMetrics.complexity <= 6 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {
                              analysisResult.codeMetrics.complexity <= 3 ? '단순' :
                              analysisResult.codeMetrics.complexity <= 6 ? '보통' : '복잡'
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">유지보수성</div>
                        <div className="flex items-center gap-2">
                          <div className={`text-2xl font-bold ${
                            analysisResult.codeMetrics.maintainability >= 8 ? 'text-green-500' :
                            analysisResult.codeMetrics.maintainability >= 5 ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {analysisResult.codeMetrics.maintainability}/10
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                        <div className="text-gray-400 text-sm mb-1">중복 코드</div>
                        <div className="flex items-center gap-2">
                          <div className={`text-2xl font-bold ${
                            analysisResult.codeMetrics.duplication <= 5 ? 'text-green-500' :
                            analysisResult.codeMetrics.duplication <= 15 ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {analysisResult.codeMetrics.duplication}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 코드 이슈 */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4">코드 이슈</h2>
                  <div className="space-y-4">
                    {analysisResult.codeIssues.map((issue, index) => (
                      <div key={index} className="bg-black/50 p-4 rounded-lg border border-gray-800">
                        <div className="flex items-start gap-2">
                          <div className={`p-1 rounded-full ${
                            issue.severity === 'high' ? 'bg-red-500/20' :
                            issue.severity === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              issue.severity === 'high' ? 'bg-red-500' :
                              issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}></div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{issue.title}</h3>
                            <p className="text-gray-400 text-sm mt-1">{issue.description}</p>
                            <div className="mt-2 text-xs text-gray-500">파일: <span className="text-gray-400">{issue.file}</span></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {/* 다른 탭들의 내용 */}
            {activeTab === 'insecurities' && (
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">보안 취약점</h2>
                {analysisResult.securityIssues.length > 0 ? (
                  <div className="space-y-4">
                    {analysisResult.securityIssues.map((issue, index) => (
                      <div key={index} className="bg-black/50 p-4 rounded-lg border border-gray-800">
                        <div className="flex items-start gap-2">
                          <div className={`p-1 rounded-full ${
                            issue.severity === 'critical' ? 'bg-red-600/20' :
                            issue.severity === 'high' ? 'bg-red-500/20' :
                            issue.severity === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              issue.severity === 'critical' ? 'bg-red-600' :
                              issue.severity === 'high' ? 'bg-red-500' :
                              issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}></div>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <h3 className="text-white font-medium">{issue.title}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                issue.severity === 'critical' ? 'bg-red-600/20 text-red-500' :
                                issue.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                                issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {issue.severity.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-400 text-sm mt-1">{issue.description}</p>
                            {issue.recommendation && (
                              <div className="mt-2 p-2 bg-gray-800/50 rounded border border-gray-700 text-sm">
                                <span className="text-green-500 font-medium">권장 수정 사항:</span> {issue.recommendation}
                              </div>
                            )}
                            <div className="mt-2 text-xs text-gray-500">파일: <span className="text-gray-400">{issue.file}</span></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    이 저장소에서 확인된 보안 취약점이 없습니다.
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'contributors' && (
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">기여자 분석</h2>
                <div className="text-gray-300 mb-6">
                  이 저장소에는 총 <span className="text-white font-medium">{analysisResult.contributors}</span>명의 기여자가 있습니다.
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {analysisResult.topContributors.map((contributor, index) => (
                    <div key={index} className="bg-black/50 p-4 rounded-lg border border-gray-800 flex items-center gap-3">
                      <div className="relative w-10 h-10 overflow-hidden rounded-full border border-gray-700">
                        <Image 
                          src={contributor.avatar} 
                          alt={contributor.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-white font-medium">{contributor.name}</div>
                        <div className="text-gray-400 text-xs">{contributor.commits} 커밋</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'recommendations' && (
              <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">개선 및 추천 사항</h2>
                <div className="space-y-4">
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="bg-black/50 p-4 rounded-lg border border-gray-800">
                      <h3 className="text-white font-medium">{recommendation.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{recommendation.description}</p>
                      {recommendation.implementation && (
                        <div className="mt-2 p-2 bg-gray-800/50 rounded border border-gray-700 text-sm">
                          <span className="text-green-500 font-medium">구현 가이드:</span> {recommendation.implementation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl">
          <h3 className="text-xl font-bold text-white mb-2">분석 결과를 찾을 수 없습니다</h3>
          <p className="text-gray-400 mb-6">요청하신 저장소에 대한 분석 결과가 없거나 오류가 발생했습니다.</p>
          <Link 
            href="/dashboard/analyze"
            className="inline-block bg-gradient-to-r from-red-700 to-red-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-800 transition-colors"
          >
            저장소 분석하기
          </Link>
        </div>
      )}
    </>
  );
} 