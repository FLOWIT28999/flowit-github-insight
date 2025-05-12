'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * API 키 수정 모달 컴포넌트
 * 사용자가 기존 API 키의 정보를 수정할 수 있는 인터페이스 제공
 */
export default function EditApiKeyModal({ apiKey, isOpen, onClose, onUpdate }) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // API 키 정보가 변경될 때 폼 업데이트
  useEffect(() => {
    if (apiKey) {
      setName(apiKey.name || '');
    }
  }, [apiKey]);

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
    
    try {
      setIsLoading(true);
      setError('');
      
      await onUpdate({
        ...apiKey,
        name: name.trim()
      });
    } catch (error) {
      setError('API 키 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 모달이 닫혀있으면 아무것도 렌더링하지 않음
  if (!isOpen || !apiKey) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">API 키 수정</h2>
          <button 
            onClick={onClose}
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
            <label htmlFor="edit-key-name" className="block text-sm font-medium text-gray-300 mb-1">
              API 키 이름
            </label>
            <input
              type="text"
              id="edit-key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="API 키 이름"
              className="w-full p-3 bg-black/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="font-medium">API 키:</span>
              <span className="font-mono">{apiKey.key}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
              <span className="font-medium">생성일:</span>
              <span>{apiKey.created}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
              <span className="font-medium">사용량:</span>
              <span>{apiKey.usage} / {apiKey.limit}</span>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
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
              {isLoading ? '저장 중...' : '변경사항 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 