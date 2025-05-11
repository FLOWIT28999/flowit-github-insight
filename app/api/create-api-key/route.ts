import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * API 키 생성 API 엔드포인트
 * 인증된 사용자에 대해 새로운 API 키를 생성하고 반환
 */
export async function POST(req: Request) {
  try {
    // Supabase 클라이언트 생성
    const supabase = createRouteHandlerClient({ cookies });
    
    // 현재 세션 확인
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { message: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }
    
    // 요청 바디에서 API 키 이름 추출
    const requestData = await req.json();
    const { name } = requestData;
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { message: 'API 키 이름이 유효하지 않습니다.' },
        { status: 400 }
      );
    }
    
    // API 키 생성
    const userId = session.user.id;
    const keyPrefix = 'ghi_'; // GitHub Insight API 키 접두사
    const keyValue = `${keyPrefix}${uuidv4().replace(/-/g, '')}`;
    
    // API 키를 데이터베이스에 저장
    const { data: apiKey, error: insertError } = await supabase
      .from('api_keys')
      .insert({
        name: name.trim(),
        key: keyPrefix,
        value: keyValue,
        user_id: userId,
        limit: 100, // 기본 API 요청 제한
        used: 0,
        is_active: true,
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('API 키 생성 오류:', insertError);
      return NextResponse.json(
        { message: 'API 키 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // 생성된 API 키 반환
    return NextResponse.json(apiKey);
  } catch (error) {
    console.error('API 키 생성 처리 중 오류:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 