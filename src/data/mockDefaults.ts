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

/** Consumo VE estándar (km/kWh) — fuente: Estudio AgenciaSE 2026 */
export const CONSUMO_EV_KM_KWH = 5;

/** Valor de reventa estimado del auto a combustión ($) */
export const REVENTA_COMBUSTION = 10_000_000;

/** Mantención mensual estándar del VE ($/mes) */
export const MANTENCION_EV_MENSUAL = 18_000;

/** Días por mes usados en el cálculo */
export const DIAS_POR_MES = 30;

// ── Infraestructura de carga ──────────────────────────────────────────────────

/** Supuesto fijo: ventana nocturna disponible para cargar (horas) */
export const HORAS_CARGA_NOCTURNA = 6;

/** Potencia cargador de viaje / enchufe común (kW) */
export const POTENCIA_CARGADOR_VIAJE = 2.3;

/** Potencia cargador domiciliario dedicado (kW) */
export const POTENCIA_CARGADOR_DOMICILIARIO = 7.4;

/** Costo estándar instalación residencial (AgenciaSE 2026) */
export const COSTO_CARGADOR_ESTANDAR = 1_900_000;

/** Hasta este km/día basta el cargador de viaje */
export const UMBRAL_KM_SOLO_VIAJE = 70;

/** Sobre este km/día se requiere carga pública para el excedente */
export const UMBRAL_KM_CARGA_PUBLICA = 200;

// ── Estimador de instalación (post-pago) ──────────────────────────────────────

/** Base: acometida 20m, distancia interna 10m, sobrepuesta, ampliación de empalme */
export const INSTALACION_BASE = 1_900_000;
export const INSTALACION_ACOMETIDA_REF = 20;               // metros referencia
export const INSTALACION_COSTO_POR_METRO_ACOMETIDA = 20_000;
export const INSTALACION_DIST_INTERNA_REF = 10;            // metros referencia
export const INSTALACION_COSTO_POR_METRO_INTERNO = 20_000;
export const INSTALACION_RECARGO_SOTERRADO = 500_000;
export const INSTALACION_RECARGO_EMPALME_DEDICADO = 250_000;
export const INSTALACION_MARGEN_RANGO = 0.12;              // ±12%

// ── Financiamiento referencial ────────────────────────────────────────────────

/** Tasa mensual referencial BancoEstado Crédito Verde (equivalente a CAE referencial) */
export const TASA_MENSUAL_REFERENCIAL = 0.0089;

// ─────────────────────────────────────────────────────────────────────────────
// Defaults del formulario de diagnóstico (persona natural)
// ─────────────────────────────────────────────────────────────────────────────
import type { DiagnosticoData } from '../types';

export const DIAGNOSTICO_DEFAULTS: DiagnosticoData = {
  kmDia: 50,
  region: 'Metropolitana de Santiago',
  usoPrincipal: 'cotidiano',
  rendimientoKmL: 12,
  mantencionAnual: 540_000, // $45.000/mes × 12
};
