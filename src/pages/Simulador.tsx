import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import type { DiagnosticoData, UsoPrincipal } from '../types';
import { DIAGNOSTICO_DEFAULTS } from '../data/mockDefaults';

// ── Helpers de formulario ─────────────────────────────────────────────────────

function FieldLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="block text-sm font-medium text-[#374151]">{children}</label>
      {hint && <p className="text-xs text-[#9CA3AF] mt-0.5">{hint}</p>}
    </div>
  );
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

// ── Página ────────────────────────────────────────────────────────────────────

export default function Simulador() {
  const navigate = useNavigate();
  const [data, setData] = useState<DiagnosticoData>(DIAGNOSTICO_DEFAULTS);

  const set = (partial: Partial<DiagnosticoData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('evmarket_diagnostico', JSON.stringify(data));
    navigate('/resultado');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F9FAFB]">
      <Navbar />

      <main className="flex-1 py-12">
        <Container narrow>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#0F3D2E] mb-2">
              Diagnóstico gratuito
            </h1>
            <p className="text-[#6B7280] text-sm max-w-md mx-auto">
              Cuéntanos cómo usas tu auto. En menos de un minuto calculamos si un eléctrico tiene sentido para ti.
            </p>
          </div>

          {/* Formulario único */}
          <form onSubmit={handleSubmit}>
            <Card padding="lg" className="flex flex-col gap-7">

              {/* Kilómetros por día */}
              <div>
                <FieldLabel hint="Suma todos tus recorridos típicos del día">
                  ¿Cuántos kilómetros recorres al día en promedio?
                </FieldLabel>
                <NumberInput
                  value={data.kmDia}
                  onChange={(v) => set({ kmDia: v })}
                  min={1}
                  max={2000}
                  suffix="km / día"
                />
              </div>

              {/* Región */}
              <div>
                <FieldLabel>Región de operación</FieldLabel>
                <SelectInput
                  value={data.region}
                  onChange={(v) => set({ region: v })}
                  options={[
                    { value: 'Arica y Parinacota',       label: 'Región de Arica y Parinacota' },
                    { value: 'Tarapacá',                  label: 'Región de Tarapacá' },
                    { value: 'Antofagasta',               label: 'Región de Antofagasta' },
                    { value: 'Atacama',                   label: 'Región de Atacama' },
                    { value: 'Coquimbo',                  label: 'Región de Coquimbo' },
                    { value: 'Valparaíso',                label: 'Región de Valparaíso' },
                    { value: 'Metropolitana de Santiago', label: 'Región Metropolitana de Santiago' },
                    { value: "O'Higgins",                 label: "Región del Libertador Gral. B. O'Higgins" },
                    { value: 'Maule',                     label: 'Región del Maule' },
                    { value: 'Ñuble',                     label: 'Región de Ñuble' },
                    { value: 'Biobío',                    label: 'Región del Biobío' },
                    { value: 'La Araucanía',              label: 'Región de La Araucanía' },
                    { value: 'Los Ríos',                  label: 'Región de Los Ríos' },
                    { value: 'Los Lagos',                 label: 'Región de Los Lagos' },
                    { value: 'Aysén',                     label: 'Región de Aysén' },
                    { value: 'Magallanes',                label: 'Región de Magallanes' },
                  ]}
                />
              </div>

              {/* Uso principal */}
              <div>
                <FieldLabel>¿Cuál es el uso principal de tu vehículo?</FieldLabel>
                <ToggleGroup<UsoPrincipal>
                  value={data.usoPrincipal}
                  onChange={(v) => set({ usoPrincipal: v })}
                  options={[
                    { value: 'cotidiano', label: 'Uso cotidiano', desc: 'Casa, trabajo, trámites' },
                    { value: 'taxi-app', label: 'Taxi / App', desc: 'Uber, Cabify, taxi' },
                    { value: 'flota-pyme', label: 'Flota pyme', desc: 'Reparto o empresa' },
                  ]}
                />
                {data.usoPrincipal === 'flota-pyme' && (
                  <div className="mt-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl px-4 py-3 text-xs text-[#15803D]">
                    Para flotas de empresa tenemos un diagnóstico especializado.{' '}
                    <a href="/pyme" className="font-semibold underline">
                      Ver diagnóstico pyme →
                    </a>
                  </div>
                )}
              </div>

              {/* Rendimiento */}
              <div>
                <FieldLabel hint="Sedán / hatchback promedio: 10–14 km/L · SUV: 8–11 km/L">
                  Rendimiento de tu auto actual
                </FieldLabel>
                <NumberInput
                  value={data.rendimientoKmL}
                  onChange={(v) => set({ rendimientoKmL: v })}
                  min={3}
                  max={30}
                  suffix="km / L"
                />
              </div>

              {/* Mantención anual */}
              <div>
                <FieldLabel hint="Incluye aceite, filtros, revisión técnica, pastillas de freno, etc.">
                  Mantención anual de tu auto actual
                </FieldLabel>
                <NumberInput
                  value={data.mantencionAnual}
                  onChange={(v) => set({ mantencionAnual: v })}
                  min={0}
                  prefix="$"
                  suffix="/ año"
                />
              </div>

              {/* Info: qué usamos nosotros */}
              <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-3 text-xs text-[#6B7280]">
                <span className="font-medium text-[#374151]">¿Y el auto eléctrico?</span>{' '}
                Para la comparación usamos un vehículo eléctrico estándar de referencia — tú no necesitas elegir modelo.
                Te mostramos el resultado al revelar el diagnóstico.
              </div>

              {/* Submit */}
              <Button type="submit" size="lg" fullWidth>
                Ver mi diagnóstico
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>
          </form>
        </Container>
      </main>

      <Footer />
    </div>
  );
}
