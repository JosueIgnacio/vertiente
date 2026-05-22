import { type ReactNode, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<string, string> = {
  primary:
    'bg-[#16A34A] text-white hover:bg-[#15803D] shadow-sm active:scale-[0.98]',
  secondary:
    'bg-[#0F3D2E] text-white hover:bg-[#0a2d22] shadow-sm active:scale-[0.98]',
  outline:
    'border border-[#16A34A] text-[#16A34A] hover:bg-[#F0FDF4] active:scale-[0.98]',
  ghost:
    'text-[#374151] hover:bg-[#F9FAFB] active:scale-[0.98]',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-xl cursor-pointer
        transition-all duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
