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

// ── Análisis de flota pyme ────────────────────────────────────────────────────

/** Valor de reventa estimado de un vehículo nuevo (0 años) */
export const REVENTA_BASE_NUEVA = 10_000_000;

/** Pérdida de valor de reventa por año */
export const DEPRECIACION_ANUAL = 500_000;

/** Valor mínimo de reventa (vehículos muy antiguos) */
export const PISO_REVENTA = 2_000_000;

/** Años de payback restados por cada año de antigüedad sobre la referencia */
export const BONO_POR_ANIO_EXTRA_EDAD = 0.3;

/** Edad de referencia para el bono de antigüedad */
export const EDAD_REFERENCIA = 5;

/** Factor de emisión de CO2 por litro de bencina (kg CO2/L) */
export const FACTOR_EMISION_BENCINA = 2.3;

/** Factor de emisión de CO2 por kWh de la red eléctrica chilena (kg CO2/kWh) */
export const FACTOR_EMISION_RED_ELECTRICA = 0.4;

// ── Dimensionamiento de infraestructura pyme ──────────────────────────────────

/** Potencia cargador AC estándar para pyme (kW) */
export const POTENCIA_AC_ESTANDAR_PYME = 7.4;

/** Potencia cargador DC estándar (kW) */
export const POTENCIA_DC_ESTANDAR = 50;

/** Capacidad diaria útil de una unidad DC (kWh/día, referencial) */
export const CAPACIDAD_DIARIA_UTIL_DC = 200;

/** Costo de un cargador DC instalado ($ — respeta regla "10x AC") */
export const COSTO_CARGADOR_DC_INSTALADO = 20_000_000;

/** Factor de utilización AC: margen para no asumir uso 100% de la ventana */
export const FACTOR_UTILIZACION_AC = 0.85;

/** Costo adicional por cada cargador AC extra más allá del primero del sitio */
export const COSTO_INCREMENTAL_CARGADOR_AC = 300_000;

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
