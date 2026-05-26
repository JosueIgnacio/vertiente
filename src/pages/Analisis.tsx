import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Stepper from '../components/ui/Stepper';
import { calcularTCO } from '../lib/tco';
import { formatCLPMillon } from '../lib/format';
import {
  DIAGNOSTICO_DEFAULTS,
  INSTALACION_BASE, INSTALACION_ACOMETIDA_REF, INSTALACION_COSTO_POR_METRO_ACOMETIDA,
  INSTALACION_DIST_INTERNA_REF, INSTALACION_COSTO_POR_METRO_INTERNO,
  INSTALACION_RECARGO_SOTERRADO, INSTALACION_RECARGO_EMPALME_DEDICADO,
  INSTALACION_MARGEN_RANGO,
} from '../data/mockDefaults';
import type { DiagnosticoData, InfoCarga } from '../types';

// ── Carga de datos ─────────────────────────────────────────────────────────────

function loadDiagData(): DiagnosticoData {
  try {
    const raw = localStorage.getItem('evmarket_diagnostico');
    if (raw) return JSON.parse(raw) as DiagnosticoData;
  } catch (_) { /* noop */ }
  return DIAGNOSTICO_DEFAULTS;
}

function loadSesion(): { nombre: string; email: string } {
  try {
    const raw = localStorage.getItem('evmarket_sesion');
    if (raw) return JSON.parse(raw);
  } catch (_) { /* noop */ }
  return { nombre: 'Usuario', email: '' };
}

// ── Estado del flujo ──────────────────────────────────────────────────────────

interface AnalisisState {
  paso: 1 | 2 | 3 | 4;
  // Vista 1 — Estimador de instalación
  quiereInstalacion: boolean;
  distAcometida: number;
  distInterna: number;
  canalizacion: 'sobrepuesta' | 'soterrada';
  conexion: 'ampliacion' | 'dedicado';
  costoInstalacionFinal: number;
  // Vista 2 — Comparativa de modelos
  ofertasMarcadas: string[];
  // Vista 3 — Financiamiento
  ofertaFinanciamiento: string;
  pie: number;
  plazoMeses: number;
}

const PASOS_LABELS = ['Carga', 'Modelos', 'Financiamiento', 'Proveedores'];

// ── Estimador de instalación ──────────────────────────────────────────────────

function calcularRangoInstalacion(
  distAcometida: number,
  distInterna: number,
  canalizacion: AnalisisState['canalizacion'],
  conexion: AnalisisState['conexion'],
): { min: number; max: number } {
  const base =
    INSTALACION_BASE +
    (distAcometida - INSTALACION_ACOMETIDA_REF) * INSTALACION_COSTO_POR_METRO_ACOMETIDA +
    (distInterna   - INSTALACION_DIST_INTERNA_REF) * INSTALACION_COSTO_POR_METRO_INTERNO +
    (canalizacion === 'soterrada' ? INSTALACION_RECARGO_SOTERRADO : 0) +
    (conexion     === 'dedicado'  ? INSTALACION_RECARGO_EMPALME_DEDICADO : 0);
  const piso = Math.max(base, 1_200_000);
  const min  = Math.round(piso * (1 - INSTALACION_MARGEN_RANGO) / 1000) * 1000;
  const max  = Math.round(piso * (1 + INSTALACION_MARGEN_RANGO) / 1000) * 1000;
  return { min, max };
}

interface Vista1Props {
  infoCarga: InfoCarga;
  state: AnalisisState;
  set: (p: Partial<AnalisisState>) => void;
}

function Vista1Estimador({ infoCarga, state, set }: Vista1Props) {
  const esViaje       = infoCarga.tramo === 'viaje';
  const mostrarForm   = !esViaje || state.quiereInstalacion;
  const { min, max }  = calcularRangoInstalacion(
    state.distAcometida, state.distInterna, state.canalizacion, state.conexion
  );

  const chipColor = {
    viaje:       { bg: 'bg-[#DCFCE7]', text: 'text-[#15803D]' },
    domiciliario: { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]' },
    mixto:       { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]' },
  }[infoCarga.tramo];

  return (
    <Card padding="lg">
      <div className="flex items-center gap-2 mb-5">
        <Zap className="w-5 h-5 text-[#16A34A]" />
        <h2 className="font-semibold text-[#111827]">Factibilidad de instalación de carga</h2>
        <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${chipColor.bg} ${chipColor.text}`}>
          {infoCarga.tramo}
        </span>
      </div>

      {/* Caso viaje: checkbox opcional */}
      {esViaje && (
        <div className="mb-5 bg-[#F0FDF4] border border-[#DCFCE7] rounded-xl px-4 py-4">
          <p className="text-sm text-[#374151] mb-3 leading-relaxed">
            Según tu operación diaria (<strong>{infoCarga.tramo}</strong> ≤ 70 km/día) no
            requieres un cargador de 7,4 kW — basta el enchufe doméstico estándar.
          </p>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={state.quiereInstalacion}
              onChange={(e) => set({ quiereInstalacion: e.target.checked })}
              className="mt-0.5 w-4 h-4 accent-[#16A34A] cursor-pointer"
            />
            <span className="text-sm text-[#374151]">
              Quiero igual estimar el costo de instalar un cargador dedicado e incluirlo en la evaluación.
            </span>
          </label>
        </div>
      )}

      {/* Formulario de 4 variables */}
      {mostrarForm && (
        <>
          <p className="text-xs text-[#6B7280] mb-4 leading-relaxed">
            Ajusta los parámetros de tu vivienda para obtener un rango referencial de costo de instalación.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

            {/* Distancia acometida */}
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">
                Dist. acometida (calle → medidor)
              </label>
              <div className="flex items-center border border-[#E5E7EB] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#16A34A] focus-within:border-transparent transition-all">
                <input
                  type="number" min={0} max={200} value={state.distAcometida}
                  onChange={(e) => set({ distAcometida: Number(e.target.value) })}
                  className="flex-1 px-4 py-2.5 text-sm text-[#111827] outline-none bg-white min-w-0"
                />
                <span className="px-3 bg-[#F9FAFB] border-l border-[#E5E7EB] text-xs text-[#6B7280] py-2.5 shrink-0">metros</span>
              </div>
            </div>

            {/* Distancia interna */}
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">
                Dist. interna (medidor → estacionamiento)
              </label>
              <div className="flex items-center border border-[#E5E7EB] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#16A34A] focus-within:border-transparent transition-all">
                <input
                  type="number" min={0} max={200} value={state.distInterna}
                  onChange={(e) => set({ distInterna: Number(e.target.value) })}
                  className="flex-1 px-4 py-2.5 text-sm text-[#111827] outline-none bg-white min-w-0"
                />
                <span className="px-3 bg-[#F9FAFB] border-l border-[#E5E7EB] text-xs text-[#6B7280] py-2.5 shrink-0">metros</span>
              </div>
            </div>

            {/* Tipo canalización */}
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">
                Tipo de canalización
              </label>
              <select
                value={state.canalizacion}
                onChange={(e) => set({ canalizacion: e.target.value as AnalisisState['canalizacion'] })}
                className="w-full px-4 py-2.5 text-sm text-[#111827] border border-[#E5E7EB] rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all cursor-pointer"
              >
                <option value="sobrepuesta">Sobrepuesta (tubo o canaleta visible)</option>
                <option value="soterrada">Soterrada (enterrada o embutida)</option>
              </select>
            </div>

            {/* Tipo conexión */}
            <div>
              <label className="block text-xs font-medium text-[#374151] mb-1.5">
                Tipo de conexión al empalme
              </label>
              <select
                value={state.conexion}
                onChange={(e) => set({ conexion: e.target.value as AnalisisState['conexion'] })}
                className="w-full px-4 py-2.5 text-sm text-[#111827] border border-[#E5E7EB] rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all cursor-pointer"
              >
                <option value="ampliacion">Ampliación del empalme existente</option>
                <option value="dedicado">Empalme dedicado exclusivo</option>
              </select>
            </div>

          </div>

          {/* Resultado */}
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-5 py-4 mb-4">
            <p className="text-xs text-[#6B7280] mb-1">Rango estimado de instalación</p>
            <p className="text-2xl font-bold text-[#0F3D2E]">
              {formatCLPMillon(min)} – {formatCLPMillon(max)}
            </p>
            <p className="text-[10px] text-[#9CA3AF] mt-1.5">
              Estimación referencial, no es una cotización. Fuente: AgenciaSE 2026.
            </p>
          </div>

          <p className="text-xs text-[#6B7280] leading-relaxed">
            Al continuar, usaremos el valor medio del rango (
            <strong className="text-[#374151]">{formatCLPMillon(Math.round((min + max) / 2 / 1000) * 1000)}</strong>)
            en el cálculo de recuperación de inversión de los modelos.
          </p>
        </>
      )}

      {/* Sin instalación */}
      {!mostrarForm && (
        <p className="text-sm text-[#6B7280]">
          No se suma costo de instalación a la evaluación. Puedes activar la casilla anterior si quieres incluirlo.
        </p>
      )}
    </Card>
  );
}

function Vista2Placeholder() {
  return (
    <Card padding="lg">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-[#16A34A]" />
        <h2 className="font-semibold text-[#111827]">Comparativa de modelos eléctricos</h2>
        <Badge variant="verde" className="ml-auto text-[10px]">Paso 2</Badge>
      </div>
      <p className="text-sm text-[#6B7280]">
        Aquí irán las 7 fichas de ofertas con selección y comparación (Etapa 4).
      </p>
    </Card>
  );
}

function Vista3Placeholder() {
  return (
    <Card padding="lg">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-[#16A34A]" />
        <h2 className="font-semibold text-[#111827]">Simulador de financiamiento</h2>
        <Badge variant="verde" className="ml-auto text-[10px]">Paso 3</Badge>
      </div>
      <p className="text-sm text-[#6B7280]">
        Aquí irá el simulador de cuota BancoEstado (Etapa 5).
      </p>
    </Card>
  );
}

function Vista4Placeholder() {
  return (
    <Card padding="lg">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-[#16A34A]" />
        <h2 className="font-semibold text-[#111827]">Contacto con proveedores</h2>
        <Badge variant="verde" className="ml-auto text-[10px]">Paso 4</Badge>
      </div>
      <p className="text-sm text-[#6B7280]">
        Aquí irán los QR y comprobantes de lead (Etapa 6).
      </p>
    </Card>
  );
}

// ── Página ─────────────────────────────────────────────────────────────────────

export default function Analisis() {
  const navigate  = useNavigate();
  const diagData  = useMemo(loadDiagData, []);
  const sesion    = useMemo(loadSesion, []);
  const tcoResult = useMemo(() => calcularTCO(diagData), [diagData]);

  // Redirigir si no hay datos de diagnóstico
  useEffect(() => {
    if (!localStorage.getItem('evmarket_diagnostico')) {
      navigate('/simulador');
    }
  }, [navigate]);

  const [state, setState] = useState<AnalisisState>({
    paso: 1,
    quiereInstalacion: false,
    distAcometida: 20,
    distInterna: 10,
    canalizacion: 'sobrepuesta',
    conexion: 'ampliacion',
    costoInstalacionFinal: tcoResult.infoCarga.costoInstalacion,
    ofertasMarcadas: [],
    ofertaFinanciamiento: '',
    pie: 0,
    plazoMeses: 48,
  });

  const set = (partial: Partial<AnalisisState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  // Scroll al tope en cada cambio de paso
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.paso]);

  const handleVolver = () => {
    if (state.paso === 1) {
      navigate('/resultado');
    } else {
      set({ paso: (state.paso - 1) as AnalisisState['paso'] });
    }
  };

  const handleContinuar = () => {
    if (state.paso === 1) {
      // Fijar costo de instalación antes de pasar a Vista 2
      const mostrarForm = tcoResult.infoCarga.tramo !== 'viaje' || state.quiereInstalacion;
      let costoFinal = 0;
      if (mostrarForm) {
        const { min, max } = calcularRangoInstalacion(
          state.distAcometida, state.distInterna, state.canalizacion, state.conexion
        );
        costoFinal = Math.round((min + max) / 2 / 1000) * 1000;
      }
      set({ paso: 2, costoInstalacionFinal: costoFinal });
    } else if (state.paso < 4) {
      set({ paso: (state.paso + 1) as AnalisisState['paso'] });
    }
  };

  const usoLabel = {
    cotidiano: 'Uso cotidiano',
    'taxi-app': 'Taxi / App',
    'flota-pyme': 'Flota pyme',
  }[diagData.usoPrincipal];

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="flex-1 py-10">
        <Container narrow>

          {/* Encabezado */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="verde">
                <Zap className="w-3 h-3" />
                Análisis completo
              </Badge>
              <span className="text-xs text-[#9CA3AF]">
                {diagData.region} · {diagData.kmDia} km/día · {usoLabel}
                {sesion.nombre !== 'Usuario' && ` · ${sesion.nombre}`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F3D2E]">
              Tu análisis personalizado
            </h1>
          </div>

          {/* Indicador de progreso */}
          <div className="mb-8">
            <Stepper steps={PASOS_LABELS} currentStep={state.paso - 1} />
          </div>

          {/* Contenido del paso actual */}
          <div className="mb-8">
            {state.paso === 1 && (
              <Vista1Estimador infoCarga={tcoResult.infoCarga} state={state} set={set} />
            )}
            {state.paso === 2 && <Vista2Placeholder />}
            {state.paso === 3 && <Vista3Placeholder />}
            {state.paso === 4 && <Vista4Placeholder />}
          </div>

          {/* Navegación inferior */}
          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" size="md" onClick={handleVolver}>
              <ArrowLeft className="w-4 h-4" />
              {state.paso === 1 ? 'Volver al diagnóstico' : 'Volver'}
            </Button>
            {state.paso < 4 ? (
              <Button size="md" onClick={handleContinuar}>
                Continuar
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="md" variant="secondary" disabled>
                Finalizar
              </Button>
            )}
          </div>

        </Container>
      </main>

      <Footer />
    </div>
  );
}
