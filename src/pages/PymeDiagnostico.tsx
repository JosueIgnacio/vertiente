import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Building2,
  BarChart2,
  Zap,
  FileText,
  Users,
  X,
  Loader2,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Stepper from '../components/ui/Stepper';
import type {
  TipoVehiculo,
  SeleccionTipo,
  DatosSitio,
  DiagnosticoFlota,
  PlanInfraestructura,
} from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="block text-sm font-medium text-[#374151]">{children}</label>
      {hint && <p className="text-xs text-[#9CA3AF] mt-0.5">{hint}</p>}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-3 text-sm text-[#111827] border border-[#E5E7EB] rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
    />
  );
}

function EmailInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="email"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 text-sm text-[#111827] border border-[#E5E7EB] rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all"
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 text-sm text-[#111827] border border-[#E5E7EB] rounded-xl bg-white outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent transition-all cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function ToggleGroup<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; desc?: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`
            px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer text-left
            ${
              value === o.value
                ? 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D] shadow-sm'
                : 'border-[#E5E7EB] text-[#374151] hover:border-[#16A34A] hover:bg-[#F9FAFB]'
            }
          `}
        >
          <span className="block">{o.label}</span>
          {o.desc && <span className="block text-xs opacity-60 font-normal mt-0.5">{o.desc}</span>}
        </button>
      ))}
    </div>
  );
}

// ── Estado del flujo ──────────────────────────────────────────────────────────

interface PymeState {
  paso: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  empresa: { nombre: string; rubro: string; tamano: '2-5' | '6-20' | '20+' };
  contacto: { nombre: string; correo: string; telefono: string };
  flota: TipoVehiculo[];
  seleccion: SeleccionTipo[];
  sitio: DatosSitio;
  analisisFlota: DiagnosticoFlota | null;
  planInfraestructura: PlanInfraestructura | null;
}

const DEFAULT_SITIO: DatosSitio = {
  estacionamientos: 5,
  potenciaConectada: 50,
  distAcometida: 20,
  distInterna: 10,
  canalizacion: 'sobrepuesta',
  empalme: 'ampliacion',
  quiereCargaRapida: false,
};

const INITIAL_STATE: PymeState = {
  paso: 1,
  empresa: { nombre: '', rubro: 'Transporte', tamano: '2-5' },
  contacto: { nombre: '', correo: '', telefono: '' },
  flota: [],
  seleccion: [],
  sitio: DEFAULT_SITIO,
  analisisFlota: null,
  planInfraestructura: null,
};

const PASOS_LABELS = [
  'Alcance',
  'Flota',
  'Diagnóstico',
  'Selección',
  'Sitio',
  'Infraestructura',
  'Dashboard',
  'Bancos',
  'Proveedores',
];

const RUBROS = [
  'Transporte',
  'Reparto y Logística',
  'Construcción',
  'Servicios',
  'Retail',
  'Alimentación',
  'Salud',
  'Otro',
];

// ── Modal de pago simulado ────────────────────────────────────────────────────

function ModalPago({
  onConfirm,
  onClose,
}: {
  onConfirm: (contacto: { nombre: string; correo: string; telefono: string }) => void;
  onClose: () => void;
}) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [procesando, setProcesando] = useState(false);

  const canSubmit = nombre.trim() !== '' && correo.trim() !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setProcesando(true);
    setTimeout(() => {
      onConfirm({ nombre, correo, telefono });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 z-10">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#9CA3AF] hover:text-[#374151] hover:bg-[#F9FAFB] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-[#15803D]" />
          </div>
          <h2 className="text-xl font-bold text-[#0F3D2E] mb-1">
            Confirmar diagnóstico pyme
          </h2>
          <p className="text-sm text-[#6B7280]">
            Pago simulado — no se realizará ningún cobro real.
          </p>
        </div>

        {/* Precio */}
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl px-5 py-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#6B7280] mb-0.5">Diagnóstico pyme completo</p>
              <p className="text-2xl font-black text-[#0F3D2E]">$159.990</p>
            </div>
            <CheckCircle2 className="w-6 h-6 text-[#16A34A]" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <FieldLabel>Nombre de contacto *</FieldLabel>
            <TextInput
              value={nombre}
              onChange={setNombre}
              placeholder="ej. María González"
              required
            />
          </div>
          <div>
            <FieldLabel>Correo electrónico *</FieldLabel>
            <EmailInput
              value={correo}
              onChange={setCorreo}
              placeholder="contacto@empresa.cl"
            />
          </div>
          <div>
            <FieldLabel>Teléfono (opcional)</FieldLabel>
            <TextInput
              value={telefono}
              onChange={setTelefono}
              placeholder="+56 9 1234 5678"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            fullWidth
            disabled={!canSubmit || procesando}
            className="mt-2"
          >
            {procesando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando…
              </>
            ) : (
              <>
                Confirmar — $159.990
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          <p className="text-[10px] text-[#9CA3AF] text-center">
            Datos referenciales. No constituye transacción real. Acceso inmediato al flujo completo.
          </p>
        </form>
      </div>
    </div>
  );
}

// ── Paso 1: Alcance + calificador ─────────────────────────────────────────────

const INCLUYE_ITEMS = [
  {
    icon: <BarChart2 className="w-5 h-5" />,
    titulo: 'Análisis TCO por tipo de vehículo',
    desc: 'Calcula el costo total de propiedad y el punto de equilibrio para cada grupo de tu flota.',
  },
  {
    icon: <CheckCircle2 className="w-5 h-5" />,
    titulo: 'Priorización de recambio',
    desc: 'Ranking de qué vehículos conviene electrificar primero según payback ajustado y antigüedad.',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    titulo: 'Plan de infraestructura de carga',
    desc: 'Dimensionamiento de cargadores AC/DC según ventanas de operación y sitio físico.',
  },
  {
    icon: <BarChart2 className="w-5 h-5" />,
    titulo: 'Dashboard consolidado del proyecto',
    desc: 'Vista final con los vehículos elegidos, inversión total, ahorro y CO₂ evitado.',
  },
  {
    icon: <FileText className="w-5 h-5" />,
    titulo: 'Informe PDF descargable',
    desc: 'Documento ejecutivo listo para presentar a gerencia o directorio.',
  },
  {
    icon: <Users className="w-5 h-5" />,
    titulo: 'Contacto con bancos y proveedores',
    desc: 'Fichas con QR-comprobante para iniciar conversaciones con financistas y concesionarios EV.',
  },
];

function Paso1({
  empresa,
  onEmpresaChange,
  onPagar,
}: {
  empresa: PymeState['empresa'];
  onEmpresaChange: (e: Partial<PymeState['empresa']>) => void;
  onPagar: () => void;
}) {
  const canPagar = empresa.nombre.trim() !== '';

  return (
    <div className="flex flex-col gap-8">
      {/* Hero pyme */}
      <div
        className="rounded-3xl p-8 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F3D2E 0%, #16553A 60%, #1A6B47 100%)',
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 60px)',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-[#FACC15]" />
            <span className="text-[#FACC15] text-xs font-semibold uppercase tracking-wider">
              Diagnóstico pyme
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">
            Electrifica tu flota<br />
            <span className="text-[#4ADE80]">con datos reales</span>
          </h1>
          <p className="text-white/70 text-sm max-w-lg leading-relaxed">
            Análisis completo de tu flota vehicular: TCO por tipo, priorización de recambio,
            plan de infraestructura, informe PDF y contacto con bancos y proveedores.
          </p>
        </div>
      </div>

      {/* Qué incluye */}
      <div>
        <h2 className="text-lg font-bold text-[#0F3D2E] mb-4">¿Qué incluye el diagnóstico?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INCLUYE_ITEMS.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-2xl border border-[#E5E7EB] bg-white hover:border-[#BBF7D0] hover:bg-[#F0FDF4] transition-all duration-150"
            >
              <div className="w-9 h-9 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#15803D] shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">{item.titulo}</p>
                <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calificador */}
      <Card padding="lg">
        <h2 className="text-base font-bold text-[#0F3D2E] mb-5">
          Cuéntanos sobre tu empresa
        </h2>
        <div className="flex flex-col gap-5">
          <div>
            <FieldLabel>Nombre de la empresa *</FieldLabel>
            <TextInput
              value={empresa.nombre}
              onChange={(v) => onEmpresaChange({ nombre: v })}
              placeholder="ej. Transportes del Sur Ltda."
            />
          </div>

          <div>
            <FieldLabel>Rubro principal</FieldLabel>
            <SelectInput
              value={empresa.rubro}
              onChange={(v) => onEmpresaChange({ rubro: v })}
              options={RUBROS.map((r) => ({ value: r, label: r }))}
            />
          </div>

          <div>
            <FieldLabel>Tamaño aproximado de flota</FieldLabel>
            <ToggleGroup<'2-5' | '6-20' | '20+'>
              value={empresa.tamano}
              onChange={(v) => onEmpresaChange({ tamano: v })}
              options={[
                { value: '2-5', label: '2–5 vehículos', desc: 'Flota pequeña' },
                { value: '6-20', label: '6–20 vehículos', desc: 'Flota mediana' },
                { value: '20+', label: 'Más de 20', desc: 'Flota grande' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Precio + CTA */}
      <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#9CA3AF] uppercase tracking-wider mb-0.5">
            Precio diagnóstico base
          </p>
          <p className="text-3xl font-black text-[#0F3D2E]">$159.990</p>
          <p className="text-xs text-[#6B7280] mt-1">
            Flota {empresa.tamano} vehículos · Informe + contacto bancario y de proveedores
          </p>
        </div>
        <button
          type="button"
          onClick={onPagar}
          disabled={!canPagar}
          className="shrink-0 bg-[#FACC15] text-[#0F3D2E] font-bold px-8 py-4 rounded-2xl flex items-center gap-2 hover:bg-yellow-300 transition-colors cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          Continuar con el diagnóstico — $159.990
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Stubs para pasos 2–9 ──────────────────────────────────────────────────────

function PasoEnConstruccion({ paso }: { paso: number }) {
  return (
    <Card padding="lg" className="text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-[#DCFCE7] flex items-center justify-center mx-auto mb-4">
        <Building2 className="w-8 h-8 text-[#15803D]" />
      </div>
      <h2 className="text-xl font-bold text-[#0F3D2E] mb-2">Paso {paso}</h2>
      <p className="text-sm text-[#6B7280]">Este paso se implementa en las próximas etapas.</p>
    </Card>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function PymeDiagnostico() {
  const navigate = useNavigate();
  const [state, setState] = useState<PymeState>(INITIAL_STATE);
  const [showModalPago, setShowModalPago] = useState(false);

  // Scroll al tope al cambiar de paso
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [state.paso]);

  const set = (partial: Partial<PymeState>) =>
    setState((prev) => ({ ...prev, ...partial }));

  const setEmpresa = (partial: Partial<PymeState['empresa']>) =>
    setState((prev) => ({ ...prev, empresa: { ...prev.empresa, ...partial } }));

  const irAPaso = (paso: PymeState['paso']) => set({ paso });

  const pasoAnterior = () => {
    if (state.paso === 1) {
      navigate('/pyme');
    } else {
      irAPaso((state.paso - 1) as PymeState['paso']);
    }
  };

  const pasoSiguiente = () => {
    if (state.paso < 9) {
      irAPaso((state.paso + 1) as PymeState['paso']);
    }
  };

  const handlePagoConfirmado = (contacto: PymeState['contacto']) => {
    setState((prev) => ({ ...prev, contacto, paso: 2 }));
    setShowModalPago(false);
  };

  // Validación del botón "Continuar" por paso
  const puedeAvanzar = (): boolean => {
    switch (state.paso) {
      case 1: return false; // Paso 1 usa el modal de pago, no el botón de navegación
      case 2: return state.flota.length >= 1;
      default: return true;
    }
  };

  const renderPaso = () => {
    switch (state.paso) {
      case 1:
        return (
          <Paso1
            empresa={state.empresa}
            onEmpresaChange={setEmpresa}
            onPagar={() => {
              if (state.empresa.nombre.trim()) setShowModalPago(true);
            }}
          />
        );
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
        return <PasoEnConstruccion paso={state.paso} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="flex-1 py-10">
        <Container narrow>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-6">
            <span>Empresas</span>
            <span>›</span>
            <span className="text-[#374151] font-medium">Diagnóstico de flota</span>
            {state.paso > 1 && (
              <>
                <span>›</span>
                <span className="text-[#374151]">{state.empresa.nombre}</span>
              </>
            )}
          </div>

          {/* Stepper */}
          <div className="mb-8 overflow-x-auto pb-2">
            <Stepper steps={PASOS_LABELS} currentStep={state.paso - 1} />
          </div>

          {/* Indicador texto */}
          <div className="text-center mb-8">
            <span className="inline-block bg-[#0F3D2E] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              Paso {state.paso} de 9 — {PASOS_LABELS[state.paso - 1]}
            </span>
          </div>

          {/* Contenido del paso */}
          {renderPaso()}

          {/* Navegación inferior (solo pasos 2+) */}
          {state.paso > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#E5E7EB]">
              <Button
                type="button"
                variant="outline"
                onClick={pasoAnterior}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>

              {state.paso < 9 && (
                <Button
                  type="button"
                  onClick={pasoSiguiente}
                  disabled={!puedeAvanzar()}
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </Container>
      </main>

      <Footer />

      {/* Modal pago */}
      {showModalPago && (
        <ModalPago
          onConfirm={handlePagoConfirmado}
          onClose={() => setShowModalPago(false)}
        />
      )}
    </div>
  );
}
