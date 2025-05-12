'use client';

import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { useEffect } from 'react';

/**
 * 알림 메시지를 표시하는 컴포넌트
 * 성공, 오류 상태에 따라 다른 스타일과 아이콘 표시
 */
export default function Notification({ message, type = 'success', onClose, duration = 5000 }) {
  // 알림이 자동으로 사라지는 타이머 설정
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // 타입에 따른 스타일과 아이콘 결정
  const styles = {
    success: {
      container: "bg-green-900/30 border-green-700/50 text-green-300",
      icon: <CheckCircle className="w-5 h-5 text-green-500" />
    },
    error: {
      container: "bg-red-900/30 border-red-700/50 text-red-300",
      icon: <AlertCircle className="w-5 h-5 text-red-500" />
    },
    warning: {
      container: "bg-yellow-900/30 border-yellow-700/50 text-yellow-300",
      icon: <AlertCircle className="w-5 h-5 text-yellow-500" />
    },
    info: {
      container: "bg-blue-900/30 border-blue-700/50 text-blue-300",
      icon: <AlertCircle className="w-5 h-5 text-blue-500" />
    }
  };
  
  const style = styles[type] || styles.info;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm animate-slide-in-right ${style.container} rounded-lg border p-4 shadow-lg`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {style.icon}
        </div>
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-4 p-1 rounded-full hover:bg-gray-800/30 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 