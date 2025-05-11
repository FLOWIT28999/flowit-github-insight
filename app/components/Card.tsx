import { ReactNode } from 'react';

/**
 * 카드 UI의 기본 컴포넌트
 */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-6 shadow-xl transition-all hover:shadow-2xl hover:border-red-500/20 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * 카드 헤더 컴포넌트
 */
export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`pb-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * 카드 제목 컴포넌트
 */
export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <h3 className={`text-xl font-semibold text-white mb-1 ${className}`}>
      {children}
    </h3>
  );
}

/**
 * 카드 설명 컴포넌트
 */
export function CardDescription({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <p className={`text-gray-400 text-sm ${className}`}>
      {children}
    </p>
  );
}

/**
 * 카드 내용 컴포넌트
 */
export function CardContent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`py-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * 카드 푸터 컴포넌트
 */
export function CardFooter({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`pt-4 flex items-center ${className}`}>
      {children}
    </div>
  );
}

/**
 * 배지 컴포넌트
 */
export function Badge({
  className,
  children,
  variant = "default",
}: {
  className?: string;
  children: ReactNode;
  variant?: "default" | "secondary" | "outline";
}) {
  const variantClasses = {
    default: "bg-red-500 text-white",
    secondary: "bg-red-500/20 text-red-400",
    outline: "bg-transparent border border-red-500 text-red-500",
  }
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * 버튼 컴포넌트
 */
export function Button({
  className,
  children,
  disabled,
  onClick,
  variant = "default",
}: {
  className?: string;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
}) {
  const variantClasses = {
    default: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20",
    outline: "bg-transparent border border-red-600 text-red-500 hover:bg-red-500/10",
    ghost: "bg-transparent hover:bg-red-500/10 text-red-500",
  }
  
  return (
    <button
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${variantClasses[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
} 