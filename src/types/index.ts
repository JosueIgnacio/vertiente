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

/** Mix de carga asignado automáticamente según km/día */
export interface MixCarga {
  pctCasa: number;   // 0–1
  pctPublica: number; // 0–1
  precioKwhEfectivo: number;
}

/** Resultado del cálculo TCO */
export interface TCOResult {
  kmMes: number;
  costoCombustibleMes: number;
  mantencionCombustionMes: number;
  costoEnergiaEVMes: number;
  ahorroOperacionalMes: number;
  ahorroA5Anios: number;
  inversionNetaEV: number;       // precioEVEstandar - reventaCombustion
  puntoEquilibrioAnios: number;
  mixCarga: MixCarga;
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
