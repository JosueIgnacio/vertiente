import { useState, useEffect, useMemo } from 'react';
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
  Trash2,
  Plus,
  Truck,
  TrendingDown,
  Leaf,
  Car,
  AlertTriangle,
  Phone,
  Mail,
  Download,
  FlaskConical,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Stepper from '../components/ui/Stepper';
import StatCard from '../components/ui/StatCard';
import TCOChart from '../components/charts/TCOChart';
import { analizarFlota, generarSeriesFlota } from '../lib/flotaAnalysis';
import { dimensionarInfraestructura } from '../lib/infraestructuraPyme';
import { formatCLP, formatCLPMillon, formatAnios } from '../lib/format';
import { MODELOS } from '../data/modelos';
import { OFERTAS } from '../data/ofertas';
import { PROVEEDORES } from '../data/proveedores';
import { SEGMENTOS } from '../data/segmentos';
import { BANCOS } from '../data/bancos';
import type {
  TipoVehiculo,
  SeleccionTipo,
  DatosSitio,
  DiagnosticoFlota,
  PlanInfraestructura,
  ModeloEV,
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

// ── Datos demo para modo admin ────────────────────────────────────────────────

const ADMIN_DEMO_FLOTA: TipoVehiculo[] = [
  {
    id: 'admin-pickup-1',
    etiqueta: 'Camionetas de reparto',
    carroceria: 'pickup',
    cantidad: 5,
    antiguedadAnios: 7,
    kmDia: 130,
    horasOperacion: 8,
    rendimientoKmL: 10,
    mantencionAnual: 900_000,
  },
  {
    id: 'admin-furgon-1',
    etiqueta: 'Furgones logística',
    carroceria: 'furgon',
    cantidad: 3,
    antiguedadAnios: 4,
    kmDia: 80,
    horasOperacion: 9,
    rendimientoKmL: 9,
    mantencionAnual: 650_000,
  },
];

const ADMIN_DEMO_SELECCION: SeleccionTipo[] = [
  {
    tipoId: 'admin-pickup-1',
    cantidadRecambio: 3,
    ofertas: [{ ofertaId: 'verde-t90', unidades: 3 }],
  },
  {
    tipoId: 'admin-furgon-1',
    cantidadRecambio: 2,
    ofertas: [{ ofertaId: 'verde-edelivery', unidades: 2 }],
  },
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

// ── Paso 2: Caracterización de flota ─────────────────────────────────────────

function NumberInput({
  value,
  onChange,
  min,
  max,
  prefix,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center border border-[#E5E7EB] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#16A34A] focus-within:border-transparent transition-all">
      {prefix && (
        <span className="px-3 bg-[#F9FAFB] border-r border-[#E5E7EB] text-sm text-[#6B7280] flex items-center py-3 shrink-0">
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 px-4 py-3 text-sm text-[#111827] outline-none bg-white min-w-0"
      />
      {suffix && (
        <span className="px-3 bg-[#F9FAFB] border-l border-[#E5E7EB] text-sm text-[#6B7280] flex items-center py-3 shrink-0">
          {suffix}
        </span>
      )}
    </div>
  );
}

type Carroceria = TipoVehiculo['carroceria'];

const CARROCERIA_LABELS: Record<Carroceria, string> = {
  citycar: 'City car',
  hatchback: 'Hatchback',
  sedan: 'Sedán',
  suv: 'SUV',
  pickup: 'Pickup',
  furgon: 'Furgón',
};

function crearTipoVacío(): TipoVehiculo {
  return {
    id: crypto.randomUUID(),
    etiqueta: '',
    carroceria: 'sedan',
    cantidad: 1,
    antiguedadAnios: 3,
    kmDia: 80,
    horasOperacion: 8,
    rendimientoKmL: 10,
    mantencionAnual: 540_000,
  };
}

function TipoVehiculoForm({
  tipo,
  index,
  total,
  onChange,
  onEliminar,
}: {
  tipo: TipoVehiculo;
  index: number;
  total: number;
  onChange: (t: TipoVehiculo) => void;
  onEliminar: () => void;
}) {
  const set = (partial: Partial<TipoVehiculo>) => onChange({ ...tipo, ...partial });

  return (
    <Card padding="md" className="relative">
      {/* Header del tipo */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0F3D2E] text-white flex items-center justify-center text-xs font-bold">
            {index + 1}
          </div>
          <span className="text-sm font-semibold text-[#374151]">
            {tipo.etiqueta || `Tipo de vehículo ${index + 1}`}
          </span>
        </div>
        {total > 1 && (
          <button
            type="button"
            onClick={onEliminar}
            className="p-2 rounded-xl text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            title="Eliminar este tipo"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Etiqueta */}
        <div className="sm:col-span-2">
          <FieldLabel hint='ej. "Camionetas de reparto", "Autos de vendedores"'>
            Etiqueta del grupo
          </FieldLabel>
          <TextInput
            value={tipo.etiqueta}
            onChange={(v) => set({ etiqueta: v })}
            placeholder="ej. Camionetas de reparto"
          />
        </div>

        {/* Carrocería */}
        <div>
          <FieldLabel>Carrocería</FieldLabel>
          <SelectInput
            value={tipo.carroceria}
            onChange={(v) => set({ carroceria: v as Carroceria })}
            options={Object.entries(CARROCERIA_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
          />
        </div>

        {/* Cantidad */}
        <div>
          <FieldLabel hint="Vehículos de este tipo">Cantidad</FieldLabel>
          <NumberInput
            value={tipo.cantidad}
            onChange={(v) => set({ cantidad: Math.max(1, v) })}
            min={1}
            suffix="vehículos"
          />
        </div>

        {/* Antigüedad */}
        <div>
          <FieldLabel>Antigüedad promedio</FieldLabel>
          <NumberInput
            value={tipo.antiguedadAnios}
            onChange={(v) => set({ antiguedadAnios: Math.max(0, v) })}
            min={0}
            suffix="años"
          />
        </div>

        {/* km/día */}
        <div>
          <FieldLabel>km / día por vehículo</FieldLabel>
          <NumberInput
            value={tipo.kmDia}
            onChange={(v) => set({ kmDia: Math.max(1, v) })}
            min={1}
            suffix="km"
          />
        </div>

        {/* Horas de operación */}
        <div>
          <FieldLabel hint="Crítico para dimensionar la infraestructura de carga">
            Horas de operación al día
          </FieldLabel>
          <NumberInput
            value={tipo.horasOperacion}
            onChange={(v) => set({ horasOperacion: Math.min(24, Math.max(1, v)) })}
            min={1}
            max={23}
            suffix="h / día"
          />
        </div>

        {/* Rendimiento */}
        <div>
          <FieldLabel hint="Sedán / hatchback: 10–14 km/L · Pickup/furgón: 7–10 km/L">
            Rendimiento actual
          </FieldLabel>
          <NumberInput
            value={tipo.rendimientoKmL}
            onChange={(v) => set({ rendimientoKmL: Math.max(1, v) })}
            min={1}
            suffix="km / L"
          />
        </div>

        {/* Mantención */}
        <div>
          <FieldLabel hint="Aceite, filtros, revisión técnica, frenos, etc.">
            Mantención anual promedio
          </FieldLabel>
          <NumberInput
            value={tipo.mantencionAnual}
            onChange={(v) => set({ mantencionAnual: Math.max(0, v) })}
            min={0}
            prefix="$"
            suffix="/ año"
          />
        </div>
      </div>
    </Card>
  );
}

function Paso2({
  flota,
  onFlotaChange,
}: {
  flota: TipoVehiculo[];
  onFlotaChange: (f: TipoVehiculo[]) => void;
}) {
  const agregarTipo = () => {
    onFlotaChange([...flota, crearTipoVacío()]);
  };

  const actualizarTipo = (index: number, tipo: TipoVehiculo) => {
    const nueva = [...flota];
    nueva[index] = tipo;
    onFlotaChange(nueva);
  };

  const eliminarTipo = (index: number) => {
    onFlotaChange(flota.filter((_, i) => i !== index));
  };

  // Total de vehículos sumados
  const totalVehiculos = flota.reduce((s, t) => s + t.cantidad, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0F3D2E] mb-1">
          Caracterización de flota
        </h2>
        <p className="text-sm text-[#6B7280]">
          Agrupa los vehículos de características similares. Cada grupo se analiza por separado
          para identificar cuáles conviene electrificar primero.
        </p>
      </div>

      {/* Resumen flotante */}
      {flota.length > 0 && (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#15803D]">
            <Truck className="w-4 h-4" />
            <span className="font-medium">
              {flota.length} {flota.length === 1 ? 'tipo' : 'tipos'} · {totalVehiculos}{' '}
              {totalVehiculos === 1 ? 'vehículo' : 'vehículos'} en total
            </span>
          </div>
          {flota.length >= 1 && (
            <span className="text-xs text-[#16A34A] font-medium">
              ✓ Listo para continuar
            </span>
          )}
        </div>
      )}

      {/* Lista de tipos */}
      {flota.map((tipo, i) => (
        <TipoVehiculoForm
          key={tipo.id}
          tipo={tipo}
          index={i}
          total={flota.length}
          onChange={(t) => actualizarTipo(i, t)}
          onEliminar={() => eliminarTipo(i)}
        />
      ))}

      {/* Botón agregar */}
      <button
        type="button"
        onClick={agregarTipo}
        className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-[#D1FAE5] rounded-2xl text-[#16A34A] text-sm font-medium hover:bg-[#F0FDF4] hover:border-[#16A34A] transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Agregar otro tipo de vehículo
      </button>

      {/* Validación */}
      {flota.length === 0 && (
        <p className="text-xs text-[#9CA3AF] text-center">
          Agrega al menos un tipo de vehículo para continuar.
        </p>
      )}
    </div>
  );
}

// ── Paso 3: Dashboard diagnóstico ────────────────────────────────────────────

const CARROCERIA_LABEL_ES: Record<string, string> = {
  citycar: 'City car', hatchback: 'Hatchback', sedan: 'Sedán',
  suv: 'SUV', pickup: 'Pickup', furgon: 'Furgón',
};

function Paso3({ analisis, flota }: { analisis: DiagnosticoFlota; flota: TipoVehiculo[] }) {
  const { serieCombustion, serieElectrico, puntoEquilibrioMes } = useMemo(
    () => generarSeriesFlota(flota, analisis.inversionNetaAgregada),
    [flota, analisis.inversionNetaAgregada],
  );

  // Carrocerías únicas en la flota
  const carroceriasUnicas = [...new Set(flota.map((t) => t.carroceria))];

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="text-xl font-bold text-[#0F3D2E] mb-1">Diagnóstico de tu flota</h2>
        <p className="text-sm text-[#6B7280]">
          Potencial si electrificara toda la flota caracterizada. Sin recomendaciones automáticas —
          tú decides qué conviene según tu operación.
        </p>
      </div>

      {/* Resumen ejecutivo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Ahorro mensual potencial"
          value={formatCLP(analisis.ahorroMensualAgregado)}
          sublabel="Si electrifica toda la flota"
          icon={<TrendingDown className="w-4 h-4" />}
          accent
        />
        <StatCard
          label="Ahorro a 5 años"
          value={formatCLPMillon(analisis.ahorroA5AniosAgregado)}
          sublabel="Acumulado operacional"
          icon={<BarChart2 className="w-4 h-4" />}
        />
        <StatCard
          label="CO₂ evitado / año"
          value={`${(analisis.co2EvitadoAnualAgregado / 1000).toFixed(1)} ton`}
          sublabel="Emisiones directas del vehículo"
          icon={<Leaf className="w-4 h-4" />}
        />
      </div>

      {/* Gráfico TCO */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-[#374151] mb-1">Costo acumulado — flota completa</h3>
        <p className="text-xs text-[#9CA3AF] mb-4">
          Combustión vs eléctrico · Inversión inicial: {formatCLPMillon(analisis.inversionNetaAgregada)}
          {puntoEquilibrioMes
            ? ` · Equilibrio estimado: año ${(puntoEquilibrioMes / 12).toFixed(1)}`
            : ''}
        </p>
        <TCOChart
          serieCombustion={serieCombustion}
          serieElectrico={serieElectrico}
          inversionTotal={analisis.inversionNetaAgregada}
        />
      </Card>

      {/* Ranking de priorización */}
      <div>
        <h3 className="text-base font-bold text-[#0F3D2E] mb-3">
          Ranking de priorización
        </h3>
        <div className="flex flex-col gap-3">
          {analisis.tipos.map((dt, i) => (
            <Card key={dt.tipo.id} padding="md" className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Posición */}
              <div className="shrink-0 flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0
                      ? 'bg-[#16A34A] text-white'
                      : i < Math.ceil(analisis.tipos.length / 2)
                      ? 'bg-[#DCFCE7] text-[#15803D]'
                      : 'bg-[#F3F4F6] text-[#6B7280]'
                  }`}
                >
                  {i + 1}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-[#111827] text-sm">
                    {dt.tipo.etiqueta || `Tipo ${i + 1}`}
                  </span>
                  <span className="text-xs bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full">
                    {CARROCERIA_LABEL_ES[dt.tipo.carroceria] ?? dt.tipo.carroceria} · {dt.tipo.cantidad} uds
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mb-3 leading-relaxed">{dt.razonRanking}</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-0.5">Payback</p>
                    <p className="text-sm font-bold text-[#111827]">{formatAnios(dt.paybackAjustado)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-0.5">Ahorro / veh.</p>
                    <p className="text-sm font-bold text-[#16A34A]">{formatCLP(dt.ahorroMensualPorVehiculo)} /mes</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-0.5">Ahorro total tipo</p>
                    <p className="text-sm font-bold text-[#16A34A]">{formatCLP(dt.ahorroMensualTotal)} /mes</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wide mb-0.5">CO₂ evitado</p>
                    <p className="text-sm font-bold text-[#374151]">
                      {dt.co2EvitadoTotal >= 1000
                        ? `${(dt.co2EvitadoTotal / 1000).toFixed(1)} ton/año`
                        : `${Math.round(dt.co2EvitadoTotal)} kg/año`}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modelos recomendados por segmento */}
      <div>
        <h3 className="text-base font-bold text-[#0F3D2E] mb-3">
          Modelos disponibles por segmento
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {carroceriasUnicas.map((carroceria) => {
            const modeloIds = SEGMENTOS[carroceria] ?? [];
            const modelos = modeloIds
              .map((id) => MODELOS.find((m) => m.id === id))
              .filter((m): m is ModeloEV => m !== undefined);

            return (
              <Card key={carroceria} padding="md">
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
                  {CARROCERIA_LABEL_ES[carroceria] ?? carroceria}
                </p>
                {modelos.length === 0 ? (
                  <div className="flex items-start gap-2 bg-[#FEF9C3] border border-[#FDE68A] rounded-xl px-3 py-2.5">
                    <AlertTriangle className="w-4 h-4 text-[#92400E] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#92400E]">
                      Sin oferta disponible en el catálogo — consulta directamente a un proveedor.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {modelos.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 py-2 border-b border-[#F3F4F6] last:border-0">
                        <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] flex items-center justify-center shrink-0">
                          <Car className="w-4 h-4 text-[#9CA3AF]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#111827]">{m.marca} {m.modelo}</p>
                          <p className="text-xs text-[#6B7280]">
                            {m.autonomiaKm} km · {m.consumoKmKwh} km/kWh
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Paso 4: Selección de recambio + ofertas ───────────────────────────────────

function Paso4({
  flota,
  seleccion,
  onSeleccionChange,
}: {
  flota: TipoVehiculo[];
  seleccion: SeleccionTipo[];
  onSeleccionChange: (s: SeleccionTipo[]) => void;
}) {
  const getSelTipo = (tipoId: string): SeleccionTipo =>
    seleccion.find((s) => s.tipoId === tipoId) ?? {
      tipoId,
      cantidadRecambio: flota.find((t) => t.id === tipoId)?.cantidad ?? 0,
      ofertas: [],
    };

  const updateSelTipo = (tipoId: string, partial: Partial<SeleccionTipo>) => {
    const prev = getSelTipo(tipoId);
    const updated = { ...prev, ...partial };
    const others = seleccion.filter((s) => s.tipoId !== tipoId);
    onSeleccionChange([...others, updated]);
  };

  const toggleOferta = (tipoId: string, ofertaId: string) => {
    const sel = getSelTipo(tipoId);
    const yaEsta = sel.ofertas.some((o) => o.ofertaId === ofertaId);
    const nuevasOfertas = yaEsta
      ? sel.ofertas.filter((o) => o.ofertaId !== ofertaId)
      : [...sel.ofertas, { ofertaId, unidades: 1 }];
    updateSelTipo(tipoId, { ofertas: nuevasOfertas });
  };

  const setUnidades = (tipoId: string, ofertaId: string, unidades: number) => {
    const sel = getSelTipo(tipoId);
    const nuevasOfertas = sel.ofertas.map((o) =>
      o.ofertaId === ofertaId ? { ...o, unidades: Math.max(1, unidades) } : o,
    );
    updateSelTipo(tipoId, { ofertas: nuevasOfertas });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold text-[#0F3D2E] mb-1">
          Selección de recambio
        </h2>
        <p className="text-sm text-[#6B7280]">
          Define cuántos vehículos de cada tipo electrificarás y qué modelos te interesan.
        </p>
      </div>

      {flota.map((tipo) => {
        const sel = getSelTipo(tipo.id);
        const modeloIds = SEGMENTOS[tipo.carroceria] ?? [];
        const ofertasDelTipo = OFERTAS.filter((o) => modeloIds.includes(o.modeloId));
        const unidadesAsignadas = sel.ofertas.reduce((s, o) => s + o.unidades, 0);
        const excedido = unidadesAsignadas > sel.cantidadRecambio;

        return (
          <div key={tipo.id} className="flex flex-col gap-4">
            {/* 4a: Cuántos recambiar */}
            <Card padding="md">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-[#0F3D2E] text-white flex items-center justify-center text-xs font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111827]">
                    {tipo.etiqueta || `Tipo: ${CARROCERIA_LABEL_ES[tipo.carroceria]}`}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    {tipo.cantidad} vehículos caracterizados · {CARROCERIA_LABEL_ES[tipo.carroceria]}
                  </p>
                </div>
              </div>

              <div>
                <FieldLabel hint={`Máximo ${tipo.cantidad} vehículos`}>
                  Vehículos a recambiar de este tipo
                </FieldLabel>
                <NumberInput
                  value={sel.cantidadRecambio}
                  onChange={(v) => updateSelTipo(tipo.id, {
                    cantidadRecambio: Math.min(tipo.cantidad, Math.max(0, v)),
                    ofertas: [], // reset ofertas si cambia cantidad
                  })}
                  min={0}
                  max={tipo.cantidad}
                  suffix={`/ ${tipo.cantidad}`}
                />
              </div>

              {sel.cantidadRecambio === 0 && (
                <p className="mt-2 text-xs text-[#9CA3AF] bg-[#F9FAFB] rounded-xl px-3 py-2">
                  Este tipo no entrará al plan de recambio.
                </p>
              )}
            </Card>

            {/* 4b: Ofertas (solo si cantidadRecambio > 0) */}
            {sel.cantidadRecambio > 0 && (
              <div className="pl-4 border-l-2 border-[#DCFCE7]">
                <p className="text-sm font-semibold text-[#374151] mb-3">
                  Ofertas disponibles para {CARROCERIA_LABEL_ES[tipo.carroceria]}
                </p>

                {/* Indicador de asignación */}
                <div
                  className={`mb-3 flex items-center gap-2 text-xs px-3 py-2 rounded-xl border ${
                    excedido
                      ? 'bg-red-50 border-red-200 text-red-600'
                      : unidadesAsignadas === sel.cantidadRecambio
                      ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]'
                      : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#6B7280]'
                  }`}
                >
                  {excedido ? (
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  )}
                  {unidadesAsignadas} de {sel.cantidadRecambio} vehículos asignados
                  {excedido && ' — reducir unidades'}
                </div>

                {ofertasDelTipo.length === 0 ? (
                  <div className="flex items-start gap-2 bg-[#FEF9C3] border border-[#FDE68A] rounded-xl px-3 py-2.5">
                    <AlertTriangle className="w-4 h-4 text-[#92400E] shrink-0 mt-0.5" />
                    <p className="text-xs text-[#92400E]">
                      Sin oferta disponible para este segmento. Consulta directamente a un proveedor.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ofertasDelTipo.map((oferta) => {
                      const modelo = MODELOS.find((m) => m.id === oferta.modeloId);
                      const proveedor = PROVEEDORES.find((p) => p.id === oferta.proveedorId);
                      const selItem = sel.ofertas.find((o) => o.ofertaId === oferta.id);
                      const marcada = !!selItem;

                      return (
                        <div
                          key={oferta.id}
                          className={`rounded-2xl border p-4 transition-all duration-150 cursor-pointer ${
                            marcada
                              ? 'border-[#16A34A] bg-[#F0FDF4]'
                              : 'border-[#E5E7EB] bg-white hover:border-[#16A34A] hover:bg-[#F9FAFB]'
                          }`}
                          onClick={() => toggleOferta(tipo.id, oferta.id)}
                        >
                          {/* Logo placeholder */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-9 h-9 rounded-xl bg-[#F3F4F6] flex items-center justify-center shrink-0">
                              <Car className="w-4 h-4 text-[#9CA3AF]" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#111827]">
                                {modelo?.marca} {modelo?.modelo}
                              </p>
                              <p className="text-xs text-[#9CA3AF]">{proveedor?.nombre}</p>
                            </div>
                            {marcada && (
                              <CheckCircle2 className="w-4 h-4 text-[#16A34A] ml-auto shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center justify-between text-xs text-[#6B7280]">
                            <span>{modelo?.autonomiaKm} km · {modelo?.consumoKmKwh} km/kWh</span>
                            <span className="font-bold text-[#111827]">
                              {formatCLPMillon(oferta.precio)}
                            </span>
                          </div>

                          {/* Input unidades (solo si marcada) */}
                          {marcada && (
                            <div
                              className="mt-3 pt-3 border-t border-[#E5E7EB]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FieldLabel>Unidades de esta oferta</FieldLabel>
                              <NumberInput
                                value={selItem!.unidades}
                                onChange={(v) => setUnidades(tipo.id, oferta.id, v)}
                                min={1}
                                max={sel.cantidadRecambio}
                                suffix="uds"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Paso 5: Evaluación del sitio ──────────────────────────────────────────────

function Paso5({
  sitio,
  onSitioChange,
}: {
  sitio: DatosSitio;
  onSitioChange: (s: DatosSitio) => void;
}) {
  const set = (partial: Partial<DatosSitio>) => onSitioChange({ ...sitio, ...partial });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F3D2E] mb-1">Evaluación del sitio</h2>
        <p className="text-sm text-[#6B7280]">
          Información del lugar donde se instalarán los cargadores. Usada para dimensionar
          la infraestructura y estimar el costo de instalación.
        </p>
      </div>

      <Card padding="lg" className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <FieldLabel hint="Cantidad de puestos disponibles para instalar cargadores">
              Estacionamientos para carga
            </FieldLabel>
            <NumberInput
              value={sitio.estacionamientos}
              onChange={(v) => set({ estacionamientos: Math.max(1, v) })}
              min={1}
              suffix="puestos"
            />
          </div>

          <div>
            <FieldLabel hint="Capacidad eléctrica actual del empalme del sitio">
              Potencia conectada del sitio
            </FieldLabel>
            <NumberInput
              value={sitio.potenciaConectada}
              onChange={(v) => set({ potenciaConectada: Math.max(1, v) })}
              min={1}
              suffix="kW"
            />
          </div>

          <div>
            <FieldLabel hint="Distancia desde el medidor a la calle (o acometida eléctrica)">
              Distancia acometida
            </FieldLabel>
            <NumberInput
              value={sitio.distAcometida}
              onChange={(v) => set({ distAcometida: Math.max(1, v) })}
              min={1}
              suffix="m"
            />
          </div>

          <div>
            <FieldLabel hint="Distancia desde el medidor hasta el área de estacionamiento">
              Distancia interna medidor → estacionamiento
            </FieldLabel>
            <NumberInput
              value={sitio.distInterna}
              onChange={(v) => set({ distInterna: Math.max(1, v) })}
              min={1}
              suffix="m"
            />
          </div>
        </div>

        <div>
          <FieldLabel>Tipo de canalización eléctrica</FieldLabel>
          <ToggleGroup<'sobrepuesta' | 'soterrada'>
            value={sitio.canalizacion}
            onChange={(v) => set({ canalizacion: v })}
            options={[
              { value: 'sobrepuesta', label: 'Sobrepuesta', desc: 'Canaleta o ducto visible' },
              { value: 'soterrada', label: 'Soterrada', desc: 'Zanja o ducto enterrado (+$500K)' },
            ]}
          />
        </div>

        <div>
          <FieldLabel>Tipo de empalme eléctrico</FieldLabel>
          <ToggleGroup<'ampliacion' | 'dedicado'>
            value={sitio.empalme}
            onChange={(v) => set({ empalme: v })}
            options={[
              { value: 'ampliacion', label: 'Ampliación del empalme existente', desc: 'Más económico' },
              { value: 'dedicado', label: 'Empalme dedicado', desc: 'Mayor inversión (+$250K)' },
            ]}
          />
        </div>
      </Card>

      {/* Toggle carga rápida */}
      <div>
        <button
          type="button"
          onClick={() => set({ quiereCargaRapida: !sitio.quiereCargaRapida })}
          className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-150 cursor-pointer text-left ${
            sitio.quiereCargaRapida
              ? 'border-[#16A34A] bg-[#F0FDF4]'
              : 'border-[#E5E7EB] bg-white hover:border-[#16A34A]'
          }`}
        >
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              sitio.quiereCargaRapida ? 'bg-[#16A34A] text-white' : 'bg-[#F3F4F6] text-[#9CA3AF]'
            }`}
          >
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <p className={`text-sm font-semibold ${sitio.quiereCargaRapida ? 'text-[#15803D]' : 'text-[#374151]'}`}>
              Quiero evaluar infraestructura de carga rápida (más de 50 kW)
            </p>
            <p className="text-xs text-[#9CA3AF]">
              Recomendado solo para flotas con kilometraje diario muy alto (&gt;200 km/día)
            </p>
          </div>
          {sitio.quiereCargaRapida && (
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] ml-auto shrink-0" />
          )}
        </button>

        {sitio.quiereCargaRapida && (
          <div className="mt-3 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              El costo de una instalación de carga rápida supera más de 10 veces el de una
              instalación AC residencial. Solo recomendado para flotas con kilometraje diario
              muy alto (&gt;200 km/día por vehículo).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Paso 6: Plan de infraestructura ──────────────────────────────────────────

function Paso6({
  plan,
  flota,
  seleccion,
  onVolverAlSitio,
}: {
  plan: PlanInfraestructura;
  flota: TipoVehiculo[];
  seleccion: SeleccionTipo[];
  onVolverAlSitio: () => void;
}) {
  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="text-xl font-bold text-[#0F3D2E] mb-1">Plan de infraestructura recomendado</h2>
        <p className="text-sm text-[#6B7280]">
          Basado en las ventanas de operación de tu flota y las características del sitio.
        </p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Cargadores AC"
          value={`${plan.cargadoresACTotales}`}
          sublabel={`${plan.cargadoresACTotales} × 7,4 kW`}
          icon={<Zap className="w-4 h-4" />}
          accent
        />
        {plan.cargadoresDCTotales > 0 ? (
          <StatCard
            label="Cargadores DC"
            value={`${plan.cargadoresDCTotales}`}
            sublabel={`${plan.cargadoresDCTotales} × 50 kW`}
            icon={<Zap className="w-4 h-4" />}
          />
        ) : (
          <StatCard
            label="Cargadores DC"
            value="—"
            sublabel="No requerido"
          />
        )}
        <StatCard
          label="Costo estimado del plan"
          value={formatCLPMillon(plan.costoTotal)}
          sublabel="Referencial, incluye instalación"
          icon={<BarChart2 className="w-4 h-4" />}
        />
      </div>

      {/* Detalle por tipo */}
      <div>
        <h3 className="text-base font-bold text-[#0F3D2E] mb-3">Detalle por tipo</h3>
        <div className="flex flex-col gap-3">
          {plan.distribucionPorTipo.map((planTipo) => {
            const sel = seleccion.find((s) => s.tipoId === planTipo.tipoId);
            const tipo = flota.find((t) => t.id === planTipo.tipoId);
            if (!tipo || !sel) return null;

            return (
              <Card key={planTipo.tipoId} padding="md">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">
                      {tipo.etiqueta || `Tipo: ${CARROCERIA_LABEL_ES[tipo.carroceria]}`}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">
                      {sel.cantidadRecambio} vehículos a electrificar
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs bg-[#DCFCE7] text-[#15803D] px-2 py-1 rounded-full font-medium">
                      {planTipo.cargadoresAC} AC
                    </span>
                    {planTipo.usaDC && (
                      <span className="text-xs bg-[#DBEAFE] text-[#1D4ED8] px-2 py-1 rounded-full font-medium">
                        + DC
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed">{planTipo.explicacion}</p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sección DC */}
      {plan.cargadoresDCTotales > 0 && (
        <Card padding="md" className="border-[#DBEAFE] bg-[#EFF6FF]">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#DBEAFE] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-[#1D4ED8]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1D4ED8] mb-1">
                Carga rápida: {plan.cargadoresDCTotales} cargador{plan.cargadoresDCTotales > 1 ? 'es' : ''} DC (50 kW)
              </p>
              <p className="text-xs text-[#374151] leading-relaxed mb-2">
                Costo estimado: {formatCLPMillon(plan.costoDC)}
              </p>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                ⚠ El costo de instalación DC supera más de 10 veces el de una instalación AC
                residencial estándar (~$1,9M). Incluye equipo, obra civil y conexión eléctrica.
                Estos valores son referenciales y sujetos a cotización especializada.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Mensaje sin necesidad DC */}
      {plan.mensajeDCSinNecesidad && (
        <Card padding="md" className="border-[#BBF7D0] bg-[#F0FDF4]">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
            <p className="text-sm text-[#15803D]">
              Tu operación seleccionada no requiere carga rápida; la instalación AC alcanza
              para cubrir tu demanda diaria con las ventanas de carga disponibles.
            </p>
          </div>
        </Card>
      )}

      {/* Advertencia sin DC pero con tipos intensivos */}
      {plan.advertenciaSinDCPeroIntensivo && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Algunos tipos superan 200 km/día. Considera evaluar carga rápida —{' '}
            <button
              type="button"
              onClick={onVolverAlSitio}
              className="underline font-medium cursor-pointer"
            >
              puedes volver al Paso 5 para activarla
            </button>
            .
          </p>
        </div>
      )}

      {/* Desglose de costos */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-[#374151] mb-3">Desglose del costo estimado</h3>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[#6B7280]">Instalación AC (sitio + {plan.cargadoresACTotales} cargador{plan.cargadoresACTotales > 1 ? 'es' : ''})</span>
            <span className="font-semibold text-[#111827]">{formatCLPMillon(plan.costoAC)}</span>
          </div>
          {plan.cargadoresDCTotales > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">Instalación DC ({plan.cargadoresDCTotales} cargador{plan.cargadoresDCTotales > 1 ? 'es' : ''})</span>
              <span className="font-semibold text-[#111827]">{formatCLPMillon(plan.costoDC)}</span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-2 mt-1">
            <span className="font-semibold text-[#374151]">Total estimado</span>
            <span className="font-bold text-[#0F3D2E] text-base">{formatCLPMillon(plan.costoTotal)}</span>
          </div>
          <p className="text-[10px] text-[#9CA3AF] mt-1">
            * Estimación referencial. No constituye cotización. Sujeta a inspección técnica en sitio.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ── Helpers pasos 7-9 ─────────────────────────────────────────────────────────

/**
 * Codifica cualquier objeto en Base64URL para el QR.
 * Usa encodeURIComponent antes de btoa para soportar caracteres fuera de Latin-1.
 */
function encodePayloadPyme(data: unknown): string {
  return btoa(encodeURIComponent(JSON.stringify(data)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateFolioPyme(prefix = 'PYM'): string {
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${fecha}-${rand}`;
}

function calcularResumenProyecto(
  seleccion: SeleccionTipo[],
  flota: TipoVehiculo[],
  analisisFlota: DiagnosticoFlota,
  plan: PlanInfraestructura,
) {
  const tiposActivos = seleccion.filter((s) => s.cantidadRecambio > 0);
  let totalVehiculos = 0;
  let costoVehiculos = 0;
  let reventaTotal = 0;
  let ahorroMensual = 0;
  let co2EvitadoAnual = 0;

  for (const sel of tiposActivos) {
    const diagTipo = analisisFlota.tipos.find((dt) => dt.tipo.id === sel.tipoId);
    if (!diagTipo) continue;
    totalVehiculos += sel.cantidadRecambio;
    reventaTotal += diagTipo.reventaPorVehiculo * sel.cantidadRecambio;
    ahorroMensual += diagTipo.ahorroMensualPorVehiculo * sel.cantidadRecambio;
    co2EvitadoAnual += diagTipo.co2EvitadoPorVehiculo * sel.cantidadRecambio;
    costoVehiculos += sel.ofertas.reduce((sum, o) => {
      const of = OFERTAS.find((x) => x.id === o.ofertaId);
      return sum + (of ? of.precio * o.unidades : 0);
    }, 0);
  }

  const costoInstalacion = plan.costoTotal;
  const inversionNetaTotal = costoVehiculos - reventaTotal + costoInstalacion;

  // Series TCO solo del subconjunto elegido
  const flotaElegida: TipoVehiculo[] = tiposActivos
    .map((sel) => {
      const tipo = flota.find((t) => t.id === sel.tipoId);
      return tipo ? { ...tipo, cantidad: sel.cantidadRecambio } : null;
    })
    .filter((t): t is TipoVehiculo => t !== null);

  const { serieCombustion, serieElectrico } = generarSeriesFlota(flotaElegida, inversionNetaTotal);

  return {
    totalVehiculos,
    costoVehiculos,
    reventaTotal,
    costoInstalacion,
    inversionNetaTotal,
    ahorroMensual,
    ahorro5Anios: ahorroMensual * 60,
    co2EvitadoAnual,
    co2Evitado5Anios: co2EvitadoAnual * 5,
    serieCombustion,
    serieElectrico,
  };
}

function generarInformePDF(
  empresa: PymeState['empresa'],
  contacto: PymeState['contacto'],
  resumen: ReturnType<typeof calcularResumenProyecto>,
  analisisFlota: DiagnosticoFlota,
  seleccion: SeleccionTipo[],
  flota: TipoVehiculo[],
  plan: PlanInfraestructura,
  folio: string,
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;
  const fecha = new Date().toLocaleDateString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  // ── Portada ────────────────────────────────────────────────────────────────
  doc.setFillColor(15, 61, 46);
  doc.rect(0, 0, W, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('evmarket', 16, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Informe de Diagnóstico de Electromovilidad — Pyme', 16, 28);
  doc.setFontSize(8.5);
  doc.text(`Folio: ${folio}`, W - 16, 14, { align: 'right' });
  doc.text(`Fecha: ${fecha}`, W - 16, 22, { align: 'right' });

  let y = 52;

  // ── Datos empresa ─────────────────────────────────────────────────────────
  doc.setTextColor(15, 61, 46);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(empresa.nombre || 'Empresa sin nombre', 16, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 80);
  doc.text(`Rubro: ${empresa.rubro}  ·  Tamaño: ${empresa.tamano} vehículos`, 16, y);
  y += 5;
  if (contacto.nombre) {
    doc.text(
      `Contacto: ${contacto.nombre}${contacto.correo ? '  ·  ' + contacto.correo : ''}`,
      16, y,
    );
    y += 5;
  }
  y += 4;
  doc.setDrawColor(220, 220, 220);
  doc.line(16, y, W - 16, y);
  y += 8;

  // ── Sección 1: Resumen ejecutivo ──────────────────────────────────────────
  const addSectionTitle = (title: string) => {
    if (y > 255) { doc.addPage(); y = 20; }
    doc.setTextColor(15, 61, 46);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 16, y);
    y += 7;
  };

  addSectionTitle('1. Resumen ejecutivo del proyecto');

  const statRows = [
    ['Vehículos a electrificar', `${resumen.totalVehiculos}`],
    ['Costo de vehículos elegidos', formatCLPMillon(resumen.costoVehiculos)],
    ['Costo estimado de instalación', formatCLPMillon(resumen.costoInstalacion)],
    ['Inversión neta total (descontando reventa)', formatCLPMillon(resumen.inversionNetaTotal)],
    ['Ahorro mensual estimado del proyecto', formatCLP(resumen.ahorroMensual)],
    ['Ahorro a 5 años', formatCLPMillon(resumen.ahorro5Anios)],
    ['CO₂ evitado anual', `${(resumen.co2EvitadoAnual / 1000).toFixed(1)} ton/año`],
  ];

  doc.setFontSize(9);
  statRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(label, 18, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 61, 46);
    doc.text(value, W - 18, y, { align: 'right' });
    y += 6;
  });

  y += 4;
  doc.setDrawColor(220, 220, 220);
  doc.line(16, y, W - 16, y);
  y += 8;

  // ── Sección 2: Priorización ───────────────────────────────────────────────
  addSectionTitle('2. Priorización de la flota (por payback ajustado)');

  doc.setFillColor(240, 253, 244);
  doc.rect(16, y - 1, W - 32, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  doc.setFont('helvetica', 'bold');
  doc.text('Tipo', 18, y + 4);
  doc.text('Cant.', 80, y + 4);
  doc.text('Payback', 100, y + 4);
  doc.text('Ahorro/mes', 130, y + 4);
  doc.text('CO₂/año', W - 20, y + 4, { align: 'right' });
  y += 8;

  doc.setFont('helvetica', 'normal');
  analisisFlota.tipos.forEach((dt) => {
    if (y > 265) { doc.addPage(); y = 20; }
    const etiqueta = (dt.tipo.etiqueta || CARROCERIA_LABEL_ES[dt.tipo.carroceria] || dt.tipo.carroceria).substring(0, 28);
    doc.setTextColor(30, 30, 30);
    doc.text(etiqueta, 18, y);
    doc.text(dt.tipo.cantidad.toString(), 80, y);
    doc.text(`${dt.paybackAjustado.toFixed(1)} años`, 100, y);
    doc.text(formatCLP(dt.ahorroMensualPorVehiculo), 130, y);
    doc.text(`${(dt.co2EvitadoPorVehiculo / 1000).toFixed(1)} ton`, W - 20, y, { align: 'right' });
    y += 6;
    doc.setDrawColor(235, 235, 235);
    doc.line(16, y - 1, W - 16, y - 1);
  });

  y += 6;
  doc.setDrawColor(220, 220, 220);
  doc.line(16, y, W - 16, y);
  y += 8;

  // ── Sección 3: Vehículos del proyecto ─────────────────────────────────────
  addSectionTitle('3. Vehículos seleccionados para el proyecto');

  const tiposActivos = seleccion.filter((s) => s.cantidadRecambio > 0);
  if (tiposActivos.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(130, 130, 130);
    doc.text('Sin vehículos seleccionados.', 18, y);
    y += 8;
  } else {
    doc.setFillColor(240, 253, 244);
    doc.rect(16, y - 1, W - 32, 7, 'F');
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'bold');
    doc.text('Tipo', 18, y + 4);
    doc.text('Recambio', 70, y + 4);
    doc.text('Modelo elegido', 100, y + 4);
    doc.text('Subtotal', W - 20, y + 4, { align: 'right' });
    y += 8;

    doc.setFont('helvetica', 'normal');
    tiposActivos.forEach((sel) => {
      if (y > 265) { doc.addPage(); y = 20; }
      const tipo = flota.find((t) => t.id === sel.tipoId);
      const etiqueta = (tipo?.etiqueta || sel.tipoId).substring(0, 22);
      doc.setTextColor(30, 30, 30);
      if (sel.ofertas.length === 0) {
        doc.text(etiqueta, 18, y);
        doc.text(sel.cantidadRecambio.toString(), 70, y);
        doc.text('—', 100, y);
        doc.text('—', W - 20, y, { align: 'right' });
        y += 6;
      } else {
        sel.ofertas.forEach((o, idx) => {
          const of = OFERTAS.find((x) => x.id === o.ofertaId);
          const modelo = of ? MODELOS.find((m) => m.id === of.modeloId) : null;
          const nombre = modelo ? `${o.unidades}× ${modelo.marca} ${modelo.modelo}` : '—';
          const subtotal = of ? formatCLPMillon(of.precio * o.unidades) : '—';
          if (idx === 0) {
            doc.text(etiqueta, 18, y);
            doc.text(sel.cantidadRecambio.toString(), 70, y);
          }
          doc.text(nombre.substring(0, 30), 100, y);
          doc.text(subtotal, W - 20, y, { align: 'right' });
          y += 5;
        });
      }
      doc.setDrawColor(235, 235, 235);
      doc.line(16, y - 1, W - 16, y - 1);
    });
  }

  y += 6;
  doc.setDrawColor(220, 220, 220);
  doc.line(16, y, W - 16, y);
  y += 8;

  // ── Sección 4: Plan de infraestructura ────────────────────────────────────
  addSectionTitle('4. Plan de infraestructura de carga');

  const infraRows: [string, string][] = [
    ['Cargadores AC totales', plan.cargadoresACTotales.toString()],
    ...(plan.cargadoresDCTotales > 0 ? [['Cargadores DC totales', plan.cargadoresDCTotales.toString()] as [string, string]] : []),
    ['Costo estimado instalación AC', formatCLPMillon(plan.costoAC)],
    ...(plan.cargadoresDCTotales > 0 ? [['Costo estimado instalación DC', formatCLPMillon(plan.costoDC)] as [string, string]] : []),
    ['Costo total de infraestructura', formatCLPMillon(plan.costoTotal)],
  ];

  doc.setFontSize(9);
  infraRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(label, 18, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 61, 46);
    doc.text(value, W - 18, y, { align: 'right' });
    y += 6;
  });

  y += 4;
  doc.setDrawColor(220, 220, 220);
  doc.line(16, y, W - 16, y);
  y += 8;

  // ── Sección 5: Conclusiones ────────────────────────────────────────────────
  addSectionTitle('5. Conclusiones');

  const texto = `Este informe presenta una estimación del potencial de electromovilidad para la flota de ${empresa.nombre || 'la empresa'}. Los cálculos utilizan precios de referencia vigentes al momento de la simulación y supuestos estándar de consumo y carga. El payback ajustado incorpora el valor de reventa del vehículo actual y un bono por antigüedad del parque vehicular. La inversión neta considera el precio del EV elegido menos la reventa estimada, más los costos de infraestructura de carga. Los valores son referenciales y no constituyen una cotización formal.`;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  const lines = doc.splitTextToSize(texto, W - 32);
  if (y + lines.length * 5 > 270) { doc.addPage(); y = 20; }
  doc.text(lines, 16, y);
  y += lines.length * 5 + 8;

  if (y > 265) { doc.addPage(); y = 20; }
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  const disclaimer = 'Informe referencial. No constituye cotización, contrato ni asesoría financiera formal. Los precios, tasas y condiciones están sujetos a variación. evmarket no garantiza resultados específicos. Consulta con un especialista antes de tomar decisiones de inversión.';
  const dLines = doc.splitTextToSize(disclaimer, W - 32);
  doc.text(dLines, 16, y);

  doc.save(`informe-electromovilidad-${(empresa.nombre || 'empresa').toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

// ── Paso 7: Dashboard consolidado ────────────────────────────────────────────

function Paso7({
  seleccion,
  flota,
  analisisFlota,
  planInfraestructura,
  empresa,
  contacto,
}: {
  seleccion: SeleccionTipo[];
  flota: TipoVehiculo[];
  analisisFlota: DiagnosticoFlota;
  planInfraestructura: PlanInfraestructura;
  empresa: PymeState['empresa'];
  contacto: PymeState['contacto'];
}) {
  const [folio] = useState(() => generateFolioPyme());

  const resumen = useMemo(
    () => calcularResumenProyecto(seleccion, flota, analisisFlota, planInfraestructura),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const tiposActivos = seleccion.filter((s) => s.cantidadRecambio > 0);

  return (
    <div className="flex flex-col gap-7">
      <div>
        <h2 className="text-xl font-bold text-[#0F3D2E] mb-1">Dashboard del proyecto</h2>
        <p className="text-sm text-[#6B7280]">
          Resumen del proyecto de electrificación que elegiste configurar.
        </p>
      </div>

      {/* StatCards resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          label="Vehículos a electrificar"
          value={resumen.totalVehiculos.toString()}
          accent
        />
        <StatCard
          label="Costo total del proyecto"
          value={formatCLPMillon(resumen.costoVehiculos + resumen.costoInstalacion)}
        />
        <StatCard
          label="Ahorro mensual estimado"
          value={formatCLP(resumen.ahorroMensual)}
        />
        <StatCard
          label="Ahorro a 5 años"
          value={formatCLPMillon(resumen.ahorro5Anios)}
        />
        <StatCard
          label="CO₂ evitado anual"
          value={`${(resumen.co2EvitadoAnual / 1000).toFixed(1)} ton`}
        />
        <StatCard
          label="CO₂ evitado a 5 años"
          value={`${(resumen.co2Evitado5Anios / 1000).toFixed(1)} ton`}
        />
      </div>

      {/* Gráfico TCO del proyecto */}
      <Card padding="lg">
        <h3 className="text-sm font-semibold text-[#374151] mb-4">Evolución TCO del proyecto elegido</h3>
        <TCOChart
          serieCombustion={resumen.serieCombustion}
          serieElectrico={resumen.serieElectrico}
          inversionTotal={resumen.inversionNetaTotal}
        />
        <p className="text-[10px] text-[#9CA3AF] mt-3">
          Inversión neta = costo vehículos − reventa estimada + costo instalación. La curva eléctrica
          parte en la inversión neta y se amortiza con el ahorro operacional mensual acumulado.
        </p>
      </Card>

      {/* Tabla de detalle por tipo */}
      <Card padding="lg">
        <h3 className="text-sm font-semibold text-[#374151] mb-4">Detalle por tipo de vehículo</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-[#374151] bg-[#F9FAFB] px-3 py-2 rounded-l-lg">
                  Tipo
                </th>
                <th className="text-center text-xs font-semibold text-[#374151] bg-[#F9FAFB] px-3 py-2">
                  Recambio
                </th>
                <th className="text-left text-xs font-semibold text-[#374151] bg-[#F9FAFB] px-3 py-2">
                  Oferta elegida
                </th>
                <th className="text-center text-xs font-semibold text-[#374151] bg-[#F9FAFB] px-3 py-2">
                  Carg. AC
                </th>
                <th className="text-right text-xs font-semibold text-[#374151] bg-[#F9FAFB] px-3 py-2 rounded-r-lg">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {tiposActivos.map((sel) => {
                const tipo = flota.find((t) => t.id === sel.tipoId);
                const planTipo = planInfraestructura.distribucionPorTipo.find(
                  (p) => p.tipoId === sel.tipoId,
                );
                const costoLinea = sel.ofertas.reduce((sum, o) => {
                  const of = OFERTAS.find((x) => x.id === o.ofertaId);
                  return sum + (of ? of.precio * o.unidades : 0);
                }, 0);
                const ofertasDesc = sel.ofertas
                  .map((o) => {
                    const of = OFERTAS.find((x) => x.id === o.ofertaId);
                    const m = of ? MODELOS.find((mod) => mod.id === of.modeloId) : null;
                    return m ? `${o.unidades}× ${m.marca} ${m.modelo}` : null;
                  })
                  .filter(Boolean)
                  .join(', ');

                return (
                  <tr key={sel.tipoId}>
                    <td className="px-3 py-2.5 font-medium text-[#111827]">
                      {tipo?.etiqueta ||
                        CARROCERIA_LABEL_ES[tipo?.carroceria || ''] ||
                        sel.tipoId}
                    </td>
                    <td className="px-3 py-2.5 text-center text-[#374151]">
                      {sel.cantidadRecambio}
                    </td>
                    <td className="px-3 py-2.5 text-[#374151] text-xs">
                      {ofertasDesc || (
                        <span className="text-[#9CA3AF] italic">Sin oferta asignada</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center text-[#374151]">
                      {planTipo?.cargadoresAC ?? '—'}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-[#0F3D2E]">
                      {costoLinea > 0 ? formatCLPMillon(costoLinea) : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#E5E7EB]">
                <td
                  colSpan={4}
                  className="px-3 py-2.5 text-right font-semibold text-[#374151] text-xs"
                >
                  Total vehículos + instalación:
                </td>
                <td className="px-3 py-2.5 text-right font-bold text-[#0F3D2E]">
                  {formatCLPMillon(resumen.costoVehiculos + resumen.costoInstalacion)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Botón descargar PDF */}
      <button
        type="button"
        onClick={() =>
          generarInformePDF(
            empresa, contacto, resumen, analisisFlota,
            seleccion, flota, planInfraestructura, folio,
          )
        }
        className="flex items-center justify-center gap-2.5 w-full bg-[#0F3D2E] hover:bg-[#16A34A] text-white font-semibold py-4 rounded-2xl transition-colors shadow-sm text-sm cursor-pointer"
      >
        <Download className="w-4 h-4" />
        Descargar informe completo (PDF)
      </button>
    </div>
  );
}

// ── Paso 8: Contacto con bancos ───────────────────────────────────────────────

function Paso8({
  empresa,
  contacto,
  seleccion,
  flota,
  planInfraestructura,
}: {
  empresa: PymeState['empresa'];
  contacto: PymeState['contacto'];
  seleccion: SeleccionTipo[];
  flota: TipoVehiculo[];
  planInfraestructura: PlanInfraestructura;
}) {
  const [folios] = useState<Record<string, string>>(() => {
    const f: Record<string, string> = {};
    BANCOS.forEach((b) => { f[b.id] = generateFolioPyme(); });
    return f;
  });

  const fecha = new Date().toLocaleDateString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  // Construir lineas del proyecto para el payload
  const lineasProyecto: { descripcion: string; cantidad: number; monto?: number }[] = [];
  let montoProyecto = 0;
  let totalVehiculos = 0;

  seleccion
    .filter((s) => s.cantidadRecambio > 0)
    .forEach((sel) => {
      const tipo = flota.find((t) => t.id === sel.tipoId);
      totalVehiculos += sel.cantidadRecambio;
      sel.ofertas.forEach((o) => {
        const of = OFERTAS.find((x) => x.id === o.ofertaId);
        const modelo = of ? MODELOS.find((m) => m.id === of.modeloId) : null;
        if (of && modelo) {
          const monto = of.precio * o.unidades;
          montoProyecto += monto;
          lineasProyecto.push({
            descripcion: `${o.unidades}× ${modelo.marca} ${modelo.modelo}${tipo ? ` (${tipo.etiqueta || tipo.carroceria})` : ''}`,
            cantidad: o.unidades,
            monto,
          });
        }
      });
    });

  montoProyecto += planInfraestructura.costoTotal;
  if (planInfraestructura.costoTotal > 0) {
    lineasProyecto.push({
      descripcion: `Infraestructura de carga (${planInfraestructura.cargadoresACTotales} carg. AC${planInfraestructura.cargadoresDCTotales > 0 ? ` + ${planInfraestructura.cargadoresDCTotales} DC` : ''})`,
      cantidad: 1,
      monto: planInfraestructura.costoTotal,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F3D2E] mb-1">Financiamiento con bancos</h2>
        <p className="text-sm text-[#6B7280]">
          Escanea el QR de cada banco para generar un comprobante de interés. El banco recibirá los
          datos de tu proyecto para cotizarte condiciones de financiamiento verde.
        </p>
        <p className="text-[10px] text-[#9CA3AF] mt-1 italic">
          Los QR funcionan desde la versión publicada en Vercel.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BANCOS.map((banco) => {
          const folio = folios[banco.id];
          const payload = {
            folio,
            fecha,
            empresa: empresa.nombre,
            contactoNombre: contacto.nombre,
            contactoEmail: contacto.correo,
            tipo: 'banco' as const,
            entidad: { nombre: banco.nombre, linea: banco.linea, casilla: banco.casilla },
            montoProyecto,
            totalVehiculos,
            lineas: lineasProyecto,
          };
          // Este QR apunta a la URL pública de la app. Para demostrarlo, escanear desde la versión en Vercel, no desde localhost.
          const qrUrl = `${window.location.origin}/comprobante?d=${encodePayloadPyme(payload)}`;

          return (
            <Card
              key={banco.id}
              padding="lg"
              className="hover:shadow-md transition-shadow flex flex-col gap-4"
            >
              {/* Logo + nombre */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F3D2E] flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">
                    {banco.nombre.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111827]">{banco.nombre}</p>
                  <p className="text-xs text-[#6B7280]">{banco.linea}</p>
                </div>
              </div>

              {/* Detalles */}
              <div className="flex flex-col gap-1.5 text-xs text-[#374151]">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Tasa mensual ref.</span>
                  <span className="font-semibold">{(banco.tasaMensual * 100).toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B7280]">Plazo máximo</span>
                  <span className="font-semibold">{banco.plazoMaxMeses} meses</span>
                </div>
              </div>

              {/* QR centrado */}
              <div className="bg-[#F0FDF4] rounded-2xl p-3 flex flex-col items-center gap-2">
                <QRCodeSVG value={qrUrl} size={112} />
                <p className="text-[10px] text-[#6B7280] text-center leading-tight">
                  Escanea para generar comprobante de interés
                </p>
              </div>

              <p className="text-[10px] text-[#9CA3AF] font-mono text-center">Folio: {folio}</p>

              {/* Disclaimer obligatorio */}
              <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 leading-relaxed">
                Tasa referencial, sujeta a evaluación del banco y variable según campaña vigente.
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Paso 9: Contacto con proveedores ─────────────────────────────────────────

function Paso9({
  empresa,
  contacto,
  seleccion,
}: {
  empresa: PymeState['empresa'];
  contacto: PymeState['contacto'];
  seleccion: SeleccionTipo[];
}) {
  const [folios] = useState<Record<string, string>>(() => {
    const f: Record<string, string> = {};
    PROVEEDORES.forEach((p) => { f[p.id] = generateFolioPyme(); });
    return f;
  });

  const fecha = new Date().toLocaleDateString('es-CL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  // Agrupar ofertas elegidas por proveedor
  const porProveedor: Record<
    string,
    { ofertaId: string; unidades: number; modeloId: string; precio: number }[]
  > = {};

  seleccion
    .filter((s) => s.cantidadRecambio > 0)
    .forEach((sel) => {
      sel.ofertas.forEach((o) => {
        if (o.unidades === 0) return;
        const of = OFERTAS.find((x) => x.id === o.ofertaId);
        if (!of) return;
        if (!porProveedor[of.proveedorId]) porProveedor[of.proveedorId] = [];
        porProveedor[of.proveedorId].push({
          ofertaId: o.ofertaId,
          unidades: o.unidades,
          modeloId: of.modeloId,
          precio: of.precio,
        });
      });
    });

  const proveedoresActivos = PROVEEDORES.filter((p) => (porProveedor[p.id]?.length ?? 0) > 0);

  if (proveedoresActivos.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-bold text-[#0F3D2E] mb-1">Contacto con proveedores</h2>
          <p className="text-sm text-[#6B7280]">
            No hay ofertas asignadas en tu selección. Vuelve al{' '}
            <button
              type="button"
              className="text-[#16A34A] underline cursor-pointer"
              onClick={() => history.go(-5)}
            >
              Paso 4
            </button>{' '}
            para asignar modelos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F3D2E] mb-1">Contacto con proveedores</h2>
        <p className="text-sm text-[#6B7280]">
          Escanea el QR de cada proveedor para generar un comprobante de las unidades de interés.
          El proveedor recibirá los detalles para cotizarte formalmente.
        </p>
        <p className="text-[10px] text-[#9CA3AF] mt-1 italic">
          Los QR funcionan desde la versión publicada en Vercel.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {proveedoresActivos.map((proveedor) => {
          const lineas = porProveedor[proveedor.id];
          const folio = folios[proveedor.id];
          const montoTotal = lineas.reduce((sum, l) => sum + l.precio * l.unidades, 0);

          const productos = lineas.map((l) => {
            const modelo = MODELOS.find((m) => m.id === l.modeloId);
            return {
              descripcion: modelo ? `${modelo.marca} ${modelo.modelo}` : l.modeloId,
              cantidad: l.unidades,
              monto: l.precio,
            };
          });

          const payload = {
            folio,
            fecha,
            empresa: empresa.nombre,
            contactoNombre: contacto.nombre,
            contactoEmail: contacto.correo,
            tipo: 'proveedor' as const,
            entidad: { nombre: proveedor.nombre, casilla: proveedor.leadCasilla },
            montoProyecto: montoTotal,
            lineas: productos,
          };

          // Este QR apunta a la URL pública de la app. Para demostrarlo, escanear desde la versión en Vercel, no desde localhost.
          const qrUrl = `${window.location.origin}/comprobante?d=${encodePayloadPyme(payload)}`;

          return (
            <Card
              key={proveedor.id}
              padding="lg"
              className="hover:shadow-md transition-shadow flex flex-col gap-4"
            >
              {/* Header proveedor */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#16A34A] flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">
                    {proveedor.nombre.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#111827]">{proveedor.nombre}</p>
                  <div className="flex flex-col gap-0.5 mt-0.5">
                    <a
                      href={`tel:${proveedor.telefono}`}
                      className="flex items-center gap-1 text-xs text-[#374151] hover:text-[#16A34A] transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      {proveedor.telefono}
                    </a>
                    <a
                      href={`mailto:${proveedor.correo}`}
                      className="flex items-center gap-1 text-xs text-[#374151] hover:text-[#16A34A] transition-colors"
                    >
                      <Mail className="w-3 h-3" />
                      {proveedor.correo}
                    </a>
                  </div>
                </div>
              </div>

              {/* Modelos elegidos */}
              <div>
                <p className="text-xs font-semibold text-[#374151] mb-2">Modelos de interés</p>
                <div className="flex flex-col gap-1.5">
                  {lineas.map((l, i) => {
                    const modelo = MODELOS.find((m) => m.id === l.modeloId);
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-[#F9FAFB] rounded-xl px-3 py-2"
                      >
                        <Car className="w-4 h-4 text-[#9CA3AF] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#111827] truncate">
                            {l.unidades}×{' '}
                            {modelo ? `${modelo.marca} ${modelo.modelo}` : l.modeloId}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-[#0F3D2E] shrink-0">
                          {formatCLPMillon(l.precio)}
                        </p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F3F4F6]">
                  <span className="text-xs text-[#6B7280]">Subtotal</span>
                  <span className="text-sm font-bold text-[#0F3D2E]">
                    {formatCLPMillon(montoTotal)}
                  </span>
                </div>
              </div>

              {/* QR */}
              <div className="bg-[#F0FDF4] rounded-2xl p-3 flex flex-col items-center gap-2">
                <QRCodeSVG value={qrUrl} size={112} />
                <p className="text-[10px] text-[#6B7280] text-center leading-tight">
                  Escanea para ver el comprobante
                </p>
              </div>

              {/* Folio + fecha */}
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-[#9CA3AF]">
                  Folio: <span className="font-mono font-semibold">{folio}</span>
                </p>
                <p className="text-[10px] text-[#9CA3AF]">{fecha}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Inicializa la flota con un tipo vacío la primera vez que entra al paso 2
function usarFlotaConDefecto(
  flota: TipoVehiculo[],
  onFlotaChange: (f: TipoVehiculo[]) => void,
  paso: number,
) {
  useEffect(() => {
    if (paso === 2 && flota.length === 0) {
      onFlotaChange([crearTipoVacío()]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paso]);
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function PymeDiagnostico() {
  const navigate = useNavigate();
  const [state, setState] = useState<PymeState>(INITIAL_STATE);
  const [showModalPago, setShowModalPago] = useState(false);
  const [adminMode, setAdminMode] = useState(false);

  const toggleAdmin = () => {
    if (!adminMode) {
      // Al activar: pre-poblar con datos demo para poder navegar libremente
      const analisis = analizarFlota(ADMIN_DEMO_FLOTA);
      const plan = dimensionarInfraestructura(
        ADMIN_DEMO_SELECCION,
        ADMIN_DEMO_FLOTA,
        DEFAULT_SITIO,
      );
      setState({
        paso: state.paso,
        empresa: { nombre: 'Demo Transportes Ltda.', rubro: 'Transporte', tamano: '6-20' },
        contacto: { nombre: 'Admin Demo', correo: 'admin@demo.cl', telefono: '+56 9 0000 0000' },
        flota: ADMIN_DEMO_FLOTA,
        seleccion: ADMIN_DEMO_SELECCION,
        sitio: DEFAULT_SITIO,
        analisisFlota: analisis,
        planInfraestructura: plan,
      });
    }
    setAdminMode((prev) => !prev);
  };

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

  // Inicializa flota con un tipo vacío al entrar al paso 2
  usarFlotaConDefecto(
    state.flota,
    (f) => set({ flota: f }),
    state.paso,
  );

  // Calcula el análisis de flota al entrar al paso 3
  useEffect(() => {
    if (state.paso === 3 && state.flota.length > 0) {
      const analisis = analizarFlota(state.flota);
      set({ analisisFlota: analisis });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.paso]);

  // Inicializa selección con cantidad completa de cada tipo al entrar al paso 4
  useEffect(() => {
    if (state.paso === 4 && state.seleccion.length === 0 && state.flota.length > 0) {
      const selInicial: SeleccionTipo[] = state.flota.map((tipo) => ({
        tipoId: tipo.id,
        cantidadRecambio: tipo.cantidad,
        ofertas: [],
      }));
      set({ seleccion: selInicial });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.paso]);

  // Calcula el plan de infraestructura al entrar al paso 6
  useEffect(() => {
    if (state.paso === 6 && state.seleccion.length > 0 && state.flota.length > 0) {
      const plan = dimensionarInfraestructura(state.seleccion, state.flota, state.sitio);
      set({ planInfraestructura: plan });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.paso]);

  // Validación del botón "Continuar" por paso
  const puedeAvanzar = (): boolean => {
    if (adminMode) return true; // Admin: sin restricciones
    switch (state.paso) {
      case 1: return false; // Paso 1 usa el modal de pago, no el botón de navegación
      case 2: return state.flota.length >= 1;
      case 4: {
        // Al menos un tipo con recambio > 0 y sin excedido
        const tiposActivos = state.seleccion.filter((s) => s.cantidadRecambio > 0);
        if (tiposActivos.length === 0) return false;
        const hayExcedido = tiposActivos.some(
          (s) => s.ofertas.reduce((sum, o) => sum + o.unidades, 0) > s.cantidadRecambio,
        );
        return !hayExcedido;
      }
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
        return (
          <Paso2
            flota={state.flota}
            onFlotaChange={(f) => set({ flota: f })}
          />
        );
      case 3:
        return state.analisisFlota ? (
          <Paso3 analisis={state.analisisFlota} flota={state.flota} />
        ) : (
          <div className="text-center py-16 text-[#9CA3AF]">Calculando análisis…</div>
        );
      case 4:
        return (
          <Paso4
            flota={state.flota}
            seleccion={state.seleccion}
            onSeleccionChange={(s) => set({ seleccion: s })}
          />
        );
      case 5:
        return (
          <Paso5
            sitio={state.sitio}
            onSitioChange={(s) => set({ sitio: s })}
          />
        );
      case 6:
        return state.planInfraestructura ? (
          <Paso6
            plan={state.planInfraestructura}
            flota={state.flota}
            seleccion={state.seleccion}
            onVolverAlSitio={() => set({ paso: 5 })}
          />
        ) : (
          <div className="text-center py-16 text-[#9CA3AF]">Calculando plan…</div>
        );
      case 7:
        return state.analisisFlota && state.planInfraestructura ? (
          <Paso7
            seleccion={state.seleccion}
            flota={state.flota}
            analisisFlota={state.analisisFlota}
            planInfraestructura={state.planInfraestructura}
            empresa={state.empresa}
            contacto={state.contacto}
          />
        ) : (
          <div className="text-center py-16 text-[#9CA3AF]">Cargando datos del proyecto…</div>
        );
      case 8:
        return state.planInfraestructura ? (
          <Paso8
            empresa={state.empresa}
            contacto={state.contacto}
            seleccion={state.seleccion}
            flota={state.flota}
            planInfraestructura={state.planInfraestructura}
          />
        ) : (
          <div className="text-center py-16 text-[#9CA3AF]">Cargando datos del proyecto…</div>
        );
      case 9:
        return (
          <Paso9
            empresa={state.empresa}
            contacto={state.contacto}
            seleccion={state.seleccion}
          />
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="flex-1 py-10">
        <Container narrow>
          {/* Breadcrumb + badge pyme */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
              <span>Empresas</span>
              <span>›</span>
              <span className="text-[#374151] font-medium">Diagnóstico de flota</span>
              {state.paso > 1 && state.empresa.nombre && (
                <>
                  <span>›</span>
                  <span className="text-[#374151] truncate max-w-[140px] sm:max-w-none">
                    {state.empresa.nombre}
                  </span>
                </>
              )}
            </div>
            <span className="inline-flex items-center gap-1.5 bg-[#FACC15] text-[#78350F] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
              <Building2 className="w-3 h-3" />
              Diagnóstico pyme
            </span>
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

              {state.paso < 9 ? (
                <Button
                  type="button"
                  onClick={pasoSiguiente}
                  disabled={!puedeAvanzar()}
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/pyme')}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  Finalizar
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

      {/* ── Admin nav ─────────────────────────────────────────────────────────
           Trigger: pequeño botón oculto al final de la página.
           Panel: barra flotante visible solo cuando adminMode está activo.
      ──────────────────────────────────────────────────────────────────────── */}

      {/* Trigger admin — fijo al costado derecho, centro vertical */}
      <button
        type="button"
        onClick={toggleAdmin}
        title={adminMode ? 'Desactivar modo admin' : 'Activar modo admin'}
        className={`
          fixed right-0 top-1/2 -translate-y-1/2 z-50 flex items-center gap-1.5 px-3 py-2 rounded-l-xl
          text-xs font-bold border-l border-t border-b transition-all duration-200 cursor-pointer shadow-md
          ${adminMode
            ? 'bg-orange-500 border-orange-600 text-white shadow-orange-300'
            : 'bg-white border-[#D1D5DB] text-[#9CA3AF] hover:text-[#374151] hover:border-[#9CA3AF]'
          }
        `}
      >
        <FlaskConical className="w-3.5 h-3.5" />
        {adminMode ? 'Admin ON' : 'Admin'}
      </button>

      {/* Barra flotante de navegación rápida (solo cuando adminMode activo) */}
      {adminMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#1C1917] border border-orange-500/40 rounded-2xl px-4 py-2.5 shadow-2xl shadow-black/40">
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mr-1 shrink-0">
            Admin
          </span>
          <div className="w-px h-4 bg-orange-500/30 mx-1 shrink-0" />
          {([1, 2, 3, 4, 5, 6, 7, 8, 9] as PymeState['paso'][]).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => set({ paso: n })}
              className={`
                w-7 h-7 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer shrink-0
                ${state.paso === n
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                }
              `}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
