-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 사용자 테이블에 인덱스 생성
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users (email);

-- API 키 테이블 생성
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    value TEXT UNIQUE NOT NULL,
    usage INTEGER DEFAULT 0,
    limit INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API 키 테이블에 인덱스 생성
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON public.api_keys (user_id);
CREATE INDEX IF NOT EXISTS api_keys_value_idx ON public.api_keys (value);

-- 분석 이력 테이블 생성
CREATE TABLE IF NOT EXISTS public.analysis_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    api_key_id UUID NOT NULL REFERENCES public.api_keys(id) ON DELETE CASCADE,
    repo_owner TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    analysis_result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 분석 이력 테이블에 인덱스 생성
CREATE INDEX IF NOT EXISTS analysis_history_user_id_idx ON public.analysis_history (user_id);
CREATE INDEX IF NOT EXISTS analysis_history_repo_idx ON public.analysis_history (repo_owner, repo_name);

-- RLS(Row Level Security) 정책 설정
-- 사용자는 자신의 데이터만 볼 수 있음
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

-- 사용자 테이블 RLS 정책
CREATE POLICY users_policy ON public.users
    FOR ALL
    USING (auth.uid() = id);

-- API 키 테이블 RLS 정책
CREATE POLICY api_keys_policy ON public.api_keys
    FOR ALL
    USING (auth.uid() = user_id);

-- 분석 이력 테이블 RLS 정책
CREATE POLICY analysis_history_policy ON public.analysis_history
    FOR ALL
    USING (auth.uid() = user_id);

-- 트리거 함수: 레코드 업데이트 시 updated_at 갱신
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users 테이블에 트리거 적용
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- api_keys 테이블에 트리거 적용
CREATE TRIGGER update_api_keys_updated_at
BEFORE UPDATE ON public.api_keys
FOR EACH ROW
EXECUTE FUNCTION update_modified_column(); 