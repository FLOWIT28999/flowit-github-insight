import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

/**
 * 분석 이력 목록 조회 API (GET)
 * 현재 로그인한 사용자의 모든 분석 이력을 반환
 */
export async function GET(request: NextRequest) {
  try {
    // 세션 확인하여 사용자 ID 가져오기
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // URL에서 페이징 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // 시작 인덱스 계산
    const offset = (page - 1) * limit;

    // 사용자의 분석 이력 목록 조회 (페이징 적용)
    const { data: history, error, count } = await supabase
      .from('analysis_history')
      .select('id, repo_owner, repo_name, created_at, api_key_id', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    // 전체 페이지 수 계산
    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      history,
      pagination: {
        page,
        limit,
        totalItems: count,
        totalPages
      }
    });
  } catch (error) {
    console.error('분석 이력 조회 오류:', error);
    return NextResponse.json(
      { error: '분석 이력을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 분석 이력 저장 API (POST)
 * 새로운 분석 결과를 저장
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const { apiKeyId, repoOwner, repoName, analysisResult } = await request.json();

    // 필수 데이터 유효성 검사
    if (!apiKeyId || !repoOwner || !repoName || !analysisResult) {
      return NextResponse.json(
        { error: '필수 데이터가 누락되었습니다.' },
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

    // API 키가 해당 사용자의 것인지 확인
    const { data: apiKey, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('id')
      .eq('id', apiKeyId)
      .eq('user_id', user.id)
      .single();

    if (apiKeyError || !apiKey) {
      return NextResponse.json(
        { error: '유효하지 않은 API 키입니다.' },
        { status: 403 }
      );
    }

    // 분석 이력 저장
    const { data: newHistory, error } = await supabase
      .from('analysis_history')
      .insert([
        {
          user_id: user.id,
          api_key_id: apiKeyId,
          repo_owner: repoOwner,
          repo_name: repoName,
          analysis_result: analysisResult
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(newHistory, { status: 201 });
  } catch (error) {
    console.error('분석 이력 저장 오류:', error);
    return NextResponse.json(
      { error: '분석 이력을 저장하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 