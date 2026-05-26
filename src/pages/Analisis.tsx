import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Car, Check, BarChart3, Zap } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Container from '../components/layout/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Stepper from '../components/ui/Stepper';
import { calcularTCO, calcularAhorroMensualConModelo } from '../lib/tco';
import { formatCLP, formatCLPMillon, formatAnios } from '../lib/format';
import {
  DIAGNOSTICO_DEFAULTS,
  INSTALACION_BASE, INSTALACION_ACOMETIDA_REF, INSTALACION_COSTO_POR_METRO_ACOMETIDA,
  INSTALACION_DIST_INTERNA_REF, INSTALACION_COSTO_POR_METRO_INTERNO,
  INSTALACION_RECARGO_SOTERRADO, INSTALACION_RECARGO_EMPALME_DEDICADO,
  INSTALACION_MARGEN_RANGO, REVENTA_COMBUSTION,
} from '../data/mockDefaults';
import { MODELOS } from '../data/modelos';
import { PROVEEDORES } from '../data/proveedores';
import { OFERTAS } from '../data/ofertas';
import type { DiagnosticoData, InfoCarga, ModeloEV, Proveedor, Oferta } from '../types';

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

// ── Vista 2 — Comparativa de modelos ──────────────────────────────────────────

interface OfertaCalculo {
  oferta: Oferta;
  modelo: ModeloEV;
  proveedor: Proveedor;
  ahorroMensual: number;
  paybackAnios: number;
}

interface Vista2Props {
  diagData: DiagnosticoData;
  state: AnalisisState;
  set: (p: Partial<AnalisisState>) => void;
}

function OfertaCard({
  oc, marcada, onToggle,
}: { oc: OfertaCalculo; marcada: boolean; onToggle: () => void }) {
  return (
    <div
      className={`relative flex flex-col bg-white rounded-2xl border-2 transition-all duration-150 shadow-sm hover:shadow-md cursor-pointer ${
        marcada ? 'border-[#16A34A]' : 'border-[#E5E7EB] hover:border-[#D1FAE5]'
      }`}
      onClick={onToggle}
    >
      {/* Checkmark badge */}
      {marcada && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#16A34A] flex items-center justify-center shadow">
          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Imagen placeholder */}
      <div className="flex items-center justify-center h-32 bg-[#F3F4F6] rounded-t-2xl">
        <Car className="w-12 h-12 text-[#9CA3AF]" />
      </div>

      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Título y carrocería */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] mb-0.5">
            {oc.modelo.marca}
          </p>
          <h3 className="font-bold text-[#111827] leading-tight">{oc.modelo.modelo}</h3>
          <p className="text-xs text-[#9CA3AF] mt-0.5">{oc.modelo.carroceria}</p>
        </div>

        {/* Specs del modelo */}
        <div className="grid grid-cols-3 gap-1 text-center">
          <div className="bg-[#F9FAFB] rounded-lg py-1.5 px-1">
            <p className="text-[10px] text-[#9CA3AF]">Autonomía</p>
            <p className="text-xs font-semibold text-[#374151]">{oc.modelo.autonomiaKm} km</p>
          </div>
          <div className="bg-[#F9FAFB] rounded-lg py-1.5 px-1">
            <p className="text-[10px] text-[#9CA3AF]">Consumo</p>
            <p className="text-xs font-semibold text-[#374151]">{oc.modelo.consumoKmKwh} km/kWh</p>
          </div>
          <div className="bg-[#F9FAFB] rounded-lg py-1.5 px-1">
            <p className="text-[10px] text-[#9CA3AF]">Plazas</p>
            <p className="text-xs font-semibold text-[#374151]">{oc.modelo.plazas}</p>
          </div>
        </div>

        {/* Proveedor + precio */}
        <div className="border-t border-[#F3F4F6] pt-3">
          <p className="text-[10px] text-[#9CA3AF] mb-0.5">Proveedor</p>
          <p className="text-xs font-medium text-[#374151]">{oc.proveedor.nombre}</p>
          <p className="text-lg font-bold text-[#0F3D2E] mt-1">{formatCLPMillon(oc.oferta.precio)}</p>
        </div>

        {/* Ahorro y payback */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#F0FDF4] rounded-lg px-2 py-2">
            <p className="text-[10px] text-[#6B7280]">Ahorro/mes</p>
            <p className="text-sm font-bold text-[#16A34A]">{formatCLP(Math.max(0, oc.ahorroMensual))}</p>
          </div>
          <div className="bg-[#EFF6FF] rounded-lg px-2 py-2">
            <p className="text-[10px] text-[#6B7280]">Recuperación</p>
            <p className="text-sm font-bold text-[#1D4ED8]">{formatAnios(oc.paybackAnios)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubVistaComparacion({
  items, onVolver,
}: { items: OfertaCalculo[]; onVolver: () => void }) {
  const campos: { label: string; valor: (oc: OfertaCalculo) => string }[] = [
    { label: 'Marca',       valor: (o) => o.modelo.marca },
    { label: 'Modelo',      valor: (o) => o.modelo.modelo },
    { label: 'Carrocería',  valor: (o) => o.modelo.carroceria },
    { label: 'Autonomía',   valor: (o) => `${o.modelo.autonomiaKm} km` },
    { label: 'Consumo',     valor: (o) => `${o.modelo.consumoKmKwh} km/kWh` },
    { label: 'Plazas',      valor: (o) => `${o.modelo.plazas}` },
    { label: 'Proveedor',   valor: (o) => o.proveedor.nombre },
    { label: 'Precio',      valor: (o) => formatCLPMillon(o.oferta.precio) },
    { label: 'Ahorro/mes',  valor: (o) => formatCLP(Math.max(0, o.ahorroMensual)) },
    { label: 'Recuperación',valor: (o) => formatAnios(o.paybackAnios) },
  ];

  return (
    <Card padding="lg">
      <button
        onClick={onVolver}
        className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al listado
      </button>

      <h2 className="font-bold text-[#111827] mb-5">
        Comparando {items.length} modelos
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[400px]">
          <thead>
            <tr>
              <th className="text-left text-xs text-[#9CA3AF] font-medium pb-3 pr-4 min-w-[120px]">
                Característica
              </th>
              {items.map((oc) => (
                <th key={oc.oferta.id} className="text-center pb-3 px-3">
                  <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase">{oc.modelo.marca}</p>
                  <p className="font-bold text-[#111827]">{oc.modelo.modelo}</p>
                  <p className="text-[10px] text-[#6B7280]">{oc.proveedor.nombre}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {campos.map(({ label, valor }) => (
              <tr key={label} className="border-t border-[#F3F4F6]">
                <td className="py-2.5 pr-4 text-xs text-[#6B7280] font-medium">{label}</td>
                {items.map((oc) => (
                  <td key={oc.oferta.id} className={`py-2.5 px-3 text-center text-xs font-semibold ${
                    label === 'Ahorro/mes' ? 'text-[#16A34A]' :
                    label === 'Recuperación' ? 'text-[#1D4ED8]' :
                    label === 'Precio' ? 'text-[#0F3D2E]' : 'text-[#374151]'
                  }`}>
                    {valor(oc)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Vista2Modelos({ diagData, state, set }: Vista2Props) {
  const [showComparacion, setShowComparacion] = useState(false);

  const ofertasConCalculo: OfertaCalculo[] = useMemo(() =>
    OFERTAS.map((oferta) => {
      const modelo    = MODELOS.find((m) => m.id === oferta.modeloId)!;
      const proveedor = PROVEEDORES.find((p) => p.id === oferta.proveedorId)!;
      const ahorroMensual = calcularAhorroMensualConModelo(diagData, modelo.consumoKmKwh);
      const inversion     = oferta.precio - REVENTA_COMBUSTION + state.costoInstalacionFinal;
      const paybackAnios  = ahorroMensual > 0 ? inversion / (ahorroMensual * 12) : 99;
      return { oferta, modelo, proveedor, ahorroMensual, paybackAnios };
    }),
    [diagData, state.costoInstalacionFinal]
  );

  const toggleMarcada = (id: string) => {
    const marcadas = state.ofertasMarcadas;
    set({
      ofertasMarcadas: marcadas.includes(id)
        ? marcadas.filter((m) => m !== id)
        : [...marcadas, id],
    });
  };

  const marcadasItems = ofertasConCalculo.filter((oc) =>
    state.ofertasMarcadas.includes(oc.oferta.id)
  );

  if (showComparacion) {
    return (
      <SubVistaComparacion
        items={marcadasItems}
        onVolver={() => setShowComparacion(false)}
      />
    );
  }

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="font-bold text-[#111827] text-lg">Modelos disponibles</h2>
          <p className="text-sm text-[#6B7280] mt-0.5">
            Selecciona los que te interesen y compáralos lado a lado.
          </p>
        </div>
        {state.ofertasMarcadas.length >= 2 && (
          <button
            onClick={() => setShowComparacion(true)}
            className="flex items-center gap-2 shrink-0 bg-[#0F3D2E] hover:bg-[#16A34A] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Comparar ({state.ofertasMarcadas.length})
          </button>
        )}
      </div>

      {/* Grid de fichas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ofertasConCalculo.map((oc) => (
          <OfertaCard
            key={oc.oferta.id}
            oc={oc}
            marcada={state.ofertasMarcadas.includes(oc.oferta.id)}
            onToggle={() => toggleMarcada(oc.oferta.id)}
          />
        ))}
      </div>

      {/* Hint si no hay selección */}
      {state.ofertasMarcadas.length === 0 && (
        <p className="text-center text-xs text-[#9CA3AF] mt-4">
          Haz clic en un modelo para marcarlo. Con 2 o más puedes compararlos.
        </p>
      )}
    </div>
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
            {state.paso === 2 && <Vista2Modelos diagData={diagData} state={state} set={set} />}
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
