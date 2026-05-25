interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** 'dark' inverts colors for dark backgrounds: ev → amarillo, market → blanco */
  variant?: 'light' | 'dark';
}

const sizeMap = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
};

export default function Logo({ size = 'md', className = '', variant = 'light' }: LogoProps) {
  const veColor   = variant === 'dark' ? '#FACC15' : '#16A34A';
  const restColor = variant === 'dark' ? '#ffffff'  : '#0F3D2E';

  return (
    <span
      className={`font-semibold tracking-wide select-none ${sizeMap[size]} ${className}`}
      style={{ letterSpacing: '0.04em' }}
    >
      <span style={{ color: veColor }}>ev</span>
      <span style={{ color: restColor }}>market</span>
    </span>
  );
}
