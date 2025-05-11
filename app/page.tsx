'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import LoginButton from './components/LoginButton';
import Link from 'next/link';
import Loading from './components/Loading';
import Header from './components/Header';
import { Github, Star, GitPullRequest, Code, ExternalLink, Check, ChevronRight, Zap, Database, Shield, TrendingUp, BarChart2, PlayCircle, Users, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import RepositoryVisualizer from './components/RepositoryVisualizer';
import AiChatBot from './components/AiChatBot';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Button } from './components/Card';
import { useRouter } from 'next/navigation';

// 예시 저장소 분석 결과
const demoAnalysisResult = {
  summary: "Next.js 기반의 인터랙티브한 웹 애플리케이션으로, 모던 React 기술과 최신 웹 기술이 적용되어 있습니다.",
  technologies: ["React", "Next.js", "TypeScript", "TailwindCSS", "Supabase"],
};

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const [repoUrl, setRepoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const router = useRouter();

  // 데모 분석 함수
  const handleDemoAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };
  
  // 활성화된 기능 변경 함수
  const rotateFeature = () => {
    setActiveFeature((prev) => (prev + 1) % 3);
  };
  
  // 자동 기능 전환 효과
  useEffect(() => {
    const interval = setInterval(rotateFeature, 5000);
    return () => clearInterval(interval);
  }, []);

  // 섹션으로 스크롤하는 함수
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* 헤더 - 기존 헤더 대신 커스텀 네비게이션 구현 */}
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black/80 backdrop-blur-md shadow-md py-3">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            {/* 로고 */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <Github className="h-6 w-6 text-red-500" />
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-red-500">
                flowit
              </span>
              <span className="text-white font-bold">github</span>
              <span className="text-red-500 font-bold">insight</span>
            </div>

            {/* 데스크톱 메뉴 */}
            <nav className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-gray-300 hover:text-white transition-colors"
              >
                홈
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                기능
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                가격
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-gray-300 hover:text-white transition-colors"
              >
                소개
              </button>
            </nav>

            {/* 인증 상태 표시 */}
            <div className="flex items-center gap-4">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center gap-4">
                  <Link 
                    href="/dashboard"
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="hidden md:inline">대시보드</span>
                  </Link>
                  <div className="flex items-center gap-2 bg-gray-900 bg-opacity-50 hover:bg-opacity-80 px-3 py-2 rounded-lg transition-all">
                    {user.user_metadata?.avatar_url ? (
                      <Image 
                        src={user.user_metadata.avatar_url} 
                        alt="Profile" 
                        width={28} 
                        height={28} 
                        className="rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-300" />
                    )}
                    <span className="text-gray-300 hidden md:inline">{user.user_metadata?.user_name || user.email}</span>
                  </div>
                  <button
                    onClick={signOut}
                    className="p-2 rounded-full bg-gray-800/50 text-gray-300 hover:bg-red-900/30 hover:text-white transition-colors"
                    title="로그아웃"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <LoginButton />
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* 히어로 섹션 */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-black via-gray-900 to-red-900 py-20 md:py-28 lg:py-32 mt-16">
        {/* 배경 효과 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-red-600/20 blur-3xl"></div>
          <div className="absolute -left-20 top-1/2 h-72 w-72 rounded-full bg-red-900/30 blur-3xl"></div>
          <div className="absolute top-1/4 left-1/3 h-96 w-96 rounded-full bg-red-700/10 blur-3xl"></div>
        </div>
        
        <div className="container relative px-4 md:px-6 mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="flex flex-col space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">AI 기반 분석</span>
                  <span className="px-3 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">최신 기술</span>
                  <span className="px-3 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded-full">GitHub 통합</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none">
                  <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white to-red-500">flowit</span>
                  <span className="text-white"> github</span>
                  <span className="text-red-500"> insight</span>
                </h1>
                <p className="text-xl text-gray-300 md:text-2xl/relaxed lg:text-2xl/relaxed xl:text-2xl/relaxed max-w-[600px]">
                  AI 기반 GitHub 저장소 분석으로 코드의 인사이트를 발견하세요
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                {loading ? (
                  <Loading />
                ) : user ? (
                  <>
                    <Link 
                      href="/dashboard"
                      className="inline-flex h-14 items-center justify-center rounded-full bg-red-600 px-8 text-base font-medium text-white shadow-lg shadow-red-500/25 transition-all hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      대시보드로 이동
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                    <Link 
                      href="/analyze"
                      className="inline-flex h-14 items-center justify-center rounded-full border border-gray-700 bg-black/30 px-8 text-base font-medium text-white backdrop-blur-sm transition-colors hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      저장소 분석하기
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-300">GitHub 저장소 분석을 시작하려면 로그인하세요</p>
                    <LoginButton />
                  </div>
                )}
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Shield className="h-4 w-4" />
                  <span>빠르고 안전한 분석 · 100% 무료로 시작하세요</span>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-xs text-white">
                        {num}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">
                    <span className="text-red-400 font-semibold">500+</span> 개발자가 사용 중
                  </span>
                </div>
              </div>
            </div>
            
            <div className="relative mx-auto aspect-video max-w-lg rounded-xl border border-gray-800 bg-black/50 p-2 shadow-2xl backdrop-blur-sm md:ml-auto">
              <div className="absolute -top-2 -left-2 right-2 h-full w-full rounded-xl border border-gray-800 bg-gradient-to-br from-gray-800/30 via-gray-800/10 to-black/20 shadow-xl backdrop-blur-sm">
                <div className="absolute left-4 top-3 flex space-x-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="relative h-full overflow-hidden rounded-lg">
                <div className="p-6 text-left font-mono text-sm">
                  <div className="mb-4 flex items-center space-x-2 text-gray-500">
                    <Github className="h-5 w-5" />
                    <span>github.com/vercel/next.js</span>
                  </div>
                  <div className="space-y-4">
                    {activeFeature === 0 && (
                      <div className="space-y-2">
                        <h3 className="text-red-400 font-semibold">기술 스택 분석</h3>
                        <div className="animate-pulse bg-gray-800/50 h-8 w-3/4 rounded"></div>
                        <div className="animate-pulse bg-gray-800/50 h-8 w-full rounded"></div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {['React', 'Next.js', 'TypeScript', 'TailwindCSS'].map((tech) => (
                            <span key={tech} className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {activeFeature === 1 && (
                      <div className="space-y-2">
                        <h3 className="text-red-400 font-semibold">구조 분석</h3>
                        <div className="animate-pulse bg-gray-800/50 h-8 w-3/4 rounded"></div>
                        <div className="animate-pulse bg-gray-800/50 h-8 w-full rounded"></div>
                        <div className="font-mono text-xs text-gray-400 mt-3">
                          <div>📂 app/</div>
                          <div className="ml-4">📂 components/</div>
                          <div className="ml-8">📄 Button.tsx</div>
                          <div className="ml-8">📄 Card.tsx</div>
                          <div className="ml-4">📂 utils/</div>
                          <div className="ml-4">📄 page.tsx</div>
                        </div>
                      </div>
                    )}
                    
                    {activeFeature === 2 && (
                      <div className="space-y-2">
                        <h3 className="text-red-400 font-semibold">기능 진단</h3>
                        <div className="animate-pulse bg-gray-800/50 h-8 w-3/4 rounded"></div>
                        <div className="animate-pulse bg-gray-800/50 h-8 w-full rounded"></div>
                        <div className="space-y-1 mt-3">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-gray-300 text-xs">사용자 인증</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-gray-300 text-xs">API 통합</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-gray-300 text-xs">반응형 디자인</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 히어로 하단 진행 인디케이터 */}
        <div className="container px-4 md:px-6 mx-auto max-w-6xl mt-10">
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((idx) => (
              <button 
                key={idx}
                onClick={() => setActiveFeature(idx)}
                className={`w-12 h-1 rounded-full transition-all ${
                  activeFeature === idx ? 'bg-red-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 주요 기능 섹션 */}
      <section id="features" className="bg-black py-20">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-medium mb-3">
              <Zap className="w-4 h-4 mr-2" />
              핵심 기능
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              빠르고 강력한 저장소 분석
            </h2>
            <p className="text-xl text-gray-400 max-w-[800px]">
              AI 기반 분석으로 GitHub 저장소의 모든 측면을 심층적으로 이해하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-8 rounded-3xl border border-gray-800 shadow-xl group hover:border-red-500/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-red-500 to-red-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/20">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">AI 저장소 분석</h3>
              <p className="text-gray-400 mb-6">GitHub 저장소의 목적, 기능, 기술 스택을 AI로 분석하여 직관적인 인사이트를 제공합니다.</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-300">목적 및 기능 요약</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-300">기술 스택 분석</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-300">주요 특징 추출</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-8 rounded-3xl border border-gray-800 shadow-xl group hover:border-red-500/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-red-500 to-red-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/20">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">API 키 관리</h3>
              <p className="text-gray-400 mb-6">API 키를 생성하고 관리하여 서비스에 쉽게 접근하고 다른 시스템과 연동할 수 있습니다.</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-300">안전한 키 생성</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-300">사용량 모니터링</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-300">접근 제어</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-8 rounded-3xl border border-gray-800 shadow-xl group hover:border-red-500/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-red-500 to-red-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/20">
                <GitPullRequest className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">프로젝트 구조 분석</h3>
              <p className="text-gray-400 mb-6">프로젝트 구조와 아키텍처를 분석하여 이해하기 쉬운 형태로 시각화합니다.</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-300">디렉토리 구조 분석</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-300">의존성 파악</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                  <span className="text-gray-300">코드 품질 평가</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* 추가 특별 기능 카드 */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-red-900/20 to-black p-8 rounded-3xl border border-red-900/50 shadow-xl group hover:border-red-500/50 transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className="bg-gradient-to-br from-red-500 to-red-700 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
                  <PlayCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-white">실시간 코드 워크스루</h3>
                  <p className="text-gray-400 mb-6">
                    AI가 코드를 인터랙티브하게 분석하여 주요 알고리즘과 로직을 설명하는 대화형 코드 워크스루 기능을 제공합니다.
                  </p>
                  <Link 
                    href="#demo"
                    className="inline-flex items-center text-red-500 hover:text-red-400"
                  >
                    기능 살펴보기
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-red-900/20 to-black p-8 rounded-3xl border border-red-900/50 shadow-xl group hover:border-red-500/50 transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className="bg-gradient-to-br from-red-500 to-red-700 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 shrink-0">
                  <BarChart2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-3 text-white">팀 기여도 분석</h3>
                  <p className="text-gray-400 mb-6">
                    각 팀원의 기여도를 시각적으로 표현하며, 팀의 강점과 취약점을 파악하여 협업 효율성을 극대화할 수 있도록 도와줍니다.
                  </p>
                  <Link 
                    href="#demo"
                    className="inline-flex items-center text-red-500 hover:text-red-400"
                  >
                    데모 확인하기
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 데모 섹션 */}
      <section id="demo" className="relative w-full py-20 overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-950">
        <div className="absolute inset-0 overflow-hidden opacity-50">
          <div className="absolute -right-20 bottom-1/3 h-72 w-72 rounded-full bg-red-600/10 blur-3xl"></div>
          <div className="absolute -left-20 top-1/2 h-72 w-72 rounded-full bg-red-900/10 blur-3xl"></div>
        </div>
        
        <div className="container relative px-4 md:px-6 mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-medium mb-3">
              <Code className="w-4 h-4 mr-2" />
              직접 체험해보세요
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              GitHub 저장소 분석 체험
            </h2>
            <p className="text-xl text-gray-400 max-w-[800px]">
              저장소 URL을 입력하고 AI 분석의 힘을 직접 경험해보세요
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-8 rounded-3xl border border-gray-800 shadow-xl mx-auto max-w-3xl">
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="GitHub 저장소 URL (예: https://github.com/vercel/next.js)"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="flex-1 bg-black/50 text-white border border-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={handleDemoAnalyze}
                  disabled={isAnalyzing || !repoUrl}
                  className="bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl px-6 py-3 hover:from-red-700 hover:to-red-800 disabled:opacity-50 transition-all duration-300 shadow-lg shadow-red-700/20"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      분석 중...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      분석하기
                    </span>
                  )}
                </button>
              </div>

              {isAnalyzing ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-800 rounded mb-4 w-3/4"></div>
                  <div className="h-8 bg-gray-800 rounded mb-4"></div>
                  <div className="h-8 bg-gray-800 rounded mb-4 w-5/6"></div>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-8 bg-gray-800 rounded-full px-5 py-2 w-20"></div>
                    ))}
                  </div>
                </div>
              ) : repoUrl && !isAnalyzing && demoAnalysisResult ? (
                <div className="space-y-4 mt-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">요약</h3>
                    <p className="text-gray-300">{demoAnalysisResult.summary}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">기술 스택</h3>
                    <div className="flex gap-2 flex-wrap">
                      {demoAnalysisResult.technologies.map((tech, index) => (
                        <span key={index} className="bg-red-500/10 text-red-400 px-3 py-1 rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-gray-800">
                    <Link
                      href="/analyze"
                      className="inline-flex items-center text-red-500 hover:text-red-400"
                    >
                      더 자세한 분석 보기
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-lg border border-gray-800 text-center">
                  <p className="text-gray-400">GitHub 저장소 URL을 입력하면 AI가 분석 결과를 보여드립니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 저장소 시각화 섹션 */}
      <section id="visualization" className="bg-black py-20">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8">
            <RepositoryVisualizer />
          </div>
        </div>
      </section>

      {/* 가격 정책 섹션 */}
      <section id="pricing" className="w-full py-20 bg-gradient-to-br from-black to-gray-950">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-medium mb-3">
              <Users className="w-4 h-4 mr-2" />
              가격 정책
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              비즈니스 규모에 맞는 플랜 선택
            </h2>
            <p className="text-xl text-gray-400 max-w-[800px]">
              개인 개발자부터 대규모 조직까지 모두를 위한 유연한 가격 정책
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>개인 개발자를 위한 플랜</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-white">₩0</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">무료</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-red-500" />
                    <span className="text-gray-300">기본 저장소 분석</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-red-500" />
                    <span className="text-gray-300">월 200회 요청 제한</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-red-500" />
                    <span className="text-gray-300">일일 업데이트</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">시작하기</Button>
              </CardFooter>
            </Card>

            <Card className="relative border-red-600/30 bg-gradient-to-br from-gray-900 to-black shadow-xl shadow-red-900/5">
              <div className="absolute -top-5 left-0 right-0 mx-auto w-fit px-4 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium rounded-full">
                인기 선택
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>전문 개발자를 위한 플랜</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-white">₩19,000</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">월 구독</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-red-500" />
                    <span className="text-gray-300">고급 저장소 분석</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-red-500" />
                    <span className="text-gray-300">무제한 저장소</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-red-500" />
                    <span className="text-gray-300">실시간 업데이트</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-red-500" />
                    <span className="text-gray-300">코드 품질 분석</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Badge className="absolute top-4 right-4" variant="secondary">출시 예정</Badge>
                <Button className="w-full" disabled>곧 출시 예정</Button>
              </CardFooter>
            </Card>

            <Card className="relative">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>대규모 팀과 조직을 위한 플랜</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-white">맞춤형</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">문의 필요</p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-red-500" />
                    <span className="text-gray-300">맞춤형 통합</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-red-500" />
                    <span className="text-gray-300">전담 지원</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-red-500" />
                    <span className="text-gray-300">고급 분석</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 mr-2 text-red-500" />
                    <span className="text-gray-300">SLA 보장</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Badge className="absolute top-4 right-4" variant="secondary">출시 예정</Badge>
                <Button className="w-full" disabled>문의하기</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* 이용 방법 섹션 */}
      <section id="about" className="bg-black py-20">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-medium mb-3">
              <TrendingUp className="w-4 h-4 mr-2" />
              이용 안내
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              간단한 3단계로 시작하세요
            </h2>
            <p className="text-xl text-gray-400 max-w-[800px]">
              복잡한 설정 없이 빠르게 GitHub 저장소 분석을 시작할 수 있습니다
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-red-500 to-transparent md:block hidden"></div>
              <div className="bg-gradient-to-br from-red-500 to-red-700 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-red-500/20">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">GitHub 계정으로 로그인</h3>
              <p className="text-gray-400">간편한 GitHub OAuth를 통해 별도 회원가입 없이 즉시 서비스를 이용할 수 있습니다.</p>
            </div>
            
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-gradient-to-b from-red-500 to-transparent md:block hidden"></div>
              <div className="bg-gradient-to-br from-red-500 to-red-700 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-red-500/20">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">저장소 URL 입력</h3>
              <p className="text-gray-400">분석하고 싶은 GitHub 저장소의 URL을 입력하면 AI가 깊이 있는 분석을 시작합니다.</p>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-red-500 to-red-700 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-red-500/20">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">인사이트 확인</h3>
              <p className="text-gray-400">AI가 분석한 저장소의 목적, 기술 스택, 구조, 기능 등 다양한 인사이트를 확인하세요.</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link 
              href={user ? "/analyze" : "#"}
              onClick={() => !user && alert("로그인이 필요한 서비스입니다.")}
              className="inline-flex h-14 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-red-700 px-8 text-base font-medium text-white shadow-lg shadow-red-500/25 transition-all hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              지금 바로 시작하기
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 모바일 네비게이션 메뉴 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-gray-800 z-40">
        <div className="flex justify-around py-3">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-gray-400 hover:text-white flex flex-col items-center"
          >
            <Github className="h-5 w-5" />
            <span className="text-xs mt-1">홈</span>
          </button>
          <button 
            onClick={() => scrollToSection('features')}
            className="text-gray-400 hover:text-white flex flex-col items-center"
          >
            <Zap className="h-5 w-5" />
            <span className="text-xs mt-1">기능</span>
          </button>
          <button 
            onClick={() => scrollToSection('pricing')}
            className="text-gray-400 hover:text-white flex flex-col items-center"
          >
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">가격</span>
          </button>
          <button 
            onClick={() => scrollToSection('about')}
            className="text-gray-400 hover:text-white flex flex-col items-center"
          >
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs mt-1">소개</span>
          </button>
        </div>
      </div>

      {/* AI 챗봇 컴포넌트 - 모바일에서는 하단 네비바 위에 위치하도록 조정 */}
      <div className="md:block hidden">
        <AiChatBot />
      </div>
      <div className="md:hidden block">
        <div className="mb-16">
          <AiChatBot />
        </div>
      </div>

      {/* 푸터 */}
      <footer className="bg-black/80 backdrop-blur-sm border-t border-gray-800 py-12 md:mb-0 mb-16">
        <div className="container px-4 md:px-6 mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center mb-4">
                <Github className="h-6 w-6 text-red-500 mr-2" />
                <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-red-500">
                  flowit
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                AI 기반 GitHub 저장소 분석 서비스로 코드의 인사이트를 발견하세요.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-red-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-red-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-red-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">서비스</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">저장소 분석</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">API 키 관리</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">구조 시각화</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">팀 기여도 분석</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">회사</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">회사 소개</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">블로그</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">채용 정보</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">문의하기</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">법적 정보</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">이용약관</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">개인정보처리방침</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">쿠키 정책</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-red-500 transition-colors">라이선스</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; 2024 flowit github insight. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <p className="text-gray-500 text-sm">
                Powered by AI technology
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
