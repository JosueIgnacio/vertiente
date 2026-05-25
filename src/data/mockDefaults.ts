// ─────────────────────────────────────────────────────────────────────────────
// Valores de ejemplo a calibrar (supuestos demo)
// ─────────────────────────────────────────────────────────────────────────────

/** Precio bencina 95 en Chile ($/litro) */
export const PRECIO_BENCINA = 1_250;

/** Precio electricidad carga domiciliaria ($/kWh) */
export const PRECIO_ELECTRICIDAD_CASA = 250;

/** Precio electricidad carga pública ($/kWh) */
export const PRECIO_ELECTRICIDAD_PUBLICA = 450;

/** Precio VE estándar usado en el diagnóstico (no lo elige el usuario) */
export const PRECIO_EV_ESTANDAR = 20_000_000;

/** Consumo VE estándar (km/kWh) */
export const CONSUMO_EV_KM_KWH = 6;

/** Valor de reventa estimado del auto a combustión ($) */
export const REVENTA_COMBUSTION = 8_000_000;

/** Mantención mensual estándar del VE ($/mes) */
export const MANTENCION_EV_MENSUAL = 18_000;

/** Días por mes usados en el cálculo */
export const DIAS_POR_MES = 30;

// ─────────────────────────────────────────────────────────────────────────────
// Defaults del formulario de diagnóstico (persona natural)
// ─────────────────────────────────────────────────────────────────────────────
import type { DiagnosticoData } from '../types';

export const DIAGNOSTICO_DEFAULTS: DiagnosticoData = {
  kmDia: 50,
  ciudad: 'Santiago',
  usoPrincipal: 'cotidiano',
  rendimientoKmL: 12,
  mantencionAnual: 540_000, // $45.000/mes × 12
};
