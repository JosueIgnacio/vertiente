// ── Flujo persona natural (diagnóstico gratuito) ──────────────────────────────

export type UsoPrincipal = 'cotidiano' | 'taxi-app' | 'flota-pyme';

/** Datos que el usuario ingresa en el formulario simplificado */
export interface DiagnosticoData {
  kmDia: number;
  region: string;
  usoPrincipal: UsoPrincipal;
  rendimientoKmL: number;
  mantencionAnual: number; // $/año del auto actual
}

/** Tramo de carga asignado automáticamente según km/día */
export type TramoCarga = 'viaje' | 'domiciliario' | 'mixto';

/**
 * Información de carga calculada según km/día.
 * Reemplaza el antiguo MixCarga de porcentajes arbitrarios.
 */
export interface InfoCarga {
  tramo: TramoCarga;
  /** kW: 2,3 (viaje) | 7,4 (domiciliario/mixto) */
  potenciaCargador: number;
  /** $0 (viaje) | COSTO_CARGADOR_ESTANDAR (domiciliario/mixto) */
  costoInstalacion: number;
  /** kWh/mes cargados en casa */
  energiaDomiciliariaKwMes: number;
  /** kWh/mes cargados en red pública (0 si no aplica) */
  energiaPublicaKwMes: number;
}

/** Resultado del cálculo TCO */
export interface TCOResult {
  kmMes: number;
  costoCombustibleMes: number;
  mantencionCombustionMes: number;
  costoEnergiaEVMes: number;
  ahorroOperacionalMes: number;
  ahorroA5Anios: number;
  /** precioEVEstandar − reventaCombustion + costoInstalacion */
  inversionNetaEV: number;
  puntoEquilibrioAnios: number;
  infoCarga: InfoCarga;
  /** Costo de instalación del cargador ($0 para tramo viaje) */
  costoInstalacion: number;
  serieCombustion: { mes: number; costo: number }[];
  serieElectrico: { mes: number; costo: number }[];
  /** Total de meses en las series (>= 60, extendido para cubrir el cruce) */
  totalMeses: number;
}

// ── Modelos EV (para sección pyme / referencia) ───────────────────────────────
export interface EVModel {
  id: string;
  nombre: string;
  precio: number;
  consumoKmKwh: number;
  descripcion: string;
}

// ── Flujo Análisis completo (persona natural) ─────────────────────────────────

export interface ModeloEV {
  id: string;
  marca: string;
  modelo: string;
  carroceria: string;
  autonomiaKm: number;
  consumoKmKwh: number;
  plazas: number;
}

export interface Proveedor {
  id: string;
  nombre: string;
  telefono: string;
  correo: string;
  leadCasilla: string;
}

export interface Oferta {
  id: string;
  modeloId: string;
  proveedorId: string;
  precio: number;
}

// ── Flujo diagnóstico pyme ─────────────────────────────────────────────────────

export type Carroceria = 'citycar' | 'hatchback' | 'sedan' | 'suv' | 'pickup' | 'furgon';

export interface TipoVehiculo {
  id: string;
  etiqueta: string;
  carroceria: Carroceria;
  cantidad: number;
  antiguedadAnios: number;
  kmDia: number;
  horasOperacion: number;
  rendimientoKmL: number;
  mantencionAnual: number;
}

export interface DiagnosticoTipo {
  tipo: TipoVehiculo;
  ahorroMensualPorVehiculo: number;
  ahorroMensualTotal: number;
  reventaPorVehiculo: number;
  inversionNetaPorVehiculo: number;
  paybackBase: number;
  ajusteAntiguedad: number;
  paybackAjustado: number;
  co2EvitadoPorVehiculo: number;
  co2EvitadoTotal: number;
  razonRanking: string;
  modelosRecomendados: ModeloEV[];
}

export interface DiagnosticoFlota {
  tipos: DiagnosticoTipo[];
  ahorroMensualAgregado: number;
  ahorroA5AniosAgregado: number;
  co2EvitadoAnualAgregado: number;
  inversionNetaAgregada: number;
}

export interface SeleccionTipo {
  tipoId: string;
  cantidadRecambio: number;
  ofertas: { ofertaId: string; unidades: number }[];
}

export interface DatosSitio {
  estacionamientos: number;
  potenciaConectada: number;
  distAcometida: number;
  distInterna: number;
  canalizacion: 'sobrepuesta' | 'soterrada';
  empalme: 'ampliacion' | 'dedicado';
  quiereCargaRapida: boolean;
}

export interface PlanTipo {
  tipoId: string;
  cargadoresAC: number;
  usaDC: boolean;
  explicacion: string;
}

export interface PlanInfraestructura {
  cargadoresACTotales: number;
  cargadoresDCTotales: number;
  costoAC: number;
  costoDC: number;
  costoTotal: number;
  distribucionPorTipo: PlanTipo[];
  advertenciaSinDCPeroIntensivo: boolean;
  mensajeDCSinNecesidad: boolean;
}

export interface Banco {
  id: string;
  nombre: string;
  linea: string;
  tasaMensual: number;
  plazoMaxMeses: number;
  casilla: string;
}
