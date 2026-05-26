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
import { DIAGNOSTICO_DEFAULTS } from '../data/mockDefaults';
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

// ── Vistas placeholder ─────────────────────────────────────────────────────────

function Vista1Placeholder({ infoCarga }: { infoCarga: InfoCarga }) {
  return (
    <Card padding="lg">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-[#16A34A]" />
        <h2 className="font-semibold text-[#111827]">Estimador de instalación de carga</h2>
        <Badge variant="verde" className="ml-auto text-[10px]">Paso 1</Badge>
      </div>
      <p className="text-sm text-[#6B7280]">
        Tramo detectado: <strong className="text-[#111827]">{infoCarga.tramo}</strong>.
        Aquí irá el estimador de instalación (Etapa 2).
      </p>
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
    if (state.paso < 4) {
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
            {state.paso === 1 && <Vista1Placeholder infoCarga={tcoResult.infoCarga} />}
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
