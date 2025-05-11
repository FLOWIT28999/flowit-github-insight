'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

/**
 * API 키 타입 정의
 */
interface ApiKey {
  id: string;
  name: string;
  key: string;
  value: string;
  limit: number;
  used: number;
  created_at: string;
  is_active: boolean;
  last_used_at: string | null;
}

/**
 * API 키 관리 페이지 컴포넌트
 */
export default function ApiKeysPage() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * 사용자의 API 키 목록을 가져오는 함수
   */
  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setKeys(data || []);
    } catch (err) {
      console.error('API 키 불러오기 오류:', err);
      setError('API 키를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 새 API 키를 생성하는 함수
   */
  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      setError('API 키 이름을 입력해주세요.');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      
      // API 키 생성 요청
      const response = await fetch('/api/create-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newKeyName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '키 생성 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      
      // 성공 메시지 설정 및 목록 갱신
      setSuccessMessage(`API 키가 생성되었습니다: ${data.value}`);
      setNewKeyName('');
      fetchApiKeys();
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: any) {
      console.error('API 키 생성 오류:', err);
      setError(err.message || 'API 키 생성 중 오류가 발생했습니다.');
    } finally {
      setCreating(false);
    }
  };

  /**
   * API 키 비활성화 함수
   */
  const deactivateKey = async (keyId: string) => {
    try {
      setError(null);
      const { error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setSuccessMessage('API 키가 비활성화되었습니다.');
      fetchApiKeys();
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('API 키 비활성화 오류:', err);
      setError('API 키 비활성화 중 오류가 발생했습니다.');
    }
  };

  // 컴포넌트 마운트 시 API 키 목록 가져오기
  useEffect(() => {
    if (user) {
      fetchApiKeys();
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">API 키 관리</h1>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* 성공 메시지 */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {/* 새 API 키 생성 폼 */}
      <div className="bg-card border rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">새 API 키 생성</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="API 키 이름"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
            disabled={creating}
          />
          <button
            onClick={createApiKey}
            disabled={creating || !newKeyName.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
          >
            {creating ? '생성 중...' : '생성하기'}
          </button>
        </div>
      </div>
      
      {/* API 키 목록 */}
      <div className="bg-card border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">API 키 목록</h2>
        
        {loading ? (
          <p className="text-center py-4">로딩 중...</p>
        ) : keys.length === 0 ? (
          <p className="text-center py-4 text-gray-500">생성된 API 키가 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-4 py-2">이름</th>
                  <th className="px-4 py-2">API 키</th>
                  <th className="px-4 py-2">사용량</th>
                  <th className="px-4 py-2">상태</th>
                  <th className="px-4 py-2">생성일</th>
                  <th className="px-4 py-2">작업</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr key={key.id} className="border-b">
                    <td className="px-4 py-2">{key.name}</td>
                    <td className="px-4 py-2">
                      <span className="font-mono">{key.key}...{key.value.substring(key.value.length - 4)}</span>
                    </td>
                    <td className="px-4 py-2">
                      {key.used} / {key.limit}
                    </td>
                    <td className="px-4 py-2">
                      {key.is_active ? (
                        <span className="text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">활성</span>
                      ) : (
                        <span className="text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs">비활성</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(key.created_at).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-2">
                      {key.is_active && (
                        <button
                          onClick={() => deactivateKey(key.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          비활성화
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 