-- API 키 테이블 생성
CREATE TABLE IF NOT EXISTS public.api_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    value text NOT NULL UNIQUE,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    used integer DEFAULT 0 NOT NULL,
    limit integer DEFAULT 100 NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);

-- API 키 테이블에 인덱스 추가
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON public.api_keys (user_id);
CREATE INDEX IF NOT EXISTS api_keys_value_idx ON public.api_keys (value);

-- 테이블 설명 추가
COMMENT ON TABLE public.api_keys IS 'API 키 정보를 저장하는 테이블';
COMMENT ON COLUMN public.api_keys.id IS 'API 키의 고유 식별자';
COMMENT ON COLUMN public.api_keys.name IS 'API 키 이름 (사용자 정의)';
COMMENT ON COLUMN public.api_keys.value IS 'API 키 값 (실제 키)';
COMMENT ON COLUMN public.api_keys.user_id IS '키 소유자 ID';
COMMENT ON COLUMN public.api_keys.created_at IS '키 생성 시간';
COMMENT ON COLUMN public.api_keys.used IS '현재까지 사용된 API 요청 수';
COMMENT ON COLUMN public.api_keys.limit IS '최대 API 요청 제한';
COMMENT ON COLUMN public.api_keys.is_active IS '키 활성화 상태';

-- RLS 정책 설정 (Row Level Security)
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- API 키 소유자만 조회/수정/삭제 가능
CREATE POLICY api_keys_user_policy ON public.api_keys
    USING (auth.uid() = user_id);

-- 사용자가 삭제되면 API 키도 함께 삭제
ALTER TABLE public.api_keys
    ADD CONSTRAINT api_keys_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE; 