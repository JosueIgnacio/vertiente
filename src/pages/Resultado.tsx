import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingDown, Clock, Banknote, Zap, RotateCcw } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import StatCard from '../components/ui/StatCard';
import Semaforo from '../components/ui/Semaforo';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import TCOChart from '../components/charts/TCOChart';
import { calcularTCO } from '../lib/tco';
import { formatCLP, formatCLPMillon, formatAnios } from '../lib/format';
import { SIMULADOR_DEFAULTS } from '../data/mockDefaults';
import { EV_MODELS } from '../data/evModels';
import type { SimuladorData } from '../types';

function loadSimData(): SimuladorData {
  try {
    const raw = localStorage.getItem('vertiente_sim');
    if (raw) return JSON.parse(raw) as SimuladorData;
  } catch (_) { /* noop */ }
  return SIMULADOR_DEFAULTS;
}

// ── Desglose de costos ────────────────────────────────────────────────────────
function DesgloseMensual({ result }: { result: ReturnType<typeof calcularTCO> }) {
  const rows = [
    {
      label: 'Combustible mensual',
      combustion: result.costoCombustibleMes,
      electrico: null,
      evLabel: '—',
    },
    {
      label: 'Energía eléctrica mensual',
      combustion: null,
      combustionLabel: '—',
      electrico: result.costoEnergiaEVMes,
    },
    {
      label: 'Mantención mensual',
      combustion: 45_000,
      electrico: 18_000,
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#F3F4F6]">
            <th className="text-left py-2 text-xs text-[#9CA3AF] font-medium uppercase tracking-wider">Concepto</th>
            <th className="text-right py-2 text-xs text-[#9CA3AF] font-medium uppercase tracking-wider">Combustión</th>
            <th className="text-right py-2 text-xs text-[#16A34A] font-medium uppercase tracking-wider">Eléctrico</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[#F9FAFB]">
              <td className="py-3 text-[#374151]">{row.label}</td>
              <td className="py-3 text-right text-[#6B7280]">
                {row.combustion != null ? formatCLP(row.combustion) : (row.combustionLabel ?? '—')}
              </td>
              <td className="py-3 text-right text-[#15803D] font-medium">
                {row.electrico != null ? formatCLP(row.electrico) : (row.evLabel ?? '—')}
              </td>
            </tr>
          ))}
          {/* Total */}
          <tr className="bg-[#F9FAFB]">
            <td className="py-3 font-semibold text-[#111827] rounded-l-lg pl-2">Total mensual</td>
            <td className="py-3 text-right font-semibold text-[#6B7280]">
              {formatCLP(result.costoCombustibleMes + 45_000)}
            </td>
            <td className="py-3 text-right font-semibold text-[#15803D] rounded-r-lg pr-2">
              {formatCLP(result.costoEnergiaEVMes + 18_000)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── Página Resultado ──────────────────────────────────────────────────────────
export default function Resultado() {
  const simData = useMemo(loadSimData, []);
  const result = useMemo(() => calcularTCO(simData), [simData]);
  const modelo = EV_MODELS.find((m) => m.id === simData.modeloEVId);

  const ahorroMesPositivo = result.ahorroOperacionalMes > 0;

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="flex-1 py-10">
        <Container>

          {/* ── Encabezado ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="verde">
                  <Zap className="w-3 h-3" />
                  Tu resultado
                </Badge>
                <span className="text-xs text-[#9CA3AF]">
                  {simData.ciudad} · {simData.kmMensuales.toLocaleString('es-CL')} km/mes · {modelo?.nombre ?? 'VE'}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-[#0F3D2E]">
                Dashboard TCO
              </h1>
              <p className="text-[#6B7280] text-sm mt-1">
                Análisis de costo total de operación a 5 años
              </p>
            </div>
            <Link to="/simulador">
              <Button variant="outline" size="sm">
                <RotateCcw className="w-4 h-4" />
                Recalcular
              </Button>
            </Link>
          </div>

          {/* ── Semáforo ── */}
          <div className="mb-8">
            <Semaforo
              estado={result.semaforoEstado}
              mensaje={result.mensajeDinamico}
            />
          </div>

          {/* ── Stat cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Ahorro mensual estimado"
              value={ahorroMesPositivo ? formatCLP(result.ahorroOperacionalMes) : `−${formatCLP(Math.abs(result.ahorroOperacionalMes))}`}
              sublabel="vs. costos operacionales actuales"
              icon={<TrendingDown className="w-5 h-5" />}
              accent={ahorroMesPositivo}
            />
            <StatCard
              label="Ahorro estimado a 5 años"
              value={ahorroMesPositivo ? formatCLPMillon(result.ahorroA5Anios) : '—'}
              sublabel="solo en costos operacionales"
              icon={<Banknote className="w-5 h-5" />}
              accent={ahorroMesPositivo}
            />
            <StatCard
              label="Punto de equilibrio"
              value={formatAnios(result.puntoEquilibrioAnios)}
              sublabel={`Inversión incremental: ${formatCLPMillon(result.inversionIncremental)}`}
              icon={<Clock className="w-5 h-5" />}
            />
          </div>

          {/* ── Gráfico TCO ── */}
          <Card className="mb-8" padding="lg">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-[#111827]">
                Costo acumulado a 60 meses
              </h2>
              <span className="text-xs text-[#9CA3AF]">
                Combustión vs. Eléctrico
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] mb-6">
              El eléctrico parte con una inversión mayor y se cruza con combustión en el punto de equilibrio.
              Desde ahí, el ahorro es permanente.
            </p>
            <TCOChart result={result} />
            <div className="flex items-center gap-6 mt-4 text-xs text-[#9CA3AF]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#6B7280] inline-block" />
                Combustión: costo operacional acumulado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#16A34A] inline-block" />
                Eléctrico: inversión + costo operacional
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#FACC15] inline-block border-dashed" />
                Punto de equilibrio
              </span>
            </div>
          </Card>

          {/* ── Desglose mensual ── */}
          <Card className="mb-10" padding="lg">
            <h2 className="text-base font-semibold text-[#111827] mb-4">
              Desglose de costos mensuales
            </h2>
            <DesgloseMensual result={result} />
            <p className="text-xs text-[#9CA3AF] mt-4">
              * Valores referenciales basados en precios actuales de mercado chileno. No constituyen asesoría financiera.
            </p>
          </Card>

          {/* ── CTA hacia ruta ── */}
          <div
            className="rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            style={{
              background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
              border: '1px solid #BBF7D0',
            }}
          >
            <div>
              <h3 className="text-lg font-bold text-[#0F3D2E] mb-1">
                ¿Qué sigue ahora?
              </h3>
              <p className="text-sm text-[#374151] max-w-md">
                Te preparamos una ruta de 5 pasos personalizada: validar factibilidad de carga, comparar modelos, cotizar instalación, financiamiento y contacto con proveedores.
              </p>
            </div>
            <Link to="/ruta" className="shrink-0">
              <Button size="lg" variant="primary">
                Ver mi ruta recomendada
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

        </Container>
      </main>

      <Footer />
    </div>
  );
}
