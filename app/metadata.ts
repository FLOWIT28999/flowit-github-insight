import { Metadata } from 'next';

/**
 * 앱 메타데이터 정의
 * Next.js의 메타데이터 시스템을 통해 SEO와 웹사이트 정보 제공
 */
export const metadata: Metadata = {
  title: "flowit github insight",
  description: "GitHub 저장소 분석을 통해 유용한 인사이트를 제공하는 웹 애플리케이션",
  icons: {
    icon: "/favicon.ico",
  },
  keywords: ["GitHub", "분석", "인사이트", "저장소", "코드 분석"],
  authors: [{ name: "flowit" }],
}; 