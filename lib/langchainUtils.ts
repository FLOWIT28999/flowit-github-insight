import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RepoInfo } from "./githubUtils";

/**
 * LangChain 모델 인스턴스 생성
 * OpenAI API를 사용하여 ChatGPT 모델 초기화
 */
export const chatModel = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
  temperature: 0.2,
});

/**
 * GitHub 저장소 분석을 위한 프롬프트 템플릿
 * 저장소의 README, 기본 정보 등을 기반으로 분석 리포트 생성
 */
const analyzeRepoPrompt = PromptTemplate.fromTemplate(`
당신은 GitHub 저장소 분석 AI 전문가입니다. 아래 GitHub 저장소 정보를 분석하고 요약해주세요.

저장소 정보:
- 이름: {owner}/{repo}
- 설명: {description}
- 주요 언어: {language}
- 스타 개수: {stars}
- 포크 개수: {forks}

README 내용:
{readme}

다음 내용을 포함한 JSON 형식의 분석 결과를 제공해주세요:
1. "summary": 저장소의 주요 목적과 기능 요약 (2-3문장)
2. "keyFeatures": 저장소의 주요 기능 목록 (배열)
3. "technicalStack": 사용된 기술 스택 추정 (배열)
4. "useCases": 잠재적 사용 사례 (배열)
5. "learningDifficulty": 초보자가 이 코드를 학습하기 위한 난이도 (1-5, 5가 가장 어려움)
6. "communityActivity": 커뮤니티 활동성 평가 (스타, 포크, 최근 업데이트 기반) (1-5, 5가 가장 활발함)
7. "recommendedAudience": 이 저장소를 학습하기에 적합한 대상 (문자열)

JSON 형식으로 응답해주세요.
`);

/**
 * GitHub 저장소 분석 함수
 * LangChain과 OpenAI를 사용하여 저장소 정보를 분석하고 구조화된 결과 반환
 * 
 * @param repoInfo GitHub 저장소 정보 객체
 * @returns 분석 결과를 포함한 JSON 객체
 */
export async function analyzeRepository(repoInfo: RepoInfo) {
  try {
    // 분석 체인 생성
    const chain = analyzeRepoPrompt
      .pipe(chatModel)
      .pipe(new StringOutputParser());

    // 체인 실행
    const result = await chain.invoke({
      owner: repoInfo.owner,
      repo: repoInfo.repo,
      description: repoInfo.description,
      language: repoInfo.language,
      stars: repoInfo.stars,
      forks: repoInfo.forks,
      readme: repoInfo.readme.substring(0, 8000) // README가 너무 길면 자르기
    });

    // JSON 형식 결과 파싱
    try {
      return JSON.parse(result);
    } catch (error) {
      console.error('JSON 파싱 오류:', error);
      return { 
        error: "결과 파싱 오류", 
        rawResult: result 
      };
    }
  } catch (error) {
    console.error('저장소 분석 오류:', error);
    throw error;
  }
} 