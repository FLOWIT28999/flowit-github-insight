import { NextResponse } from 'next/server';
import { validateApiKey, incrementApiKeyUsage } from '@/lib/apiKeyUtils';

/**
 * API 키 유효성 검증 API (POST)
 * 요청 본문에서 API 키를 받아 유효성을 검사하고 유효하면 사용량을 증가시킵니다
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function POST(request) {
  try {
    // API 키 추출
    const { apiKey } = await request.json();
    
    if (!apiKey) {
      return NextResponse.json(
        { valid: false, message: 'API 키가 필요합니다.' },
        { status: 400 }
      );
    }

    // API 키 유효성 검사
    const apiKeyData = await validateApiKey(apiKey);
    
    // API 키가 존재하지 않으면
    if (!apiKeyData) {
      return NextResponse.json(
        { valid: false, message: '유효하지 않은 API 키입니다.' },
        { status: 401 }
      );
    }

    // API 키 사용량이 제한을 초과하면
    if (apiKeyData.usage >= apiKeyData.limit) {
      return NextResponse.json(
        { valid: false, message: 'API 키 사용량 제한에 도달했습니다.' },
        { status: 403 }
      );
    }

    // API 키 사용량 증가
    const incrementResult = await incrementApiKeyUsage(apiKeyData);
    
    if (!incrementResult.success) {
      return NextResponse.json(
        { valid: false, message: incrementResult.message },
        { status: 403 }
      );
    }

    // 성공 응답
    return NextResponse.json({
      valid: true,
      message: '유효한 API 키입니다.',
      remaining: apiKeyData.limit - (apiKeyData.usage + 1),
      limit: apiKeyData.limit
    });
  } catch (error) {
    console.error('API 키 유효성 검사 오류:', error);
    return NextResponse.json(
      { 
        valid: false, 
        message: 'API 키 유효성 검사 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
} 