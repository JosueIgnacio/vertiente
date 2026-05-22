import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Zap, Car, BatteryCharging, Home as HomeIcon } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import Stepper from '../components/ui/Stepper';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { SIMULADOR_DEFAULTS } from '../data/mockDefaults';
import { EV_MODELS } from '../data/evModels';
import type { SimuladorData, TipoUsuario, UsoPrincipal, TipoCarga } from '../types';
import { formatCLP } from '../lib/format';

const PASOS = ['Tu uso', 'Vehículo actual', 'Alternativa eléctrica', 'Infraestructura'];

// ── Helpers UI ────────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-[#374151] mb-1.5">{children}</label>;
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-[#9CA3AF] mt-1">{children}</p>;
}

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
        <span className="px-3 bg-[#F9FAFB] border-r border-[#E5E7EB] text-sm text-[#6B7280] h-full flex items-center py-3">
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
        <span className="px-3 bg-[#F9FAFB] border-l border-[#E5E7EB] text-sm text-[#6B7280] flex items-center py-3">
          {suffix}
        </span>
      )}
    </div>
  );
}

function SelectInput<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
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
            px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 cursor-pointer
            ${value === o.value
              ? 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D] shadow-sm'
              : 'border-[#E5E7EB] text-[#374151] hover:border-[#16A34A] hover:bg-[#F9FAFB]'
            }
          `}
        >
          {o.label}
          {o.desc && <span className="block text-xs opacity-70 font-normal">{o.desc}</span>}
        </button>
      ))}
    </div>
  );
}

// ── Paso 1: Uso ───────────────────────────────────────────────────────────────
function Paso1({ data, set }: { data: SimuladorData; set: (d: Partial<SimuladorData>) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <FieldLabel>¿Para quién es este análisis?</FieldLabel>
        <ToggleGroup<TipoUsuario>
          value={data.tipoUsuario}
          onChange={(v) => set({ tipoUsuario: v })}
          options={[
            { value: 'persona', label: 'Persona natural' },
            { value: 'empresa', label: 'Empresa / pyme' },
          ]}
        />
      </div>

      <div>
        <FieldLabel>Kilómetros mensuales recorridos</FieldLabel>
        <NumberInput
          value={data.kmMensuales}
          onChange={(v) => set({ kmMensuales: v })}
          min={100}
          max={20000}
          suffix="km/mes"
        />
        <FieldHint>Promedio urbano en Chile: 1.200–1.800 km/mes</FieldHint>
      </div>

      <div>
        <FieldLabel>Ciudad / Región</FieldLabel>
        <SelectInput<string>
          value={data.ciudad}
          onChange={(v) => set({ ciudad: v })}
          options={[
            { value: 'Santiago', label: 'Santiago (RM)' },
            { value: 'Valparaíso', label: 'Valparaíso / Viña del Mar' },
            { value: 'Concepción', label: 'Concepción / Biobío' },
            { value: 'La Serena', label: 'La Serena / Coquimbo' },
            { value: 'Temuco', label: 'Temuco / Araucanía' },
            { value: 'Antofagasta', label: 'Antofagasta' },
            { value: 'Otra', label: 'Otra ciudad' },
          ]}
        />
      </div>

      <div>
        <FieldLabel>Uso principal del vehículo</FieldLabel>
        <ToggleGroup<UsoPrincipal>
          value={data.usoPrincipal}
          onChange={(v) => set({ usoPrincipal: v })}
          options={[
            { value: 'diario', label: 'Uso diario' },
            { value: 'trabajo', label: 'Ir al trabajo' },
            { value: 'reparto', label: 'Reparto' },
            { value: 'taxi-app', label: 'Taxi / App' },
            { value: 'pyme', label: 'Flota pyme' },
          ]}
        />
      </div>
    </div>
  );
}

// ── Paso 2: Vehículo actual ───────────────────────────────────────────────────
function Paso2({ data, set }: { data: SimuladorData; set: (d: Partial<SimuladorData>) => void }) {
  const costoCalculado = Math.round((data.kmMensuales / data.rendimientoKmL) * 1250);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-[#F9FAFB] rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm text-[#6B7280]">
        💡 Completa con tus datos reales o ajusta los valores precargados como referencia.
      </div>

      <div>
        <FieldLabel>Gasto mensual estimado en combustible</FieldLabel>
        <NumberInput
          value={data.gastoMensualCombustible}
          onChange={(v) => set({ gastoMensualCombustible: v })}
          min={0}
          prefix="$"
          suffix="/ mes"
        />
        <FieldHint>
          Cálculo sugerido según tus km: {formatCLP(costoCalculado)} / mes
          (bencina 95 ~$1.250/L)
        </FieldHint>
      </div>

      <div>
        <FieldLabel>Rendimiento del auto actual</FieldLabel>
        <NumberInput
          value={data.rendimientoKmL}
          onChange={(v) => set({ rendimientoKmL: v })}
          min={4}
          max={30}
          suffix="km/L"
        />
        <FieldHint>Sedán / hatchback promedio: 10–14 km/L</FieldHint>
      </div>

      <div>
        <FieldLabel>Mantención mensual promedio</FieldLabel>
        <NumberInput
          value={data.mantencionMensual}
          onChange={(v) => set({ mantencionMensual: v })}
          min={0}
          prefix="$"
          suffix="/ mes"
        />
        <FieldHint>Incluye aceite, filtros, correa de distribución, etc.</FieldHint>
      </div>
    </div>
  );
}

// ── Paso 3: Alternativa eléctrica ─────────────────────────────────────────────
function Paso3({ data, set }: { data: SimuladorData; set: (d: Partial<SimuladorData>) => void }) {
  const modeloSeleccionado = EV_MODELS.find((m) => m.id === data.modeloEVId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <FieldLabel>Modelo eléctrico referencial</FieldLabel>
        <SelectInput<string>
          value={data.modeloEVId}
          onChange={(v) => {
            const model = EV_MODELS.find((m) => m.id === v);
            if (model) {
              set({ modeloEVId: v, precioEV: model.precio, consumoKmKwh: model.consumoKmKwh });
            }
          }}
          options={EV_MODELS.map((m) => ({ value: m.id, label: `${m.nombre} — ${formatCLP(m.precio)}` }))}
        />
        {modeloSeleccionado && (
          <FieldHint>{modeloSeleccionado.descripcion} · {modeloSeleccionado.consumoKmKwh} km/kWh referencial</FieldHint>
        )}
      </div>

      <div>
        <FieldLabel>Precio del vehículo eléctrico</FieldLabel>
        <NumberInput
          value={data.precioEV}
          onChange={(v) => set({ precioEV: v })}
          min={5000000}
          prefix="$"
        />
        <FieldHint>Precio de lista referencial — puede variar según dealer y equipamiento</FieldHint>
      </div>

      <div>
        <FieldLabel>Consumo eléctrico</FieldLabel>
        <NumberInput
          value={data.consumoKmKwh}
          onChange={(v) => set({ consumoKmKwh: v })}
          min={3}
          max={15}
          suffix="km/kWh"
        />
        <FieldHint>Rango típico citadinos: 5–8 km/kWh</FieldHint>
      </div>

      <div>
        <FieldLabel>¿Dónde cargarás principalmente?</FieldLabel>
        <ToggleGroup<TipoCarga>
          value={data.tipoCarga}
          onChange={(v) => set({ tipoCarga: v })}
          options={[
            { value: 'casa', label: 'Casa' },
            { value: 'edificio', label: 'Edificio / condo' },
            { value: 'empresa', label: 'Empresa' },
            { value: 'publica', label: 'Pública' },
          ]}
        />
        {data.tipoCarga === 'publica' && (
          <div className="mt-2 bg-[#FEF9C3] border border-[#FDE047] rounded-lg px-3 py-2 text-xs text-[#92400E]">
            ⚠️ La carga pública (~$450/kWh) reduce significativamente el ahorro vs. carga domiciliaria (~$250/kWh)
          </div>
        )}
      </div>
    </div>
  );
}

// ── Paso 4: Infraestructura ───────────────────────────────────────────────────
function Paso4({ data, set }: { data: SimuladorData; set: (d: Partial<SimuladorData>) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <FieldLabel>¿Tienes estacionamiento propio?</FieldLabel>
        <ToggleGroup<string>
          value={data.tieneEstacionamiento ? 'si' : 'no'}
          onChange={(v) => set({ tieneEstacionamiento: v === 'si' })}
          options={[
            { value: 'si', label: 'Sí, tengo' },
            { value: 'no', label: 'No, estacionamiento compartido o calle' },
          ]}
        />
        {!data.tieneEstacionamiento && (
          <p className="text-xs text-[#6B7280] mt-2">
            Sin estacionamiento propio, la instalación de un cargador privado es más difícil. Igual puedes evaluar carga en empresa o pública.
          </p>
        )}
      </div>

      <div>
        <FieldLabel>¿Te interesa cotizar la instalación de un cargador?</FieldLabel>
        <ToggleGroup<string>
          value={data.interesaCargador ? 'si' : 'no'}
          onChange={(v) => set({ interesaCargador: v === 'si' })}
          options={[
            { value: 'si', label: 'Sí, quiero cotizar' },
            { value: 'no', label: 'No por ahora' },
          ]}
        />
        {data.interesaCargador && (
          <p className="text-xs text-[#6B7280] mt-2">
            Una instalación domiciliaria tipo Wall Box oscila entre $600.000 y $1.200.000 en Chile, dependiendo de la distancia al tablero eléctrico.
          </p>
        )}
      </div>

      {/* Resumen pre-resultado */}
      <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 mt-2">
        <p className="text-sm font-semibold text-[#15803D] mb-2">Resumen de tu simulación</p>
        <ul className="text-xs text-[#374151] flex flex-col gap-1">
          <li>📍 {data.ciudad} · {data.kmMensuales.toLocaleString('es-CL')} km/mes</li>
          <li>⛽ Gasto combustible: {formatCLP(data.gastoMensualCombustible)}/mes · mantención {formatCLP(data.mantencionMensual)}/mes</li>
          <li>⚡ {EV_MODELS.find(m => m.id === data.modeloEVId)?.nombre ?? 'VE'} · {formatCLP(data.precioEV)} · carga {data.tipoCarga}</li>
        </ul>
      </div>
    </div>
  );
}

// ── Íconos por paso ───────────────────────────────────────────────────────────
const STEP_ICONS = [
  <Zap className="w-5 h-5" />,
  <Car className="w-5 h-5" />,
  <BatteryCharging className="w-5 h-5" />,
  <HomeIcon className="w-5 h-5" />,
];

// ── Página principal ──────────────────────────────────────────────────────────
export default function Simulador() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SimuladorData>(SIMULADOR_DEFAULTS);

  const set = (partial: Partial<SimuladorData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const handleSiguiente = () => {
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      // Guardar en localStorage para pasarla a Resultado
      localStorage.setItem('vertiente_sim', JSON.stringify(data));
      navigate('/resultado');
    }
  };

  const handleAnterior = () => setStep((s) => s - 1);

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <main className="flex-1 py-12">
        <Container narrow>
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[#0F3D2E] mb-2">
              Diagnóstico de electromovilidad
            </h1>
            <p className="text-[#6B7280] text-sm">
              Completa los 4 pasos para ver tu análisis personalizado
            </p>
          </div>

          {/* Stepper */}
          <div className="mb-10">
            <Stepper steps={PASOS} currentStep={step} />
          </div>

          {/* Card del paso */}
          <Card padding="lg" className="mb-6">
            {/* Título del paso */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#F3F4F6]">
              <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] flex items-center justify-center text-[#15803D]">
                {STEP_ICONS[step]}
              </div>
              <div>
                <p className="text-xs text-[#9CA3AF] font-medium uppercase tracking-wider">
                  Paso {step + 1} de 4
                </p>
                <h2 className="text-lg font-semibold text-[#111827]">{PASOS[step]}</h2>
              </div>
            </div>

            {/* Contenido del paso */}
            {step === 0 && <Paso1 data={data} set={set} />}
            {step === 1 && <Paso2 data={data} set={set} />}
            {step === 2 && <Paso3 data={data} set={set} />}
            {step === 3 && <Paso4 data={data} set={set} />}
          </Card>

          {/* Navegación */}
          <div className="flex items-center justify-between">
            <div>
              {step > 0 && (
                <Button variant="ghost" onClick={handleAnterior}>
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </Button>
              )}
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleSiguiente}
            >
              {step < 3 ? (
                <>
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Ver mi resultado
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
