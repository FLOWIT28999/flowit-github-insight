'use client';

import { useEffect, useRef, useState } from 'react';
import { Code, FileCode, Folder, FolderOpen } from 'lucide-react';

/**
 * GitHub 저장소의 파일 구조를 시각화하는 인터랙티브 컴포넌트
 */
export default function RepositoryVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 샘플 저장소 구조 데이터
  const repoStructure = {
    name: 'project-root',
    type: 'folder',
    children: [
      {
        name: 'src',
        type: 'folder',
        children: [
          { name: 'components', type: 'folder', children: [
            { name: 'Button.tsx', type: 'file', language: 'tsx' },
            { name: 'Card.tsx', type: 'file', language: 'tsx' },
            { name: 'Header.tsx', type: 'file', language: 'tsx' },
          ]},
          { name: 'utils', type: 'folder', children: [
            { name: 'api.ts', type: 'file', language: 'ts' },
            { name: 'helpers.ts', type: 'file', language: 'ts' },
          ]},
          { name: 'App.tsx', type: 'file', language: 'tsx' },
          { name: 'main.tsx', type: 'file', language: 'tsx' },
        ]
      },
      {
        name: 'public',
        type: 'folder',
        children: [
          { name: 'index.html', type: 'file', language: 'html' },
          { name: 'favicon.ico', type: 'file', language: 'ico' },
        ]
      },
      { name: 'package.json', type: 'file', language: 'json' },
      { name: 'tsconfig.json', type: 'file', language: 'json' },
      { name: 'README.md', type: 'file', language: 'md' },
    ]
  };

  // 캔버스 애니메이션 효과
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // 노드와 연결선 그리기 변수
    const nodes: {x: number, y: number, size: number, speed: number, color: string}[] = [];
    const connections: {source: number, target: number}[] = [];

    // 노드 생성
    for (let i = 0; i < 20; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 0.5 + 0.1,
        color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 50)}, ${Math.floor(Math.random() * 50)}, 0.7)`
      });
    }

    // 연결선 생성
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < 3; j++) {
        const target = Math.floor(Math.random() * nodes.length);
        if (i !== target) {
          connections.push({ source: i, target });
        }
      }
    }

    // 애니메이션 함수
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 연결선 그리기
      ctx.lineWidth = 0.3;
      connections.forEach(conn => {
        const source = nodes[conn.source];
        const target = nodes[conn.target];
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          ctx.strokeStyle = `rgba(255, 50, 50, ${1 - distance / 150})`;
          ctx.beginPath();
          ctx.moveTo(source.x, source.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      });
      
      // 노드 이동 및 그리기
      nodes.forEach(node => {
        // 이동 로직
        node.x += node.speed * (Math.random() - 0.5);
        node.y += node.speed * (Math.random() - 0.5);
        
        // 경계 처리
        if (node.x < 0 || node.x > canvas.width) node.x = Math.random() * canvas.width;
        if (node.y < 0 || node.y > canvas.height) node.y = Math.random() * canvas.height;
        
        // 노드 그리기
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 폴더 구조 렌더링 함수
  const renderFolder = (item: any, depth = 0) => {
    const isFolder = item.type === 'folder';
    const indent = depth * 20; // 들여쓰기

    return (
      <div key={item.name} className="text-left">
        <div 
          className="flex items-center py-1 hover:bg-gray-800/50 rounded px-2 cursor-pointer" 
          style={{ marginLeft: `${indent}px` }}
        >
          {isFolder ? (
            item.isOpen ? <FolderOpen className="w-4 h-4 text-yellow-500 mr-2" /> : <Folder className="w-4 h-4 text-yellow-500 mr-2" />
          ) : (
            <FileCode className="w-4 h-4 text-blue-400 mr-2" />
          )}
          <span className={`text-sm ${isFolder ? 'text-gray-200 font-medium' : 'text-gray-400'}`}>
            {item.name}
          </span>
        </div>
        
        {isFolder && item.children && item.children.map((child: any) => renderFolder(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className={`bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl border border-gray-800 transition-all duration-500 overflow-hidden ${isExpanded ? 'h-[500px]' : 'h-[300px]'}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Code className="w-5 h-5 text-red-500 mr-2" />
          <h3 className="text-xl font-semibold text-white">저장소 구조 시각화</h3>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="text-sm text-gray-400 hover:text-red-400"
        >
          {isExpanded ? '접기' : '더보기'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[calc(100%-40px)]">
        {/* 좌측: 파일 트리 */}
        <div className="overflow-y-auto border border-gray-800 rounded-lg p-3 h-full bg-black/50">
          <div className="mb-2 flex items-center text-gray-300 text-sm">
            <FolderOpen className="w-4 h-4 text-yellow-500 mr-2" />
            <span>프로젝트 구조</span>
          </div>
          {renderFolder(repoStructure)}
        </div>
        
        {/* 우측: 시각화 캔버스 */}
        <div className="border border-gray-800 rounded-lg overflow-hidden h-full">
          <canvas ref={canvasRef} className="w-full h-full"></canvas>
        </div>
      </div>
    </div>
  );
} 