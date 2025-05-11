'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';
import { Database, Plus, RefreshCw } from 'lucide-react';
import Notification from '@/app/components/Notification';
import ApiKeysTable from '@/app/components/ApiKeysTable';
import CreateApiKeyModal from '@/app/components/CreateApiKeyModal';
import EditApiKeyModal from '@/app/components/EditApiKeyModal';

// API 키 인터페이스 정의
interface ApiKey {
  id: string;
  name: string;
  value: string;
  created_at: string;
  usage: number;
  limit: number;
}

// 알림 인터페이스 정의
interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

/**
 * API 키 관리 페이지 컴포넌트
 * API 키를 생성, 조회, 수정, 삭제할 수 있는 관리 인터페이스
 */
export default function ApiKeysPage() {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isApiKeysLoading, setIsApiKeysLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [notification, setNotification] = useState<NotificationProps | null>(null);

  // 레이아웃에서 이미 로그인 체크를 하므로 user는 항상 있다고 가정
  if (!user) return null;

  // 사용자 로그인 시 API 키 데이터 가져오기
  useEffect(() => {
    if (user) {
      console.log('사용자 로그인 확인됨, API 키 데이터 요청 준비');
      // 약간의 지연을 두어 세션이 완전히 설정되도록 함
      const timer = setTimeout(() => {
        fetchApiKeysData();
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      console.log('사용자가 로그인되어 있지 않음');
    }
  }, [user]);

  /**
   * API 키 데이터를 가져오는 함수
   */
  const fetchApiKeysData = async () => {
    try {
      setIsApiKeysLoading(true);
      console.log('API 키 데이터 요청 시작');
      
      const response = await fetch('/api/api-keys', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        credentials: 'include', // 쿠키 포함
      });
      
      console.log('API 응답 상태:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('응답 텍스트:', errorText);
        
        const errorData = errorText ? JSON.parse(errorText) : {};
        throw new Error(errorData.error || `API 오류: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API 키 데이터 수신:', data.length, '개');
      
      setApiKeys(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('API 키 가져오기 오류:', error);
      showNotification(`API 키를 가져오는데 실패했습니다: ${error.message}`, 'error');
    } finally {
      setIsApiKeysLoading(false);
    }
  };

  /**
   * 알림 메시지를 표시하는 함수
   */
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    setNotification({ message, type });
    // 3초 후 알림 닫기
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  /**
   * API 키 생성 처리 함수
   */
  const handleCreateApiKey = async (name: string, limit: number) => {
    try {
      console.log('API 키 생성 요청 시작:', { name, limit });
      
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({ name, limit })
      });
      
      console.log('API 응답 상태:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('응답 텍스트:', errorText);
        
        const errorData = errorText ? JSON.parse(errorText) : {};
        throw new Error(errorData.error || `API 오류: ${response.status} ${response.statusText}`);
      }
      
      const newKey = await response.json();
      console.log('새 API 키 생성됨:', newKey.id);
      
      setApiKeys([newKey, ...apiKeys]);
      setIsCreateModalOpen(false);
      showNotification('API 키가 성공적으로 생성되었습니다');
    } catch (error) {
      console.error('API 키 생성 오류:', error);
      showNotification(`API 키 생성에 실패했습니다: ${error.message}`, 'error');
    }
  };

  /**
   * API 키 업데이트 처리 함수
   */
  const handleUpdateApiKey = async (updatedKey: ApiKey) => {
    try {
      const response = await fetch(`/api/api-keys/${updatedKey.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({ name: updatedKey.name, limit: updatedKey.limit })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'API 키 업데이트에 실패했습니다');
      }
      
      const updated = await response.json();
      const updatedKeys = apiKeys.map(key => 
        key.id === updatedKey.id ? updated : key
      );
      
      setApiKeys(updatedKeys);
      setEditingKey(null);
      showNotification('API 키가 성공적으로 업데이트되었습니다');
    } catch (error) {
      console.error('API 키 업데이트 오류:', error);
      showNotification('API 키 업데이트에 실패했습니다', 'error');
    }
  };

  /**
   * API 키 삭제 처리 함수
   */
  const handleDeleteApiKey = async (id: string) => {
    try {
      const response = await fetch(`/api/api-keys/${id}`, {
        method: 'DELETE',
        credentials: 'include', // 쿠키 포함
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'API 키 삭제에 실패했습니다');
      }
      
      const updatedKeys = apiKeys.filter(key => key.id !== id);
      setApiKeys(updatedKeys);
      showNotification('API 키가 성공적으로 삭제되었습니다');
    } catch (error) {
      console.error('API 키 삭제 오류:', error);
      showNotification('API 키 삭제에 실패했습니다', 'error');
    }
  };

  /**
   * API 키를 클립보드에 복사하는 함수
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification('API 키가 클립보드에 복사되었습니다');
    } catch (err) {
      console.error('클립보드 복사 오류:', err);
      showNotification('API 키 복사에 실패했습니다. 다시 시도해주세요.', 'error');
    }
  };

  return (
    <>
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">API 키 관리</h1>
        <p className="text-gray-400">API 키를 생성하고 관리하여 외부 시스템과 연동하세요.</p>
      </div>

      {/* 알림 표시 */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* API 사용량 표시 */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-red-900/30 via-red-800/20 to-red-900/30 text-white mb-8 border border-red-700/30">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <span className="text-sm font-medium mb-2 sm:mb-0">현재 요금제</span>
          <button className="bg-red-500 bg-opacity-30 hover:bg-opacity-40 text-white text-sm px-4 py-1.5 rounded-lg transition-colors">
            요금제 관리
          </button>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">GitHub Insight API</h2>
        <div>
          <span className="text-sm font-medium">API 사용량</span>
          <div className="w-full bg-white bg-opacity-10 rounded-full h-2 mt-2">
            <div
              className="bg-red-500 h-2 rounded-full"
              style={{
                width: `${Math.min(100, (apiKeys.reduce((sum, key) => sum + (key.usage || 0), 0) / apiKeys.reduce((sum, key) => sum + key.limit, 1)) * 100)}%`
              }}
            ></div>
          </div>
          <span className="text-sm mt-1 inline-block">
            {apiKeys.reduce((sum, key) => sum + (key.usage || 0), 0)} / {apiKeys.reduce((sum, key) => sum + key.limit, 0)} 요청
          </span>
        </div>
      </div>

      {/* API 키 섹션 */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2 sm:mb-0">API 키</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => fetchApiKeysData()}
              className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden md:inline">새로고침</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              새 API 키 생성
            </button>
          </div>
        </div>
        
        <p className="text-gray-400 mb-6">
          API 키는 API 요청 시 인증을 위해 사용됩니다. 더 자세한 내용은 문서를 참조하세요.
        </p>
        
        {isApiKeysLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : apiKeys.length > 0 ? (
          <div className="overflow-x-auto">
            <ApiKeysTable 
              apiKeys={apiKeys.map(key => ({
                id: key.id,
                name: key.name,
                key: key.value,
                created: new Date(key.created_at).toLocaleDateString(),
                usage: key.usage,
                limit: key.limit
              }))}
              onEdit={setEditingKey}
              onDelete={handleDeleteApiKey}
              onCopy={copyToClipboard}
            />
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-gray-700 rounded-lg">
            <Database className="mx-auto h-12 w-12 text-gray-500 mb-3" />
            <p className="text-gray-400 mb-3">아직 생성된 API 키가 없습니다.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              새 API 키 생성
            </button>
          </div>
        )}
      </div>

      {/* API 키 사용 안내 */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl p-6 shadow-xl mb-8">
        <h2 className="text-xl font-bold text-white mb-4">API 키 사용 방법</h2>
        <div className="text-gray-400 space-y-4">
          <p>
            API 요청 시 인증 헤더에 API 키를 포함하여 요청합니다:
          </p>
          <div className="bg-black/50 p-4 rounded-lg font-mono text-sm text-gray-300">
            <p>curl -H "Authorization: Bearer YOUR_API_KEY" \</p>
            <p>  https://api.flowit-github-insight.io/v1/analyze</p>
          </div>
          <p>
            더 자세한 사용법은 <Link href="#" className="text-red-500 hover:text-red-400">API 문서</Link>를 참조하세요.
          </p>
        </div>
      </div>

      {/* 모달 컴포넌트 */}
      <CreateApiKeyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateApiKey}
      />

      <EditApiKeyModal
        apiKey={editingKey}
        isOpen={!!editingKey}
        onClose={() => setEditingKey(null)}
        onUpdate={handleUpdateApiKey}
      />
    </>
  );
} 