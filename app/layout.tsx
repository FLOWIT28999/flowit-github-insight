import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import UserProfile from "./components/UserProfile";
import { Github } from "lucide-react";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "flowit github insight",
  description: "GitHub 저장소 분석을 통해 유용한 인사이트를 제공하는 웹 애플리케이션",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className={`${inter.variable} antialiased bg-gray-950 text-gray-100`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-gray-800 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center space-x-2">
                  <Github className="h-6 w-6 text-red-500" />
                  <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700">
                    flowit github insight
                  </h1>
                </Link>
                <UserProfile />
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
