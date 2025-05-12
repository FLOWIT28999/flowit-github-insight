'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Trash2, AlertCircle, Code } from 'lucide-react';

/**
 * 분석 기록 페이지 컴포넌트
 * 사용자가 이전에 분석한 GitHub 저장소 기록을 보여줌
 */
export default function HistoryPage() {
  const { user } = useAuth();
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  // 페이지 로드 시 분석 기록 가져오기
  useEffect(() => {
    if (user) {
      fetchAnalysisHistory();
    }
  }, [user]);

  /**
   * 분석 기록을 가져오는 함수
   * API를 호출하여 분석 기록 가져옴
   */
  const fetchAnalysisHistory = async () => {
    setIsLoading(true);
    try {
      // 실제 API 호출
      const response = await fetch('/api/history');
      if (!response.ok) {
        throw new Error('분석 기록을 가져오는데 실패했습니다');
      }
      
      const data = await response.json();
      setAnalysisHistory(data);
      setIsLoading(false);
    } catch (error) {
      console.error('분석 기록 불러오기 오류:', error);
      setIsLoading(false);
      // 임시 데이터는 제거하고 에러 시 빈 배열 설정
      setAnalysisHistory([]);
    }
  };

  /**
   * 기록을 삭제하기 전 확인 요청 함수
   */
  const handleDeleteConfirm = (id) => {
    setConfirmDelete(id);
    // 5초 후 확인 요청 자동 취소
    setTimeout(() => {
      setConfirmDelete(null);
    }, 5000);
  };

  /**
   * 분석 기록 삭제 함수
   */
  const handleDelete = async (id) => {
    try {
      // 실제 API 호출
      const response = await fetch(`/api/history?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('기록 삭제에 실패했습니다');
      }
      
      // 삭제 성공 시 목록에서 제거
      const updatedHistory = analysisHistory.filter(item => item.id !== id);
      setAnalysisHistory(updatedHistory);
      setConfirmDelete(null);
    } catch (error) {
      console.error('기록 삭제 오류:', error);
    }
  };

  /**
   * 검색어에 따른 필터링된 기록 반환 함수
   */
  const filteredHistory = searchTerm.trim()
    ? analysisHistory.filter(item => 
        item.repoName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : analysisHistory;

  /**
   * 상대적 시간 표시 함수
   */
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '오늘';
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}주 전`;
    } else {
      return `${Math.floor(diffDays / 30)}개월 전`;
    }
  };

  return (
    <>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">분석 기록</h1>
        <p className="text-gray-400">이전에 분석한 GitHub 저장소 기록을 확인하세요.</p>
      </div>
      
      {/* 검색 및 필터 */}
      <div className="mb-6">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="저장소 이름으로 검색..."
            className="w-full p-3 pl-10 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
        </div>
      </div>
      
      {/* 분석 기록 목록 */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mb-4"></div>
          <p className="text-white text-lg">분석 기록을 불러오는 중...</p>
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <div key={item.id} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-4 shadow-xl hover:border-red-500/30 transition-all">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative w-12 h-12 sm:w-16 sm:h-16 overflow-hidden rounded-lg flex-shrink-0">
                  <Image 
                    src={item.avatarUrl || 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'} 
                    alt={item.repoName} 
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-white">{item.repoOwner}/{item.repoName}</h3>
                    <div className="flex gap-2 items-center text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-full">
                      <Code className="w-3 h-3" />
                      <span>{item.language || '언어 정보 없음'}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {getRelativeTime(item.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                    {item.description || '저장소 설명 없음'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.topics && item.topics.split(',').map(topic => (
                      <span key={topic} className="bg-red-900/30 text-red-300 text-xs px-2 py-1 rounded-full">
                        {topic.trim()}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex flex-col xs:flex-row gap-2">
                    <Link 
                      href={`/dashboard/results/${item.repoOwner}/${item.repoName}`}
                      className="inline-block bg-gradient-to-r from-red-700 to-red-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-800 transition-colors"
                    >
                      분석 결과 보기
                    </Link>
                    
                    {confirmDelete === item.id ? (
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                      >
                        <AlertCircle className="w-4 h-4" />
                        삭제 확인
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleDeleteConfirm(item.id)}
                        className="inline-flex items-center gap-1 bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl">
          <AlertCircle className="mx-auto w-12 h-12 text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">분석 기록이 없습니다</h3>
          <p className="text-gray-400 mb-6">아직 GitHub 저장소를 분석하지 않았습니다.</p>
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