interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
};

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <span
      className={`font-semibold tracking-wide select-none ${sizeMap[size]} ${className}`}
      style={{ letterSpacing: '0.04em' }}
    >
      <span style={{ color: '#16A34A' }}>ve</span>
      <span style={{ color: '#0F3D2E' }}>rtiente</span>
    </span>
  );
}
