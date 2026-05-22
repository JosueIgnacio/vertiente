// ──────────────────────────────────────────────
// Valores de ejemplo a calibrar (supuestos demo)
// ──────────────────────────────────────────────

/** Precio bencina 95 en Chile ($/litro) */
export const PRECIO_BENCINA = 1250;

/** Precio electricidad carga domiciliaria ($/kWh) */
export const PRECIO_ELECTRICIDAD_CASA = 250;

/** Precio electricidad carga pública ($/kWh) */
export const PRECIO_ELECTRICIDAD_PUBLICA = 450;

/** Rendimiento auto combustión promedio (km/litro) */
export const RENDIMIENTO_BENCINA_KM_L = 12;

/** Consumo VE promedio (km/kWh) */
export const CONSUMO_EV_KM_KWH = 6.5;

/** Mantención mensual promedio auto combustión ($) */
export const MANTENCION_BENCINA_MES = 45_000;

/** Mantención mensual promedio VE ($) */
export const MANTENCION_EV_MES = 18_000;

/** Precio VE referencial por defecto ($) */
export const PRECIO_EV_REFERENCIAL = 23_000_000;

/** Kilómetros mensuales por defecto */
export const KM_MENSUALES_DEFAULT = 1_500;

/** Valor estimado auto actual (usado para calcular inversión incremental) */
export const VALOR_AUTO_ACTUAL_DEFAULT = 8_000_000;

import type { SimuladorData } from '../types';

/** Datos precargados para la demo */
export const SIMULADOR_DEFAULTS: SimuladorData = {
  tipoUsuario: 'persona',
  kmMensuales: KM_MENSUALES_DEFAULT,
  ciudad: 'Santiago',
  usoPrincipal: 'diario',

  gastoMensualCombustible: 156_250, // ~1500 km / 12 km/L * $1250
  rendimientoKmL: RENDIMIENTO_BENCINA_KM_L,
  mantencionMensual: MANTENCION_BENCINA_MES,

  modeloEVId: 'byd-dolphin',
  precioEV: 19_990_000,
  consumoKmKwh: 6.5,
  tipoCarga: 'casa',

  tieneEstacionamiento: true,
  interesaCargador: true,
};
