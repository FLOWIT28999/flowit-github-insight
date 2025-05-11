import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSessionUser } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

/**
 * API 키 목록 조회 (GET)
 * 현재 인증된 사용자의 모든 API 키 목록을 반환
 */
export async function GET(req: NextRequest) {
  try {
    // 세션 확인하여 사용자 ID 가져오기
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 사용자의 API 키 목록 조회
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('id, name, value, created_at, usage, limit')
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error('API 키 조회 오류:', error);
    return NextResponse.json(
      { error: 'API 키를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 새 API 키 생성 (POST)
 * 요청 본문에서 이름과 사용량 제한을 받아 새 API 키를 생성
 */
export async function POST(req: NextRequest) {
  try {
    // 요청 본문 파싱
    const { name, limit } = await req.json();

    // 필수 데이터 유효성 검사
    if (!name) {
      return NextResponse.json(
        { error: 'API 키 이름은 필수입니다.' },
        { status: 400 }
      );
    }

    // 세션 확인하여 사용자 ID 가져오기
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 랜덤 API 키 생성 (32자)
    const apiKeyValue = crypto.randomBytes(16).toString('hex');

    // API 키를 데이터베이스에 저장
    const { data: newApiKey, error } = await supabase
      .from('api_keys')
      .insert([
        {
          name,
          value: apiKeyValue,
          user_id: user.id,
          usage: 0,
          limit: limit || 100, // 기본 제한: 100
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(newApiKey, { status: 201 });
  } catch (error) {
    console.error('API 키 생성 오류:', error);
    return NextResponse.json(
      { error: 'API 키를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 