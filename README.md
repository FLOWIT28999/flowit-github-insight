# GitHub Insight

GitHub 저장소 분석을 통해 유용한 인사이트를 제공하는 웹 애플리케이션입니다. AI를 활용하여 GitHub 저장소의 목적, 주요 기능, 기술 스택, 사용 사례, 학습 난이도 등을 분석합니다.

## 주요 기능

- GitHub 저장소 URL을 입력하여 AI 분석 결과 확인
- API 키 관리: 생성, 조회, 수정, 삭제
- 분석 이력 관리: 분석 결과 저장 및 조회
- 사용자 인증: Google 계정을 통한 로그인

## 기술 스택

- **프론트엔드**: Next.js, React, TailwindCSS
- **백엔드**: Next.js API Routes, LangChain
- **인증**: NextAuth.js (Google OAuth)
- **데이터베이스**: Supabase (PostgreSQL)
- **AI 모델**: OpenAI GPT (LangChain 연동)

## 설치 및 설정

### 필요 조건

- Node.js (18.0.0 이상)
- Supabase 계정
- OpenAI API 키
- Google Cloud Console에서 OAuth 클라이언트 ID/Secret
- (선택사항) GitHub 개인 액세스 토큰

### 설치 단계

1. 저장소 클론

```bash
git clone https://github.com/yourusername/github-insight.git
cd github-insight
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정

`env.example` 파일을 `.env.local`로 복사하고 필요한 값을 입력합니다.

```bash
cp env.example .env.local
```

`.env.local` 파일을 편집하여 다음 값을 입력합니다:
- NEXTAUTH_SECRET (랜덤 문자열)
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- OPENAI_API_KEY
- GITHUB_TOKEN (선택 사항)

4. Supabase 데이터베이스 설정

Supabase 프로젝트를 생성하고 `supabase/migrations` 폴더의 SQL 스크립트를 실행하여 필요한 테이블을 생성합니다.

Supabase UI에서 SQL 편집기를 열고 `supabase/migrations/20240601000000_create_initial_schema.sql` 파일의 내용을 복사하여 실행합니다.

5. 개발 서버 실행

```bash
npm run dev
```

## API 사용 예시

GitHub 저장소 분석 API 예시:

```javascript
// 저장소 분석 요청
const response = await fetch('/api/analyze-repo', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    repoUrl: 'https://github.com/owner/repo',
    apiKey: 'your-api-key'
  })
});

const data = await response.json();
console.log(data.analysis); // 분석 결과
```

## 라이선스

MIT 라이선스
