'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';

/**
 * 간단한 토스트 알림 컴포넌트
 */
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div 
      className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg flex items-center ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
      }`}
    >
      <span className="text-white">{message}</span>
      <button 
        onClick={onClose} 
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
      >
        ✕
      </button>
    </div>
  );
}

/**
 * 사용자 설정 페이지 컴포넌트
 * 계정, 알림, 테마 등의 사용자 설정을 관리
 */
export default function SettingsPage() {
  const { user, updateUserMetadata } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);
  
  // 사용자 설정 상태
  const [settings, setSettings] = useState({
    darkMode: true, // 기본값은 다크모드
    emailNotifications: user?.user_metadata?.emailNotifications ?? true,
    weeklyReport: user?.user_metadata?.weeklyReport ?? false,
    language: user?.user_metadata?.language || 'ko',
  });

  /**
   * 토스트 알림 표시 함수
   */
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
  };

  /**
   * 토스트 알림 닫기 함수
   */
  const closeToast = () => {
    setToast(null);
  };

  /**
   * 설정 변경 처리 함수
   * @param setting 변경할 설정 키
   * @param value 변경할 값
   */
  const handleSettingChange = (setting: string, value: any) => {
    setSettings({
      ...settings,
      [setting]: value,
    });
  };

  /**
   * 설정 저장 처리 함수
   */
  const saveSettings = async () => {
    try {
      setIsUpdating(true);
      
      // 사용자 메타데이터 업데이트
      await updateUserMetadata({
        emailNotifications: settings.emailNotifications,
        weeklyReport: settings.weeklyReport,
        language: settings.language,
      });
      
      showToast('설정이 성공적으로 저장되었습니다.', 'success');
    } catch (error) {
      console.error('설정 저장 중 오류 발생:', error);
      showToast('설정 저장 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* 토스트 알림 */}
      {toast && toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}

      <div>
        <h1 className="text-3xl font-bold text-white mb-2">설정</h1>
        <p className="text-gray-400">사용자 계정 및 앱 설정을 관리합니다.</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-800 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('account')}
            className={`py-2 px-4 focus:outline-none ${
              activeTab === 'account'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            계정
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-4 focus:outline-none ${
              activeTab === 'notifications'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            알림
          </button>
          <button
            onClick={() => setActiveTab('appearance')}
            className={`py-2 px-4 focus:outline-none ${
              activeTab === 'appearance'
                ? 'text-red-500 border-b-2 border-red-500'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            모양
          </button>
        </div>
      </div>

      {/* 계정 탭 내용 */}
      {activeTab === 'account' && (
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 shadow-xl">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">계정 정보</h2>
            <p className="text-gray-400 text-sm">계정에 관한 기본 정보를 확인합니다.</p>
          </div>
          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-300">이메일</label>
              <div className="text-gray-300 p-2 bg-gray-950 rounded-md border border-gray-800">
                {user.email}
              </div>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-300">사용자명</label>
              <div className="text-gray-300 p-2 bg-gray-950 rounded-md border border-gray-800">
                {user.user_metadata?.user_name || '설정되지 않음'}
              </div>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-300">계정 생성일</label>
              <div className="text-gray-300 p-2 bg-gray-950 rounded-md border border-gray-800">
                {new Date(user.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 알림 탭 내용 */}
      {activeTab === 'notifications' && (
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 shadow-xl">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">알림 설정</h2>
            <p className="text-gray-400 text-sm">알림 수신 여부와 방식을 설정합니다.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-300">이메일 알림</label>
                <p className="text-sm text-gray-400">새로운 분석 결과와 업데이트에 대한 이메일을 받습니다.</p>
              </div>
              <div className="relative inline-block">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="sr-only"
                />
                <div 
                  onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.emailNotifications ? 'bg-red-600' : 'bg-gray-700'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                      settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} 
                    style={{marginTop: '2px'}}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="weeklyReport" className="text-sm font-medium text-gray-300">주간 리포트</label>
                <p className="text-sm text-gray-400">일주일 동안의 분석 요약을 이메일로 받습니다.</p>
              </div>
              <div className="relative inline-block">
                <input
                  type="checkbox"
                  id="weeklyReport"
                  checked={settings.weeklyReport}
                  onChange={(e) => handleSettingChange('weeklyReport', e.target.checked)}
                  className="sr-only"
                />
                <div 
                  onClick={() => handleSettingChange('weeklyReport', !settings.weeklyReport)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.weeklyReport ? 'bg-red-600' : 'bg-gray-700'
                  }`}
                >
                  <div 
                    className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                      settings.weeklyReport ? 'translate-x-6' : 'translate-x-1'
                    }`} 
                    style={{marginTop: '2px'}}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 화면 설정 탭 내용 */}
      {activeTab === 'appearance' && (
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg p-6 shadow-xl">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white">화면 설정</h2>
            <p className="text-gray-400 text-sm">어플리케이션의 외관과 테마를 설정합니다.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="darkMode" className="text-sm font-medium text-gray-300">다크 모드</label>
                <p className="text-sm text-gray-400">어두운 테마를 사용합니다. (현재는 다크모드만 지원)</p>
              </div>
              <div className="relative inline-block">
                <input
                  type="checkbox"
                  id="darkMode"
                  checked={settings.darkMode}
                  disabled={true}
                  className="sr-only"
                />
                <div className="w-12 h-6 bg-red-600 rounded-full">
                  <div className="w-5 h-5 bg-white rounded-full transform translate-x-6" style={{marginTop: '2px'}} />
                </div>
              </div>
            </div>
            
            <div className="grid gap-2">
              <label className="text-sm font-medium text-gray-300">언어</label>
              <select
                className="p-2 rounded-md bg-gray-950 border border-gray-800 text-gray-300"
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                disabled={true} // 현재는 한국어만 지원
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
              </select>
              <p className="text-xs text-gray-500">현재는 한국어만 지원합니다.</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={isUpdating}
          className={`px-4 py-2 rounded-md text-white font-medium focus:outline-none transition-colors ${
            isUpdating 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {isUpdating ? '저장 중...' : '설정 저장'}
        </button>
      </div>
    </div>
  );
} 