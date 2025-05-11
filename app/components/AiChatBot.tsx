'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Minimize, Maximize, User, ChevronDown, ChevronRight } from 'lucide-react';

/**
 * AI 챗봇 인터페이스 컴포넌트
 * 저장소에 대한 질문을 할 수 있는 챗봇 기능 제공
 */
export default function AiChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState<Array<{role: string, content: string, timestamp: Date}>>([
    {
      role: 'assistant',
      content: '안녕하세요! GitHub 저장소 분석에 대해 어떤 질문이 있으신가요?',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // 대화 내역 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  // 제안 질문들
  const suggestions = [
    "어떤 기술 스택이 사용되었나요?",
    "이 저장소의 주요 기능은 무엇인가요?",
    "코드 구조를 설명해주세요.",
    "이슈나 PR 패턴을 분석해주세요."
  ];

  // 메시지 전송 처리
  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // 사용자 메시지 추가
    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    setConversation([...conversation, userMessage]);
    setMessage('');
    setIsTyping(true);
    setShowSuggestions(false);
    
    // AI 응답 시뮬레이션 (실제로는 API 호출)
    setTimeout(() => {
      let response;
      if (message.includes('기술') || message.includes('스택')) {
        response = "이 저장소는 React, Next.js, TypeScript, TailwindCSS를 주요 기술 스택으로 사용하고 있으며, Supabase를 백엔드로 활용하고 있습니다. GitHub API를 통해 저장소 데이터를 가져오는 구조입니다.";
      } else if (message.includes('기능')) {
        response = "이 프로젝트는 GitHub 저장소 분석, 코드 구조 시각화, 기술 스택 탐지, 코드 품질 평가, API 키 관리 기능을 제공합니다.";
      } else if (message.includes('구조') || message.includes('아키텍처')) {
        response = "이 프로젝트는 Next.js의 App Router를 사용한 구조로, 페이지 컴포넌트, 재사용 가능한 UI 컴포넌트, API 처리를 위한 유틸리티 함수로 구성되어 있습니다. Supabase를 통한 인증 및 데이터 저장 기능이 구현되어 있습니다.";
      } else {
        response = "해당 질문에 대한 정확한 답변을 위해 더 자세한 정보가 필요합니다. 특정 기술, 기능, 구조에 대해 물어보시면 더 정확한 정보를 제공해 드릴 수 있습니다.";
      }
      
      setConversation(prev => [...prev, { role: 'assistant', content: response, timestamp: new Date() }]);
      setIsTyping(false);
    }, 1500);
  };

  // 제안 질문 클릭 처리
  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    handleSendMessage();
  };

  // 타임스탬프 포맷팅
  const formatTime = (date: Date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-all z-30"
      >
        <Bot className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 z-30 ${
      isMinimized ? 'w-64 h-14' : 'w-80 sm:w-96 h-[500px]'
    }`}>
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-red-900 to-red-700 p-3 flex justify-between items-center cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center">
          <Bot className="h-5 w-5 text-white mr-2" />
          <h3 className="font-semibold text-white">GitHub 인사이트 AI</h3>
        </div>
        <div className="flex gap-2">
          {isMinimized ? (
            <Maximize className="h-4 w-4 text-white opacity-70 hover:opacity-100" />
          ) : (
            <Minimize className="h-4 w-4 text-white opacity-70 hover:opacity-100" />
          )}
          <X 
            className="h-4 w-4 text-white opacity-70 hover:opacity-100" 
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* 대화 내역 */}
          <div className="flex-1 overflow-y-auto p-4 h-[calc(100%-110px)] bg-gray-950">
            {conversation.map((msg, idx) => (
              <div key={idx} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg p-3 max-w-[80%] ${
                  msg.role === 'user' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-800 text-gray-200'
                }`}>
                  <div className="flex items-start mb-1">
                    {msg.role === 'assistant' && <Bot className="h-4 w-4 mr-1 mt-0.5" />}
                    {msg.role === 'user' && <User className="h-4 w-4 mr-1 mt-0.5" />}
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <p className="text-xs opacity-70 text-right">{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="mb-4 flex justify-start">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 제안 질문 */}
          {showSuggestions && conversation.length <= 1 && (
            <div className="p-3 border-t border-gray-800 bg-black/30">
              <div 
                className="flex items-center text-xs text-gray-400 mb-2 cursor-pointer" 
                onClick={() => setShowSuggestions(!showSuggestions)}
              >
                {showSuggestions ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span>제안 질문</span>
              </div>
              {showSuggestions && (
                <div className="grid grid-cols-1 gap-2">
                  {suggestions.map((suggestion, idx) => (
                    <button 
                      key={idx} 
                      className="text-left text-sm bg-gray-800 hover:bg-gray-700 p-2 rounded-md text-gray-300 truncate"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 입력 필드 */}
          <div className="p-3 border-t border-gray-800 bg-black/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="메시지를 입력하세요..."
                className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-500 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
                className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 