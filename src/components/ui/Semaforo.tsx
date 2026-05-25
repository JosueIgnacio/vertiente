// Tipo local — ya no se exporta desde types (flujo nuevo no usa semáforo)
type SemaforoEstado = 'conviene' | 'conviene-condiciones' | 'no-conviene';

interface SemaforoProps {
  estado: SemaforoEstado;
  mensaje?: string;
  className?: string;
}

const config: Record<SemaforoEstado, {
  dot: string;
  bg: string;
  border: string;
  textColor: string;
  label: string;
  icon: string;
}> = {
  conviene: {
    dot: 'bg-[#16A34A]',
    bg: 'bg-[#F0FDF4]',
    border: 'border-[#BBF7D0]',
    textColor: 'text-[#15803D]',
    label: 'Te conviene',
    icon: '🟢',
  },
  'conviene-condiciones': {
    dot: 'bg-[#FACC15]',
    bg: 'bg-[#FEFCE8]',
    border: 'border-[#FDE047]',
    textColor: 'text-[#92400E]',
    label: 'Te conviene con condiciones',
    icon: '🟡',
  },
  'no-conviene': {
    dot: 'bg-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    textColor: 'text-red-700',
    label: 'No te conviene todavía',
    icon: '🔴',
  },
};

export default function Semaforo({ estado, mensaje, className = '' }: SemaforoProps) {
  const c = config[estado];

  return (
    <div
      className={`
        rounded-2xl border p-6
        ${c.bg} ${c.border}
        ${className}
      `}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-4 h-4 rounded-full ${c.dot} shadow-sm`} />
        <span className={`text-xl font-bold ${c.textColor}`}>{c.label}</span>
      </div>
      {mensaje && (
        <p className="text-sm text-[#374151] leading-relaxed">{mensaje}</p>
      )}
    </div>
  );
}
