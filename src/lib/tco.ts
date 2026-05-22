import type { SimuladorData, TCOResult, SemaforoEstado } from '../types';
import {
  PRECIO_BENCINA,
  PRECIO_ELECTRICIDAD_CASA,
  PRECIO_ELECTRICIDAD_PUBLICA,
  MANTENCION_BENCINA_MES,
  MANTENCION_EV_MES,
  VALOR_AUTO_ACTUAL_DEFAULT,
} from '../data/mockDefaults';
import { formatCLP, formatAnios } from './format';

/**
 * Función pura de cálculo de Costo Total de Operación (TCO).
 * Recibe los datos del simulador y retorna el resultado completo.
 */
export function calcularTCO(data: SimuladorData): TCOResult {
  const {
    kmMensuales,
    rendimientoKmL,
    gastoMensualCombustible,
    mantencionMensual,
    precioEV,
    consumoKmKwh,
    tipoCarga,
  } = data;

  // ── Costos mensuales ────────────────────────────────────────────────────────

  // Usamos el gasto declarado si es mayor a 0, sino calculamos desde rendimiento
  const costoCombustibleMes =
    gastoMensualCombustible > 0
      ? gastoMensualCombustible
      : (kmMensuales / rendimientoKmL) * PRECIO_BENCINA;

  const precioKwh =
    tipoCarga === 'publica'
      ? PRECIO_ELECTRICIDAD_PUBLICA
      : PRECIO_ELECTRICIDAD_CASA;

  const costoEnergiaEVMes = (kmMensuales / consumoKmKwh) * precioKwh;

  // Mantención: usamos la declarada para combustión; EV tiene mantención fija referencial
  const mantencionCombustionMes = mantencionMensual > 0 ? mantencionMensual : MANTENCION_BENCINA_MES;
  const mantencionEVMes = MANTENCION_EV_MES;

  const costoTotalCombustionMes = costoCombustibleMes + mantencionCombustionMes;
  const costoTotalEVMes = costoEnergiaEVMes + mantencionEVMes;

  // ── Ahorro ──────────────────────────────────────────────────────────────────

  const ahorroOperacionalMes = costoTotalCombustionMes - costoTotalEVMes;
  const ahorroA5Anios = ahorroOperacionalMes * 60; // 60 meses

  // ── Inversión incremental ───────────────────────────────────────────────────
  // Supuesto: el usuario ya tiene auto; inversión incremental = precio EV - valor auto actual
  const inversionIncremental = Math.max(precioEV - VALOR_AUTO_ACTUAL_DEFAULT, precioEV * 0.4);

  // ── Punto de equilibrio ─────────────────────────────────────────────────────
  const ahorroAnual = ahorroOperacionalMes * 12;
  const puntoEquilibrioAnios =
    ahorroAnual > 0 ? inversionIncremental / ahorroAnual : 99;

  // ── Series para gráfico (60 meses) ─────────────────────────────────────────
  // Costo acumulado: inversión inicial + costos operacionales mes a mes
  const serieCombustion: { mes: number; costo: number }[] = [];
  const serieElectrico: { mes: number; costo: number }[] = [];

  // Combustión: inversión = valor auto actual (ya la tiene); para el gráfico
  // usamos solo el costo operacional acumulado desde 0 para claridad visual
  // Eléctrico: parte desde la inversión incremental y va bajando la diferencia
  const inversionMostrada = inversionIncremental;

  for (let mes = 1; mes <= 60; mes++) {
    serieCombustion.push({
      mes,
      costo: costoTotalCombustionMes * mes,
    });
    serieElectrico.push({
      mes,
      costo: inversionMostrada + costoTotalEVMes * mes,
    });
  }

  // ── Semáforo ────────────────────────────────────────────────────────────────
  let semaforoEstado: SemaforoEstado;

  if (puntoEquilibrioAnios <= 4 && tipoCarga !== 'publica') {
    semaforoEstado = 'conviene';
  } else if (puntoEquilibrioAnios > 7 || (tipoCarga === 'publica' && kmMensuales < 1200)) {
    semaforoEstado = 'no-conviene';
  } else {
    semaforoEstado = 'conviene-condiciones';
  }

  // ── Mensaje dinámico ────────────────────────────────────────────────────────
  const cargaLabel =
    tipoCarga === 'casa' ? 'en domicilio'
    : tipoCarga === 'empresa' ? 'en tu empresa'
    : tipoCarga === 'edificio' ? 'en tu edificio'
    : 'en carga pública';

  let mensajeDinamico = '';

  if (semaforoEstado === 'conviene') {
    mensajeDinamico = `En tu caso, el cambio a eléctrico podría generar un ahorro estimado de ${formatCLP(ahorroOperacionalMes)} mensuales. El punto de equilibrio se alcanza en ${formatAnios(puntoEquilibrioAnios)}, cargando principalmente ${cargaLabel}. Es una decisión que financieramente tiene sentido.`;
  } else if (semaforoEstado === 'conviene-condiciones') {
    mensajeDinamico = `El cambio podría ahorrarte ${formatCLP(ahorroOperacionalMes)} al mes, pero el punto de equilibrio está en ${formatAnios(puntoEquilibrioAnios)}. Conviene si resuelves la factibilidad de carga ${cargaLabel} y tienes horizonte de uso de al menos 5 años.`;
  } else {
    mensajeDinamico = `Con tu perfil actual (${kmMensuales.toLocaleString('es-CL')} km/mes, carga ${cargaLabel}), el punto de equilibrio sería de ${formatAnios(puntoEquilibrioAnios)}. Por ahora el cambio no es conveniente, pero puede mejorar si aumentas el uso o resuelves carga domiciliaria.`;
  }

  return {
    costoCombustibleMes,
    costoEnergiaEVMes,
    ahorroOperacionalMes,
    ahorroA5Anios,
    inversionIncremental,
    puntoEquilibrioAnios,
    semaforoEstado,
    serieCombustion,
    serieElectrico,
    mensajeDinamico,
  };
}
