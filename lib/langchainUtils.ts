import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { RepoInfo } from "./githubUtils";
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

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

/**
 * LangChain을 이용한 GitHub README 분석 함수
 * README 내용을 분석하여 저장소의 요약, 주요 기능, 기술 스택 등을 추출
 * 
 * @param readmeContent README 파일 내용
 * @returns 분석 결과 객체
 */
export async function analyzeReadme(readmeContent: string) {
  try {
    // 분석 결과를 위한 스키마 정의
    const responseSchema = z.object({
      summary: z.string().describe("저장소의 간결하고 명확한 요약"),
      purpose: z.string().describe("저장소의 주요 목적과 해결하려는 문제"),
      features: z.array(z.string()).describe("저장소의 주요 기능 목록"),
      technologies: z.array(z.string()).describe("사용된 기술 스택과 라이브러리 목록"),
      coolFacts: z.array(z.string()).describe("저장소에 대한 흥미로운 사실 3가지"),
      developmentStatus: z.string().describe("개발 상태 평가 (활발한 개발 중, 유지보수 모드, 중단됨 등)"),
      setupComplexity: z.string().describe("설치 및 설정 복잡성 평가 (쉬움, 보통, 복잡함)")
    });

    // OpenAI 모델 초기화
    const model = new ChatOpenAI({
      modelName: process.env.OPENAI_MODEL || "gpt-4",
      temperature: 0.2,
    });

    // 구조화된 출력 파서 생성
    const parser = StructuredOutputParser.fromZodSchema(responseSchema);
    const formatInstructions = parser.getFormatInstructions();

    // 시스템 메시지 템플릿 - formatInstructions 삽입 제거
    const systemTemplate = 
      `당신은 소프트웨어 엔지니어링 전문가로, 코드 분석과 프로젝트 평가에 뛰어납니다.
GitHub 저장소의 README 내용을 분석하여 다음 정보를 추출해주세요.
개발 상태와 설치 복잡성에 대한 평가도 제공해주세요.`;

    // 시스템 메시지에 formatInstructions 직접 추가
    const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplate);

    const humanMessage = HumanMessagePromptTemplate.fromTemplate(
      `README 내용:
{readmeContent}`
    );

    // 응답 형식 안내를 별도 메시지로 추가
    const formatMessage = SystemMessagePromptTemplate.fromTemplate(
      `응답 형식 안내:
{format_instructions}`
    );

    const chatPrompt = ChatPromptTemplate.fromMessages([
      systemMessage,
      formatMessage,
      humanMessage
    ]);

    // 체인 실행
    const chain = chatPrompt.pipe(model).pipe(parser);
    const result = await chain.invoke({ 
      readmeContent,
      format_instructions: formatInstructions
    });

    return result;
  } catch (error) {
    console.error("README 분석 중 오류 발생:", error);
    throw new Error("README 분석 중 오류가 발생했습니다.");
  }
}

/**
 * GitHub 저장소 구조 분석 함수
 * 저장소의 파일 구조, 디렉토리 등을 분석하여 아키텍처 인사이트를 제공
 * 
 * @param structure 저장소 구조 문자열
 * @param languages 사용된 언어 목록
 * @returns 분석 결과 객체
 */
export async function analyzeStructure(structure: string, languages: string[]) {
  try {
    // 분석 결과를 위한 스키마 정의
    const responseSchema = z.object({
      architecture: z.string().describe("저장소의 아키텍처 패턴에 대한 설명"),
      codeOrganization: z.string().describe("코드 구성과 모듈화에 대한 평가"),
      bestPractices: z.array(z.string()).describe("코드에서 발견된 모범 사례"),
      improvementSuggestions: z.array(z.string()).describe("개선이 필요할 수 있는 영역에 대한 제안"),
      complexityAssessment: z.string().describe("프로젝트 복잡성 평가 (낮음, 중간, 높음)"),
      mainComponents: z.array(z.string()).describe("프로젝트의 주요 구성 요소"),
    });

    // OpenAI 모델 초기화
    const model = new ChatOpenAI({
      modelName: process.env.OPENAI_MODEL || "gpt-4",
      temperature: 0.2,
    });

    // 구조화된 출력 파서 생성
    const parser = StructuredOutputParser.fromZodSchema(responseSchema);
    const formatInstructions = parser.getFormatInstructions();

    // 시스템 메시지 템플릿 - formatInstructions 삽입 제거
    const systemTemplate = 
      `당신은 소프트웨어 아키텍처 전문가로, 코드 구조 분석과 패턴 식별에 뛰어납니다.
GitHub 저장소의 구조를 분석하여 아키텍처 인사이트를 제공해주세요.
아키텍처 패턴, 코드 조직화, 모범 사례, 개선 제안 등을 제공하세요.
프로젝트의 주요 구성 요소와 복잡성도 평가해주세요.`;

    const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplate);

    // 응답 형식 안내를 별도 메시지로 추가
    const formatMessage = SystemMessagePromptTemplate.fromTemplate(
      `응답 형식 안내:
{format_instructions}`
    );

    const humanMessage = HumanMessagePromptTemplate.fromTemplate(
      `저장소 구조:
{structure}

사용된 언어:
{languages}`
    );

    const chatPrompt = ChatPromptTemplate.fromMessages([
      systemMessage,
      formatMessage,
      humanMessage
    ]);

    // 체인 실행
    const chain = chatPrompt.pipe(model).pipe(parser);
    const result = await chain.invoke({ 
      structure, 
      languages: languages.join(', '),
      format_instructions: formatInstructions
    });

    return result;
  } catch (error) {
    console.error("구조 분석 중 오류 발생:", error);
    throw new Error("저장소 구조 분석 중 오류가 발생했습니다.");
  }
}

/**
 * GitHub 저장소 종합 분석 함수
 * README 분석과 구조 분석을 종합하여 저장소에 대한 완전한 인사이트 제공
 * 
 * @param readmeResult README 분석 결과
 * @param structureResult 구조 분석 결과
 * @param generalInfo 저장소 일반 정보
 * @returns 종합 분석 결과 객체
 */
export async function generateComprehensiveAnalysis(
  readmeResult: any, 
  structureResult: any, 
  generalInfo: { 
    name: string, 
    stars: number, 
    forks: number,
    description: string,
    language: string,
    languagesList: string[]
  }
) {
  try {
    // 분석 결과를 위한 스키마 정의
    const responseSchema = z.object({
      summary: z.string().describe("저장소에 대한 종합적인 요약"),
      strength: z.array(z.string()).describe("저장소의 강점"),
      weaknesses: z.array(z.string()).describe("개선이 필요한 영역"),
      useCase: z.array(z.string()).describe("이 저장소가 적합한 사용 사례"),
      communityAssessment: z.string().describe("커뮤니티 활성도 평가"),
      maintenanceQuality: z.string().describe("유지보수 품질 평가"),
      learningValue: z.string().describe("이 저장소에서 배울 수 있는 것"),
      recommendationScore: z.number().min(1).max(10).describe("추천 점수 (1-10)"),
      conclusion: z.string().describe("종합적인 결론"),
    });

    // OpenAI 모델 초기화
    const model = new ChatOpenAI({
      modelName: process.env.OPENAI_MODEL || "gpt-4",
      temperature: 0.2,
    });

    // 구조화된 출력 파서 생성
    const parser = StructuredOutputParser.fromZodSchema(responseSchema);
    const formatInstructions = parser.getFormatInstructions();

    // 시스템 메시지 템플릿 - formatInstructions 삽입 제거
    const systemTemplate = 
      `당신은 소프트웨어 프로젝트 평가 전문가입니다.
GitHub 저장소에 대한 종합 분석을 제공해주세요.
강점, 약점, 적합한 사용 사례, 커뮤니티 활성도, 유지보수 품질 등을 평가해주세요.
또한 이 저장소에서 배울 수 있는 것과 1-10 사이의 추천 점수를 제공하세요.`;

    const systemMessage = SystemMessagePromptTemplate.fromTemplate(systemTemplate);

    // 응답 형식 안내를 별도 메시지로 추가
    const formatMessage = SystemMessagePromptTemplate.fromTemplate(
      `응답 형식 안내:
{format_instructions}`
    );

    const humanMessage = HumanMessagePromptTemplate.fromTemplate(
      `저장소 정보:
- 이름: {name}
- 설명: {description}
- 스타: {stars}
- 포크: {forks}
- 주 언어: {language}
- 사용 언어 목록: {languagesList}

README 분석 결과:
{readmeAnalysis}

구조 분석 결과:
{structureAnalysis}`
    );

    const chatPrompt = ChatPromptTemplate.fromMessages([
      systemMessage,
      formatMessage,
      humanMessage
    ]);

    // 체인 실행
    const chain = chatPrompt.pipe(model).pipe(parser);
    const result = await chain.invoke({ 
      name: generalInfo.name,
      description: generalInfo.description,
      stars: generalInfo.stars,
      forks: generalInfo.forks,
      language: generalInfo.language,
      languagesList: generalInfo.languagesList.join(', '),
      readmeAnalysis: JSON.stringify(readmeResult, null, 2),
      structureAnalysis: JSON.stringify(structureResult, null, 2),
      format_instructions: formatInstructions
    });

    return result;
  } catch (error) {
    console.error("종합 분석 중 오류 발생:", error);
    throw new Error("저장소 종합 분석 중 오류가 발생했습니다.");
  }
} 