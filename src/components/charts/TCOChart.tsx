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
import { formatCLP } from '../../lib/format';

interface TCOChartProps {
  result: TCOResult;
}

interface ChartDataPoint {
  mes: number;
  combustion: number;
  electrico: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-lg text-sm">
        <p className="font-semibold text-[#374151] mb-2">Mes {label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.color }} className="font-medium">
            {entry.name}: {formatCLP(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function TCOChart({ result }: TCOChartProps) {
  // Merge the two series into one array for Recharts
  const data: ChartDataPoint[] = result.serieCombustion.map((c, i) => ({
    mes: c.mes,
    combustion: Math.round(c.costo),
    electrico: Math.round(result.serieElectrico[i].costo),
  }));

  // Find crossover month
  const crossoverMes = data.find((d) => d.electrico <= d.combustion)?.mes;

  const yFormatter = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis
          dataKey="mes"
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          tickFormatter={(v) => `M${v}`}
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
          formatter={(value) =>
            value === 'combustion' ? 'Combustión' : 'Eléctrico'
          }
        />

        {/* Crossover reference line */}
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
          name="combustion"
          stroke="#6B7280"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="electrico"
          name="electrico"
          stroke="#16A34A"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
