'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { LogOut } from 'lucide-react';

/**
 * 사용자 프로필 컴포넌트
 * 로그인한 사용자의 정보를 표시하고 로그아웃 기능 제공
 */
export default function UserProfile() {
  const { user, signOut } = useAuth();
  const { data: session } = useSession();

  // 인증된 사용자가 없을 경우 null 반환
  if (!user && !session?.user) return null;

  // 환경에 따라 사용자 정보 설정 (NextAuth 또는 Supabase)
  const userInfo = user || session?.user;
  const userName = user?.user_metadata?.user_name || user?.email || session?.user?.name || session?.user?.email;
  const avatarUrl = user?.user_metadata?.avatar_url || session?.user?.image;

  return (
    <div className="flex items-center gap-4">
      {avatarUrl && (
        <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-red-500">
          <Image
            src={avatarUrl}
            alt={userName || '프로필 이미지'}
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>
      )}
      <div>
        <p className="font-medium text-sm text-gray-200">{userName}</p>
        <button
          onClick={signOut}
          className="text-xs flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          로그아웃
        </button>
      </div>
    </div>
  );
} 