import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

/**
 * 특정 분석 이력 상세 조회 API (GET)
 * 지정된 ID의 분석 이력 상세 정보를 반환
 * 
 * @param request Next.js 요청 객체
 * @param params 경로 매개변수 (분석 이력 ID)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // 세션 확인하여 사용자 ID 가져오기
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 분석 이력 상세 정보 조회 (소유자 확인 포함)
    const { data: historyItem, error } = await supabase
      .from('analysis_history')
      .select(`
        id, 
        repo_owner, 
        repo_name, 
        created_at, 
        analysis_result,
        api_key_id,
        api_keys(name)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '분석 이력을 찾을 수 없거나 접근 권한이 없습니다.' },
          { status: 404 }
        );
      }
      throw error;
    }

    // 응답 형식 정리
    const response = {
      id: historyItem.id,
      repoOwner: historyItem.repo_owner,
      repoName: historyItem.repo_name,
      apiKeyName: historyItem.api_keys?.name,
      apiKeyId: historyItem.api_key_id,
      createdAt: historyItem.created_at,
      analysis: historyItem.analysis_result
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('분석 이력 상세 조회 오류:', error);
    return NextResponse.json(
      { error: '분석 이력을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 분석 이력 삭제 API (DELETE)
 * 지정된 ID의 분석 이력을 삭제
 * 
 * @param request Next.js 요청 객체
 * @param params 경로 매개변수 (분석 이력 ID)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // 세션 확인하여 사용자 ID 가져오기
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 분석 이력 소유권 확인 및 삭제
    const { error } = await supabase
      .from('analysis_history')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw error;
    }

    return NextResponse.json(
      { message: '분석 이력이 삭제되었습니다.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('분석 이력 삭제 오류:', error);
    return NextResponse.json(
      { error: '분석 이력을 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 