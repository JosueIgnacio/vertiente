import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'verde' | 'amarillo' | 'gris' | 'rojo';
  className?: string;
}

const variantStyles: Record<string, string> = {
  verde: 'bg-[#DCFCE7] text-[#15803D]',
  amarillo: 'bg-[#FEF9C3] text-[#92400E]',
  gris: 'bg-[#F9FAFB] text-[#6B7280]',
  rojo: 'bg-red-50 text-red-700',
};

export default function Badge({
  children,
  variant = 'verde',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-3 py-1 rounded-full text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
