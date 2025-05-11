import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Github, Menu, X, User, LogOut, BarChart, Key } from 'lucide-react';
import LoginButton from './LoginButton';
import Image from 'next/image';

/**
 * 웹사이트 상단 헤더 컴포넌트
 * 네비게이션 및 사용자 인증 상태 표시
 */
export default function Header() {
  const { user, signOut, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 스크롤 이벤트 처리
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 로그아웃 처리
  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  // 스크롤 여부에 따른 헤더 스타일 변경
  const headerClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    isScrolled 
      ? 'bg-black/80 backdrop-blur-md shadow-md py-3' 
      : 'bg-transparent py-5'
  }`;

  return (
    <header className={headerClasses}>
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <Github className="h-6 w-6 text-red-500" />
            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-white to-red-500">
              flowit
            </span>
            <span className="text-white font-bold">github</span>
            <span className="text-red-500 font-bold">insight</span>
          </Link>

          {/* 데스크톱 메뉴 */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              홈
            </Link>
            <Link href="/features" className="text-gray-300 hover:text-white transition-colors">
              기능
            </Link>
            <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
              가격
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
              소개
            </Link>
          </nav>

          {/* 인증 상태 표시 */}
          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
            ) : user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 bg-gray-900 bg-opacity-50 hover:bg-opacity-80 px-3 py-2 rounded-lg transition-all"
                >
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
                  <span className="text-gray-300">{user.user_metadata?.user_name || user.email}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md bg-gray-900 border border-gray-800 shadow-lg py-1 z-50">
                    <Link 
                      href="/analyze" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <BarChart className="w-4 h-4" />
                      저장소 분석
                    </Link>
                    <Link 
                      href="/api-keys" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Key className="w-4 h-4" />
                      API 키 관리
                    </Link>
                    <hr className="border-gray-800 my-1" />
                    <button 
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-800 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <LoginButton />
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button 
            className="md:hidden text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 border-t border-gray-800 mt-2">
          <div className="container px-4 py-4">
            <nav className="flex flex-col gap-4">
              <Link 
                href="/" 
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                홈
              </Link>
              <Link 
                href="/features" 
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                기능
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                가격
              </Link>
              <Link 
                href="/about" 
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                소개
              </Link>
              
              <hr className="border-gray-800 my-2" />

              {loading ? (
                <div className="w-full py-4 flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
                </div>
              ) : user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 py-2">
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
                    <span className="text-gray-300">{user.user_metadata?.user_name || user.email}</span>
                  </div>
                  <Link 
                    href="/analyze" 
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <BarChart className="w-4 h-4" />
                    저장소 분석
                  </Link>
                  <Link 
                    href="/api-keys" 
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Key className="w-4 h-4" />
                    API 키 관리
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors py-2 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </div>
              ) : (
                <div className="py-2">
                  <LoginButton />
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
} 