import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * 특정 API 키 조회 (GET)
 * 지정된 ID를 가진 API 키의 상세 정보를 반환
 * 
 * @param request Next.js 요청 객체
 * @param params 경로 매개변수 (API 키 ID)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Supabase 클라이언트 생성 (서버 라우트 핸들러용)
    const supabaseServer = createRouteHandlerClient({ cookies });
    
    // 현재 세션 확인
    const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession();
    
    let userId = null;
    
    // Supabase 세션이 있으면 사용
    if (session?.user?.id) {
      userId = session.user.id;
      console.log('Supabase 세션에서 사용자 ID 확인:', userId);
    } else {
      // NextAuth 세션 확인 시도
      const user = await getSessionUser();
      if (user?.id) {
        userId = user.id;
        console.log('NextAuth 세션에서 사용자 ID 확인:', userId);
      }
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 특정 API 키 조회 - RLS가 적용된 쿼리 (서비스 롤 사용)
    const { data: apiKey, error } = await supabaseServer
      .from('api_keys')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('API 키 조회 중 오류:', error);
      return NextResponse.json(
        { error: 'API 키를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // used 필드를 usage로 변환하여 클라이언트 호환성 유지
    const formattedKey = {
      ...apiKey,
      usage: apiKey.used,
    };

    return NextResponse.json(formattedKey);
  } catch (error) {
    console.error('API 키 조회 오류:', error);
    return NextResponse.json(
      { error: 'API 키를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * API 키 수정 (PUT)
 * 지정된 ID를 가진 API 키의 이름 또는 사용량 제한을 수정
 * 
 * @param request Next.js 요청 객체
 * @param params 경로 매개변수 (API 키 ID)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { name, limit } = await request.json();

    // Supabase 클라이언트 생성 (서버 라우트 핸들러용)
    const supabaseServer = createRouteHandlerClient({ cookies });
    
    // 현재 세션 확인
    const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession();
    
    let userId = null;
    
    // Supabase 세션이 있으면 사용
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      // NextAuth 세션 확인 시도
      const user = await getSessionUser();
      if (user?.id) {
        userId = user.id;
      }
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 수정할 데이터 객체 생성
    const updateData: { name?: string; limit?: number } = {};
    if (name !== undefined) updateData.name = name;
    if (limit !== undefined) updateData.limit = limit;

    // 수정할 내용이 없으면 오류 반환
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: '수정할 내용이 없습니다.' },
        { status: 400 }
      );
    }

    // API 키 소유권 확인 및 데이터 수정 - RLS가 적용된 쿼리 (서비스 롤 사용)
    const { data: apiKey, error } = await supabaseServer
      .from('api_keys')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('API 키 수정 중 오류:', error);
      return NextResponse.json(
        { error: 'API 키를 찾을 수 없거나 수정 권한이 없습니다.' },
        { status: 404 }
      );
    }

    // used를 usage로 변환하여 클라이언트 호환성 유지
    const formattedKey = {
      ...apiKey,
      usage: apiKey.used,
    };

    return NextResponse.json(formattedKey);
  } catch (error) {
    console.error('API 키 수정 오류:', error);
    return NextResponse.json(
      { error: 'API 키를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * API 키 삭제 (DELETE)
 * 지정된 ID를 가진 API 키를 삭제
 * 
 * @param request Next.js 요청 객체
 * @param params 경로 매개변수 (API 키 ID)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Supabase 클라이언트 생성 (서버 라우트 핸들러용)
    const supabaseServer = createRouteHandlerClient({ cookies });
    
    // 현재 세션 확인
    const { data: { session }, error: sessionError } = await supabaseServer.auth.getSession();
    
    let userId = null;
    
    // Supabase 세션이 있으면 사용
    if (session?.user?.id) {
      userId = session.user.id;
    } else {
      // NextAuth 세션 확인 시도
      const user = await getSessionUser();
      if (user?.id) {
        userId = user.id;
      }
    }
    
    if (!userId) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // API 키 소유권 확인 및 삭제 - RLS가 적용된 쿼리 (서비스 롤 사용)
    const { error } = await supabaseServer
      .from('api_keys')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('API 키 삭제 중 오류:', error);
      return NextResponse.json(
        { error: 'API 키를 삭제하는 중 오류가 발생했습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'API 키가 삭제되었습니다.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('API 키 삭제 오류:', error);
    return NextResponse.json(
      { error: 'API 키를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 