import {
  INSTALACION_BASE,
  INSTALACION_ACOMETIDA_REF,
  INSTALACION_COSTO_POR_METRO_ACOMETIDA,
  INSTALACION_DIST_INTERNA_REF,
  INSTALACION_COSTO_POR_METRO_INTERNO,
  INSTALACION_RECARGO_SOTERRADO,
  INSTALACION_RECARGO_EMPALME_DEDICADO,
  INSTALACION_MARGEN_RANGO,
} from '../data/mockDefaults';

/**
 * Calcula el rango estimado de costo de instalación de un cargador domiciliario
 * a partir de las variables del sitio.
 *
 * Fuente de referencia: Estudio de Costos AgenciaSE 2026 (residencial AC).
 * Los valores son referenciales; no constituyen una cotización.
 */
export function calcularRangoInstalacion(
  distAcometida: number,
  distInterna: number,
  canalizacion: 'sobrepuesta' | 'soterrada',
  conexion: 'ampliacion' | 'dedicado',
): { min: number; max: number } {
  const base =
    INSTALACION_BASE +
    (distAcometida - INSTALACION_ACOMETIDA_REF) * INSTALACION_COSTO_POR_METRO_ACOMETIDA +
    (distInterna - INSTALACION_DIST_INTERNA_REF) * INSTALACION_COSTO_POR_METRO_INTERNO +
    (canalizacion === 'soterrada' ? INSTALACION_RECARGO_SOTERRADO : 0) +
    (conexion === 'dedicado' ? INSTALACION_RECARGO_EMPALME_DEDICADO : 0);

  const piso = Math.max(base, 1_200_000);
  const min = Math.round((piso * (1 - INSTALACION_MARGEN_RANGO)) / 1000) * 1000;
  const max = Math.round((piso * (1 + INSTALACION_MARGEN_RANGO)) / 1000) * 1000;
  return { min, max };
}
