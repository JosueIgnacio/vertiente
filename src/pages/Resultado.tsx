import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, RotateCcw, Zap, BatteryCharging, TrendingDown, Clock,
  Banknote, Lock, X, Plug, Car, Wrench, CreditCard, Users,
  Bookmark, FileText, Building2, ChevronRight,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import TCOChart from '../components/charts/TCOChart';
import { calcularTCO } from '../lib/tco';
import { formatCLP, formatCLPMillon, formatAnios } from '../lib/format';
import { DIAGNOSTICO_DEFAULTS, PRECIO_EV_ESTANDAR, REVENTA_COMBUSTION, CONSUMO_EV_KM_KWH } from '../data/mockDefaults';
import type { DiagnosticoData, InfoCarga } from '../types';

// ── Carga de datos ────────────────────────────────────────────────────────────

function loadData(): DiagnosticoData {
  try {
    const raw = localStorage.getItem('evmarket_diagnostico');
    if (raw) return JSON.parse(raw) as DiagnosticoData;
  } catch (_) { /* noop */ }
  return DIAGNOSTICO_DEFAULTS;
}

// ── Modal de registro ─────────────────────────────────────────────────────────

function ModalRegistro({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    // Simulado: espera 800ms y "registra"
    setTimeout(() => {
      onSuccess();
      setLoading(false);
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative">
        {/* Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#374151] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-5 h-5 text-[#16A34A]" />
          <span className="font-bold text-[#0F3D2E] text-lg">evmarket</span>
        </div>
        <h2 className="text-xl font-bold text-[#111827] mb-1">
          Crea tu cuenta gratis
        </h2>
        <p className="text-sm text-[#6B7280] mb-6">
          Accede a tu diagnóstico completo: gráfico TCO, ahorro mensual y punto de equilibrio.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              Correo electrónico
            </label>
            <input
              type="email"
              required
              placeholder="tu@correo.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              className="w-full px-4 py-3 text-sm border border-[#E5E7EB] rounded-xl outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
            />
          </div>

          <Button type="submit" fullWidth disabled={loading} className="mt-1">
            {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>

        <p className="text-xs text-[#9CA3AF] text-center mt-4">
          Al registrarte aceptas los términos de uso. Sin spam.
        </p>
      </div>
    </div>
  );
}

// ── Sección 1: Alternativa eléctrica asignada ─────────────────────────────────

function SeccionAlternativa({ infoCarga }: { infoCarga: InfoCarga }) {
  const conInstalacion = infoCarga.tramo !== 'viaje';

  const stats = [
    { label: 'Precio referencial', value: formatCLPMillon(PRECIO_EV_ESTANDAR) },
    { label: 'Consumo', value: `${CONSUMO_EV_KM_KWH} km / kWh` },
    { label: 'Reventa tu auto actual', value: `−${formatCLPMillon(REVENTA_COMBUSTION)}` },
    ...(conInstalacion
      ? [{ label: 'Cargador domiciliario', value: `+${formatCLPMillon(infoCarga.costoInstalacion)}` }]
      : []),
  ];

  return (
    <Card padding="lg" className="border-[#DCFCE7]">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#16A34A]">
          <BatteryCharging className="w-4 h-4" />
        </div>
        <h2 className="font-semibold text-[#111827]">Tu alternativa eléctrica</h2>
        <Badge variant="verde" className="ml-auto text-[10px]">Asignado para ti</Badge>
      </div>

      <div className={`grid gap-4 mb-4 ${conInstalacion ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
        {stats.map((s) => (
          <div key={s.label} className="bg-[#F9FAFB] rounded-xl p-4 border border-[#F3F4F6]">
            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-base font-bold text-[#111827]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 text-sm text-[#374151] leading-relaxed">
        <span className="font-medium text-[#15803D]">¿Por qué este auto?</span>{' '}
        Para tu comparación usamos un vehículo eléctrico estándar de{' '}
        <strong>{formatCLPMillon(PRECIO_EV_ESTANDAR)}</strong>, con un rendimiento de{' '}
        <strong>{CONSUMO_EV_KM_KWH} km/kWh</strong>, evaluado bajo la misma operación que
        reportaste.{conInstalacion && (
          <> La inversión incluye la instalación del cargador domiciliario
          ({formatCLPMillon(infoCarga.costoInstalacion)} referencial, fuente AgenciaSE 2026).</>
        )}{' '}
        Nosotros hacemos la comparación por ti.
      </div>
    </Card>
  );
}

// ── Sección 2: Tipo de carga ──────────────────────────────────────────────────

function SeccionCarga({ result }: { result: ReturnType<typeof calcularTCO> }) {
  const { infoCarga, costoEnergiaEVMes } = result;

  const tramoInfo: Record<InfoCarga['tramo'], { titulo: string; desc: string; colorBg: string; colorBorder: string; colorText: string }> = {
    viaje: {
      titulo: 'Cargador de viaje (2,3 kW)',
      desc: 'Enchufe estándar doméstico. No requiere instalación especial ni inversión adicional.',
      colorBg: 'bg-[#F0FDF4]', colorBorder: 'border-[#DCFCE7]', colorText: 'text-[#15803D]',
    },
    domiciliario: {
      titulo: 'Cargador domiciliario dedicado (7,4 kW)',
      desc: 'Requiere instalación eléctrica certificada. Costo estándar estimado: $1.900.000 (fuente: AgenciaSE 2026).',
      colorBg: 'bg-[#EFF6FF]', colorBorder: 'border-[#BFDBFE]', colorText: 'text-[#1D4ED8]',
    },
    mixto: {
      titulo: 'Cargador domiciliario (7,4 kW) + carga pública',
      desc: 'Tu kilometraje supera lo que cubre la carga nocturna en casa. El excedente diario se cubre en la red pública. Costo de instalación estimado: $1.900.000 (AgenciaSE 2026).',
      colorBg: 'bg-[#FFFBEB]', colorBorder: 'border-[#FDE68A]', colorText: 'text-[#92400E]',
    },
  };

  const info = tramoInfo[infoCarga.tramo];

  return (
    <Card padding="lg">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#F0FDF4] flex items-center justify-center text-[#16A34A]">
          <Plug className="w-4 h-4" />
        </div>
        <h2 className="font-semibold text-[#111827]">Tu tipo de carga recomendado</h2>
      </div>

      {/* Supuestos fijos */}
      <div className="flex items-center gap-2 mb-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2.5">
        <span className="text-xs text-[#6B7280]">
          Estimación basada en{' '}
          <strong className="text-[#374151]">6 horas</strong> de carga nocturna y{' '}
          <strong className="text-[#374151]">5 km/kWh</strong> de rendimiento.
        </span>
      </div>

      {/* Card del cargador según tramo */}
      <div className={`rounded-xl p-4 border ${info.colorBg} ${info.colorBorder} mb-4`}>
        <p className={`text-sm font-semibold mb-1 ${info.colorText}`}>{info.titulo}</p>
        <p className="text-xs text-[#374151] leading-relaxed">{info.desc}</p>
      </div>

      {/* Costo mensual de energía */}
      <div className="flex items-center gap-2 text-xs text-[#6B7280]">
        <span className="text-[#16A34A]">→</span>
        Costo mensual estimado de energía:{' '}
        <strong className="text-[#374151] ml-1">{formatCLP(costoEnergiaEVMes)}</strong>
      </div>
    </Card>
  );
}

// ── Sección 3: Gráfico TCO ────────────────────────────────────────────────────

function SeccionGrafico({ result }: { result: ReturnType<typeof calcularTCO> }) {
  return (
    <Card padding="lg">
      <div className="flex items-start justify-between mb-1 gap-2">
        <h2 className="font-semibold text-[#111827]">
          Costo acumulado a {Math.round(result.totalMeses / 12)} años
        </h2>
        <span className="hidden sm:block text-xs text-[#9CA3AF] shrink-0">Combustión vs. Eléctrico</span>
      </div>
      <p className="text-xs text-[#9CA3AF] mb-2">
        La curva eléctrica parte en{' '}
        <strong className="text-[#374151]">{formatCLPMillon(result.inversionNetaEV)}</strong>{' '}
        (no en {formatCLPMillon(PRECIO_EV_ESTANDAR)}), porque se descuenta la reventa
        estimada de tu auto a combustión ({formatCLPMillon(REVENTA_COMBUSTION)}).
      </p>
      <TCOChart result={result} />
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 mt-3 text-xs text-[#9CA3AF]">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#9CA3AF] inline-block" /> Combustión: costo operacional acumulado (sin inversión inicial)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#16A34A] inline-block" /> Eléctrico: inversión neta + costos operacionales
        </span>
      </div>
    </Card>
  );
}

// ── Sección 4: Indicadores clave ──────────────────────────────────────────────

function SeccionIndicadores({ result }: { result: ReturnType<typeof calcularTCO> }) {
  const ahorroPositivo = result.ahorroOperacionalMes > 0;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-semibold text-[#111827] text-base">Indicadores clave</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Ahorro mensual estimado"
          value={
            ahorroPositivo
              ? formatCLP(result.ahorroOperacionalMes)
              : `−${formatCLP(Math.abs(result.ahorroOperacionalMes))}`
          }
          sublabel="en costos operacionales vs. tu auto actual"
          icon={<TrendingDown className="w-5 h-5" />}
          accent={ahorroPositivo}
        />
        <StatCard
          label="Ahorro acumulado a 5 años"
          value={ahorroPositivo ? formatCLPMillon(result.ahorroA5Anios) : '—'}
          sublabel="solo en costos operacionales"
          icon={<Banknote className="w-5 h-5" />}
          accent={ahorroPositivo}
        />
        <StatCard
          label="Punto de equilibrio"
          value={formatAnios(result.puntoEquilibrioAnios)}
          sublabel={`Inversión neta: ${formatCLPMillon(result.inversionNetaEV)}`}
          icon={<Clock className="w-5 h-5" />}
        />
      </div>
      <p className="text-xs text-[#9CA3AF]">
        * Valores referenciales. No constituyen asesoría financiera. Basados en supuestos estándar de mercado chileno.
      </p>
    </div>
  );
}

// ── Muro difuminado ───────────────────────────────────────────────────────────

function PaywallBlur({
  children,
  onRegistrar,
}: {
  children: React.ReactNode;
  onRegistrar: () => void;
}) {
  return (
    <div className="relative">
      {/* Contenido difuminado */}
      <div
        className="pointer-events-none select-none"
        style={{ filter: 'blur(6px)', opacity: 0.7 }}
      >
        {children}
      </div>

      {/* Overlay degradado + CTA */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
        style={{
          background: 'linear-gradient(to bottom, rgba(249,250,251,0.3) 0%, rgba(249,250,251,0.92) 40%, rgba(249,250,251,1) 100%)',
        }}
      >
        <div className="flex flex-col items-center gap-3 px-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[#0F3D2E] flex items-center justify-center shadow-lg">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-[#0F3D2E] text-lg leading-tight">
            Regístrate gratis para ver<br />tu diagnóstico completo
          </h3>
          <p className="text-sm text-[#6B7280] max-w-xs">
            Accede al tipo de carga recomendado, el gráfico TCO y los indicadores de ahorro.
          </p>
          <Button size="md" onClick={onRegistrar}>
            Crear cuenta gratis
            <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="text-xs text-[#9CA3AF]">Sin tarjeta de crédito · Sin spam</p>
        </div>
      </div>
    </div>
  );
}

// ── Ruta recomendada (post-registro) ─────────────────────────────────────────

const PROXIMOS_PASOS = [
  { icon: <Plug className="w-4 h-4" />, titulo: 'Validar factibilidad de carga', desc: 'Revisa si tu vivienda o empresa puede instalar un cargador domiciliario.' },
  { icon: <Car className="w-4 h-4" />, titulo: 'Comparar modelos eléctricos recomendados', desc: 'Evalúa opciones con mayor autonomía y disponibilidad en Chile.' },
  { icon: <Wrench className="w-4 h-4" />, titulo: 'Cotizar instalación del cargador', desc: 'Una instalación domiciliaria tipo Wall Box oscila entre $600.000 y $1.200.000.' },
  { icon: <CreditCard className="w-4 h-4" />, titulo: 'Evaluar financiamiento, leasing o renting', desc: 'Hay alternativas que mejoran el flujo de caja sin desembolso inicial alto.' },
  { icon: <Users className="w-4 h-4" />, titulo: 'Conectar con proveedores y dar el salto', desc: 'Coordina la instalación y programa la transición a tu ritmo.' },
];

function RutaRecomendada() {
  return (
    <div className="mt-10 flex flex-col gap-6">
      {/* Próximos pasos */}
      <Card padding="lg">
        <h2 className="font-bold text-[#0F3D2E] text-lg mb-5">Próximos pasos</h2>
        <div className="flex flex-col gap-0">
          {PROXIMOS_PASOS.map((paso, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex flex-col items-center shrink-0 pt-1">
                <div className="w-8 h-8 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0">
                  {paso.icon}
                </div>
                {i < PROXIMOS_PASOS.length - 1 && (
                  <div className="w-0.5 h-6 bg-[#E5E7EB] my-1" />
                )}
              </div>
              <div className="pb-5">
                <p className="text-sm font-semibold text-[#111827]">{paso.titulo}</p>
                <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{paso.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 3 CTAs */}
      <div>
        <h2 className="font-bold text-[#111827] text-base mb-3">¿Qué quieres hacer ahora?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Guardar simulación */}
          <button
            type="button"
            className="text-left rounded-2xl border border-[#E5E7EB] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer bg-white"
          >
            <Bookmark className="w-5 h-5 text-[#6B7280] mb-3" />
            <p className="font-semibold text-sm text-[#111827] mb-1">Guardar mi simulación</p>
            <p className="text-xs text-[#6B7280] leading-relaxed mb-3">
              Recibe tu análisis por correo para revisarlo cuando quieras.
            </p>
            <span className="text-xs font-semibold text-[#16A34A]">Gratis</span>
          </button>

          {/* Análisis completo */}
          <button
            type="button"
            className="text-left rounded-2xl border-2 border-[#0F3D2E] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 cursor-pointer bg-white relative overflow-hidden"
          >
            <div className="absolute top-3 right-3">
              <Badge variant="verde" className="text-[10px]">Recomendado</Badge>
            </div>
            <FileText className="w-5 h-5 text-[#0F3D2E] mb-3" />
            <p className="font-semibold text-sm text-[#111827] mb-1">Análisis completo</p>
            <p className="text-xs text-[#6B7280] leading-relaxed mb-3">
              Factibilidad de carga, comparación de modelos, cotización de instalación, financiamiento y contacto con proveedores.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#0F3D2E]">$14.990</span>
              <span className="text-xs text-[#9CA3AF] line-through">$29.990</span>
            </div>
          </button>

          {/* Asesoría pyme */}
          <Link
            to="/pyme"
            className="text-left rounded-2xl border border-[#FDE047] bg-[#FEFCE8] p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 no-underline"
          >
            <Building2 className="w-5 h-5 text-[#92400E] mb-3" />
            <p className="font-semibold text-sm text-[#111827] mb-1">Quiero asesoría pyme</p>
            <p className="text-xs text-[#6B7280] leading-relaxed mb-3">
              Diagnóstico de flota completo con informe personalizado y reuniones de acompañamiento.
            </p>
            <span className="text-xs font-semibold text-[#92400E] flex items-center gap-1">
              Desde $99.990 <ChevronRight className="w-3 h-3" />
            </span>
          </Link>

        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function Resultado() {
  const simData = useMemo(loadData, []);
  const result = useMemo(() => calcularTCO(simData), [simData]);

  // Estado de registro — siempre parte en false; no persiste entre sesiones
  const [registered, setRegistered] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleRegistrationSuccess = () => {
    setRegistered(true);
    setShowModal(false);
  };

  const usoLabel = {
    cotidiano: 'Uso cotidiano',
    'taxi-app': 'Taxi / App',
    'flota-pyme': 'Flota pyme',
  }[simData.usoPrincipal];

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Navbar />

      {/* Modal de registro */}
      {showModal && (
        <ModalRegistro
          onClose={() => setShowModal(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}

      <main className="flex-1 py-10">
        <Container narrow>

          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="verde">
                  <Zap className="w-3 h-3" />
                  Tu diagnóstico
                </Badge>
                <span className="text-xs text-[#9CA3AF]">
                  {simData.region} · {simData.kmDia} km/día · {usoLabel}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#0F3D2E]">
                Diagnóstico de electromovilidad
              </h1>
            </div>
            <Link to="/simulador">
              <Button variant="outline" size="sm">
                <RotateCcw className="w-4 h-4" />
                Recalcular
              </Button>
            </Link>
          </div>

          {/* ── Sección 1: Alternativa eléctrica — siempre visible ── */}
          <div className="mb-6">
            <SeccionAlternativa infoCarga={result.infoCarga} />
          </div>

          {/* ── Secciones 2–4: difuminadas hasta registro ── */}
          {registered ? (
            // Revelado completo
            <div className="flex flex-col gap-6">
              <SeccionCarga result={result} />
              <SeccionGrafico result={result} />
              <SeccionIndicadores result={result} />
            </div>
          ) : (
            // Paywall
            <PaywallBlur onRegistrar={() => setShowModal(true)}>
              <div className="flex flex-col gap-6">
                <SeccionCarga result={result} />
                <SeccionGrafico result={result} />
                <SeccionIndicadores result={result} />
              </div>
            </PaywallBlur>
          )}

          {/* ── Ruta recomendada (solo post-registro) ── */}
          {registered && <RutaRecomendada />}

        </Container>
      </main>

      <Footer />
    </div>
  );
}
