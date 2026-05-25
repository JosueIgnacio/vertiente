import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { TCOResult } from '../../types';
import { formatCLP, formatCLPMillon } from '../../lib/format';

interface TCOChartProps {
  result: TCOResult;
}

interface ChartDataPoint {
  mes: number;
  combustion: number;
  electrico: number;
}

// ── Tooltip personalizado ─────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const mesLabel =
      label === 0
        ? 'Inicio'
        : label % 12 === 0
        ? `Año ${label / 12}`
        : `Mes ${label}`;

    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-lg text-sm">
        <p className="font-semibold text-[#374151] mb-2">{mesLabel}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }} className="font-medium">
            {entry.name === 'combustion' ? 'Combustión' : 'Eléctrico'}:{' '}
            {formatCLP(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function TCOChart({ result }: TCOChartProps) {
  const data: ChartDataPoint[] = result.serieCombustion.map((c, i) => ({
    mes: c.mes,
    combustion: Math.round(c.costo),
    electrico: Math.round(result.serieElectrico[i].costo),
  }));

  // Cruce: primer punto donde eléctrico <= combustión (ignoramos mes 0)
  const crossoverMes = data.find((d) => d.mes > 0 && d.electrico <= d.combustion)?.mes;

  // Ticks en eje X: solo en años completos
  const totalAnios = Math.floor(result.totalMeses / 12);
  const yearTicks = Array.from({ length: totalAnios }, (_, i) => (i + 1) * 12);

  const yFormatter = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />

        {/* Eje X en años */}
        <XAxis
          dataKey="mes"
          ticks={yearTicks}
          tickFormatter={(v) => `Año ${v / 12}`}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          tickLine={false}
          axisLine={{ stroke: '#E5E7EB' }}
        />

        <YAxis
          tickFormatter={yFormatter}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          tickLine={false}
          axisLine={false}
          width={56}
        />

        <Tooltip content={<CustomTooltip />} />

        <Legend
          wrapperStyle={{ paddingTop: 12, fontSize: 12, fontWeight: 500 }}
          formatter={(value) => (value === 'combustion' ? 'Combustión' : 'Eléctrico')}
        />

        {/* Línea horizontal: punto de partida del eléctrico en eje Y */}
        <ReferenceLine
          y={result.inversionNetaEV}
          stroke="#16A34A"
          strokeDasharray="4 3"
          strokeOpacity={0.55}
          label={{
            value: formatCLPMillon(result.inversionNetaEV),
            position: 'insideTopLeft',
            fontSize: 9,
            fill: '#16A34A',
            fontWeight: 600,
          }}
        />

        {/* Línea vertical: punto de equilibrio (cruce de curvas) */}
        {crossoverMes && (
          <ReferenceLine
            x={crossoverMes}
            stroke="#FACC15"
            strokeDasharray="4 4"
            strokeWidth={2}
            label={{
              value: 'Equilibrio',
              position: 'insideTopRight',
              fontSize: 10,
              fill: '#92400E',
            }}
          />
        )}

        <Line
          type="monotone"
          dataKey="combustion"
          stroke="#6B7280"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="electrico"
          stroke="#16A34A"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
