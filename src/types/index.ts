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
