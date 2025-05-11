import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind CSS 클래스를 조건부로 결합하고 충돌을 해결하는 유틸리티 함수
 * clsx로 클래스를 조합하고 tailwind-merge로 충돌을 해결합니다
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
