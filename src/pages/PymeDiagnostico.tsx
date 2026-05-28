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
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Stepper from '../components/ui/Stepper';
import StatCard from '../components/ui/StatCard';
import TCOChart from '../components/charts/TCOChart';
import { analizarFlota, generarSeriesFlota } from '../lib/flotaAnalysis';
import { formatCLP, formatCLPMillon, formatAnios } from '../lib/format';
import { MODELOS } from '../data/modelos';
import { OFERTAS } from '../data/ofertas';
import { PROVEEDORES } from '../data/proveedores';
import { SEGMENTOS } from '../data/segmentos';
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

// ── Stubs para pasos 3–9 ──────────────────────────────────────────────────────

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

  // Validación del botón "Continuar" por paso
  const puedeAvanzar = (): boolean => {
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
