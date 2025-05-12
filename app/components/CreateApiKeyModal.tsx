'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

/**
 * API 키 생성 모달 컴포넌트
 * 사용자가 새 API 키를 생성할 수 있는 인터페이스 제공
 */
export default function CreateApiKeyModal({ isOpen, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('1000');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * 폼 제출 처리 함수
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!name.trim()) {
      setError('API 키 이름을 입력해주세요.');
      return;
    }
    
    if (!limit || isNaN(parseInt(limit)) || parseInt(limit) <= 0) {
      setError('유효한 사용량 제한을 입력해주세요.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      await onCreate(name, limit);
      // 성공적으로 생성 후 폼 초기화
      setName('');
      setLimit('1000');
    } catch (error) {
      setError('API 키 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 모달 닫기 전 상태 초기화
   */
  const handleClose = () => {
    setName('');
    setLimit('1000');
    setError('');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">새 API 키 생성</h2>
          <button 
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-900/50 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="key-name" className="block text-sm font-medium text-gray-300 mb-1">
              API 키 이름
            </label>
            <input
              type="text"
              id="key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="프로덕션 API 키"
              className="w-full p-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              이 API 키의 용도를 식별할 수 있는 이름을 입력하세요.
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="key-limit" className="block text-sm font-medium text-gray-300 mb-1">
              사용량 제한 (API 호출 수)
            </label>
            <input
              type="number"
              id="key-limit"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              min="1"
              className="w-full p-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              이 API 키로 허용되는 최대 API 호출 횟수입니다.
            </p>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
              disabled={isLoading}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? '생성 중...' : 'API 키 생성'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 