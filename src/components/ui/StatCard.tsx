import { type ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon?: ReactNode;
  accent?: boolean;
  className?: string;
}

export default function StatCard({
  label,
  value,
  sublabel,
  icon,
  accent = false,
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-[#E5E7EB]
        shadow-[0_1px_3px_0_rgba(0,0,0,0.08)]
        p-5 flex flex-col gap-1
        ${accent ? 'border-[#16A34A] bg-[#F0FDF4]' : ''}
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <span className="text-[#16A34A] opacity-70">{icon}</span>
        )}
      </div>
      <p
        className={`text-2xl font-bold mt-1 ${
          accent ? 'text-[#15803D]' : 'text-[#111827]'
        }`}
      >
        {value}
      </p>
      {sublabel && (
        <p className="text-xs text-[#6B7280] mt-0.5">{sublabel}</p>
      )}
    </div>
  );
}
