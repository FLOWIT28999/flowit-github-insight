'use client';

import { Copy, Edit, Trash, Check } from 'lucide-react';
import { useState } from 'react';

/**
 * API 키 목록을 표시하는 테이블 컴포넌트
 * 각 API 키에 대한 정보와 관리 기능(수정, 복사, 삭제) 제공
 */
export default function ApiKeysTable({ apiKeys, onEdit, onDelete, onCopy }) {
  const [copiedId, setCopiedId] = useState(null);
  
  /**
   * API 키 복사 처리 함수
   * 복사 후 시각적 피드백 제공
   */
  const handleCopy = (id, key) => {
    onCopy(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  /**
   * API 키 마스킹 처리 함수
   * 앞 8자리와 뒤 4자리만 표시
   */
  const maskApiKey = (key) => {
    if (!key) return '';
    const firstPart = key.slice(0, 8);
    const lastPart = key.slice(-4);
    return `${firstPart}${'•'.repeat(8)}${lastPart}`;
  };

  return (
    <div className="overflow-hidden rounded-lg bg-gray-900/50 border border-gray-800">
      <table className="min-w-full divide-y divide-gray-800">
        <thead className="bg-gray-900/70">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              이름
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              API 키
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              생성일
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              사용량
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
              작업
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {apiKeys.map((apiKey) => (
            <tr key={apiKey.id} className="hover:bg-gray-800/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                {apiKey.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-300">
                {maskApiKey(apiKey.key)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {apiKey.created}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                <div className="flex flex-col">
                  <span>{apiKey.usage} / {apiKey.limit}</span>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1.5">
                    <div 
                      className="bg-red-500 h-1.5 rounded-full" 
                      style={{ width: `${Math.min(100, (apiKey.usage / apiKey.limit) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleCopy(apiKey.id, apiKey.key)}
                    className="p-1.5 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                    title="API 키 복사"
                  >
                    {copiedId === apiKey.id ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => onEdit(apiKey)}
                    className="p-1.5 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                    title="API 키 수정"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('이 API 키를 삭제하시겠습니까?')) {
                        onDelete(apiKey.id);
                      }
                    }}
                    className="p-1.5 rounded-full hover:bg-red-800/50 transition-colors text-gray-400 hover:text-red-300"
                    title="API 키 삭제"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 