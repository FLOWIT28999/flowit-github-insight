import { supabase } from './supabaseClient';

/**
 * API 키 데이터 인터페이스
 * 키의 ID, 현재 사용량, 사용 제한을 포함
 */
interface ApiKeyData {
  id: string;
  usage: number;
  limit: number;
}

/**
 * API 키 유효성 검사 함수
 * 제공된 API 키가 유효한지 확인하고 관련 데이터 반환
 * 
 * @param apiKey 확인할 API 키 문자열
 * @returns API 키 데이터 객체 또는 유효하지 않은 경우 null
 */
export async function validateApiKey(apiKey: string): Promise<ApiKeyData | null> {
  try {
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from('api_keys')
      .select('id, usage, limit')
      .eq('value', apiKey)
      .maybeSingle();

    if (apiKeyError) {
      throw apiKeyError;
    }

    return apiKeyData;
  } catch (error) {
    console.error('Error validating API key:', error);
    throw error;
  }
}

/**
 * API 키 사용량 증가 함수
 * 사용량이 제한을 초과하는지 확인하고, 초과하지 않으면 사용량 증가
 * 
 * @param apiKeyData API 키 데이터 객체
 * @returns 성공 여부와 메시지를 포함한 결과 객체
 */
export async function incrementApiKeyUsage(apiKeyData: ApiKeyData): Promise<{ success: boolean; message: string }> {
  try {
    if (apiKeyData.usage >= apiKeyData.limit) {
      return { success: false, message: 'Rate limit exceeded' };
    }

    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ usage: apiKeyData.usage + 1 })
      .eq('id', apiKeyData.id);

    if (updateError) {
      throw updateError;
    }

    return { success: true, message: 'Usage incremented successfully' };
  } catch (error) {
    console.error('Error incrementing API key usage:', error);
    throw error;
  }
} 