import type {
  TipoVehiculo,
  DiagnosticoTipo,
  DiagnosticoFlota,
  DiagnosticoData,
  ModeloEV,
} from '../types';
import { calcularTCO } from './tco';
import { MODELOS } from '../data/modelos';
import { SEGMENTOS, precioEVRefPorCarroceria } from '../data/segmentos';
import {
  REVENTA_BASE_NUEVA,
  DEPRECIACION_ANUAL,
  PISO_REVENTA,
  BONO_POR_ANIO_EXTRA_EDAD,
  EDAD_REFERENCIA,
  FACTOR_EMISION_BENCINA,
  FACTOR_EMISION_RED_ELECTRICA,
  CONSUMO_EV_KM_KWH,
  PRECIO_ELECTRICIDAD_CASA,
  PRECIO_ELECTRICIDAD_PUBLICA,
  MANTENCION_EV_MENSUAL,
  DIAS_POR_MES,
  PRECIO_BENCINA,
} from '../data/mockDefaults';

/**
 * Analiza la flota por tipos y devuelve el diagnóstico completo con priorización.
 * Función pura sin efectos secundarios.
 */
export function analizarFlota(flota: TipoVehiculo[]): DiagnosticoFlota {
  const tipos: DiagnosticoTipo[] = flota.map((tipo) => {
    // ── Modelos recomendados del segmento ─────────────────────────────────────
    const modeloIds = SEGMENTOS[tipo.carroceria] ?? [];
    const modelosRecomendados: ModeloEV[] = modeloIds
      .map((id) => MODELOS.find((m) => m.id === id))
      .filter((m): m is ModeloEV => m !== undefined);

    // ── Precio EV de referencia para el segmento ──────────────────────────────
    const precioEVReferencial = precioEVRefPorCarroceria(tipo.carroceria);

    // ── Ahorro mensual operacional usando calcularTCO ─────────────────────────
    // Construimos un DiagnosticoData equivalente para el tipo
    const diagData: DiagnosticoData = {
      kmDia: tipo.kmDia,
      rendimientoKmL: tipo.rendimientoKmL,
      mantencionAnual: tipo.mantencionAnual,
      region: 'Metropolitana de Santiago',
      usoPrincipal: 'cotidiano',
    };
    const tco = calcularTCO(diagData);
    const ahorroMensualPorVehiculo = tco.ahorroOperacionalMes;
    const ahorroMensualTotal = ahorroMensualPorVehiculo * tipo.cantidad;

    // ── Reventa del vehículo a combustión (lineal con piso) ───────────────────
    const reventaPorVehiculo = Math.max(
      PISO_REVENTA,
      REVENTA_BASE_NUEVA - tipo.antiguedadAnios * DEPRECIACION_ANUAL,
    );

    // ── Inversión neta por vehículo ───────────────────────────────────────────
    const inversionNetaPorVehiculo = precioEVReferencial - reventaPorVehiculo;

    // ── Payback ───────────────────────────────────────────────────────────────
    const paybackBase =
      ahorroMensualPorVehiculo > 0
        ? inversionNetaPorVehiculo / (ahorroMensualPorVehiculo * 12)
        : 99;
    const ajusteAntiguedad =
      Math.max(0, tipo.antiguedadAnios - EDAD_REFERENCIA) * BONO_POR_ANIO_EXTRA_EDAD;
    const paybackAjustado = Math.max(0, paybackBase - ajusteAntiguedad);

    // ── CO2 evitado ───────────────────────────────────────────────────────────
    const emisionCombustionAnual =
      (tipo.kmDia * 365) / tipo.rendimientoKmL * FACTOR_EMISION_BENCINA;
    const emisionElectricaAnual =
      (tipo.kmDia * 365) / CONSUMO_EV_KM_KWH * FACTOR_EMISION_RED_ELECTRICA;
    const co2EvitadoPorVehiculo = Math.max(0, emisionCombustionAnual - emisionElectricaAnual);
    const co2EvitadoTotal = co2EvitadoPorVehiculo * tipo.cantidad;

    return {
      tipo,
      ahorroMensualPorVehiculo,
      ahorroMensualTotal,
      reventaPorVehiculo,
      inversionNetaPorVehiculo,
      paybackBase,
      ajusteAntiguedad,
      paybackAjustado,
      co2EvitadoPorVehiculo,
      co2EvitadoTotal,
      razonRanking: '', // se asigna después de ordenar
      modelosRecomendados,
    };
  });

  // ── Ordenar por paybackAjustado ascendente ────────────────────────────────
  tipos.sort((a, b) => a.paybackAjustado - b.paybackAjustado);

  // ── Asignar razón del ranking ─────────────────────────────────────────────
  const n = tipos.length;
  tipos.forEach((dt, i) => {
    const esUltimo = i >= Math.floor(n * 0.6) && n > 1; // último 40% del ranking
    if (!esUltimo && dt.ajusteAntiguedad > 0.5) {
      dt.razonRanking = `Recambio prioritario por antigüedad (${dt.tipo.antiguedadAnios} años) y uso (${dt.tipo.kmDia} km/día)`;
    } else if (!esUltimo && dt.tipo.kmDia > 100) {
      dt.razonRanking = `Recambio prioritario por uso intensivo (${dt.tipo.kmDia} km/día)`;
    } else if (esUltimo) {
      dt.razonRanking = 'Recambio secundario; payback más largo para esta flota';
    } else {
      dt.razonRanking = `Payback estimado: ${dt.paybackAjustado.toFixed(1)} años`;
    }
  });

  // ── Totales agregados ─────────────────────────────────────────────────────
  const ahorroMensualAgregado = tipos.reduce((s, dt) => s + dt.ahorroMensualTotal, 0);
  const ahorroA5AniosAgregado = ahorroMensualAgregado * 60;
  const co2EvitadoAnualAgregado = tipos.reduce((s, dt) => s + dt.co2EvitadoTotal, 0);
  const inversionNetaAgregada = tipos.reduce(
    (s, dt) => s + dt.inversionNetaPorVehiculo * dt.tipo.cantidad,
    0,
  );

  return {
    tipos,
    ahorroMensualAgregado,
    ahorroA5AniosAgregado,
    co2EvitadoAnualAgregado,
    inversionNetaAgregada,
  };
}

/**
 * Genera las series de costos acumulados para el gráfico TCO de la flota completa.
 * Eléctrico parte en inversionNetaAgregada (suma de inversiones netas × cantidad).
 */
export function generarSeriesFlota(
  flota: TipoVehiculo[],
  inversionNetaAgregada: number,
  totalMeses = 84,
): {
  serieCombustion: { mes: number; costo: number }[];
  serieElectrico: { mes: number; costo: number }[];
  puntoEquilibrioMes: number | null;
} {
  // Costo operacional mensual agregado de combustión
  const costoOpCombustionMes = flota.reduce((s, tipo) => {
    const kmMes = tipo.kmDia * DIAS_POR_MES;
    const combustible = (kmMes / tipo.rendimientoKmL) * PRECIO_BENCINA;
    const mantencion = tipo.mantencionAnual / 12;
    return s + (combustible + mantencion) * tipo.cantidad;
  }, 0);

  // Costo operacional mensual agregado del EV
  const costoOpEVMes = flota.reduce((s, tipo) => {
    const kmMes = tipo.kmDia * DIAS_POR_MES;
    const kWhMes = kmMes / CONSUMO_EV_KM_KWH;
    // Simplificado: asumimos carga domiciliaria completa para el TCO global
    const energia = kWhMes * PRECIO_ELECTRICIDAD_CASA;
    return s + (energia + MANTENCION_EV_MENSUAL) * tipo.cantidad;
  }, 0);

  const ahorroPorMes = costoOpCombustionMes - costoOpEVMes;

  // Punto de equilibrio: mes en que la serie EV cruza la de combustión
  const mesCruce =
    ahorroPorMes > 0
      ? Math.ceil(inversionNetaAgregada / ahorroPorMes)
      : null;

  const mesesReales = Math.min(
    120,
    Math.max(totalMeses, mesCruce !== null ? mesCruce + 12 : totalMeses),
  );

  const serieCombustion: { mes: number; costo: number }[] = [{ mes: 0, costo: 0 }];
  const serieElectrico: { mes: number; costo: number }[] = [
    { mes: 0, costo: inversionNetaAgregada },
  ];

  for (let mes = 1; mes <= mesesReales; mes++) {
    serieCombustion.push({ mes, costo: costoOpCombustionMes * mes });
    serieElectrico.push({ mes, costo: inversionNetaAgregada + costoOpEVMes * mes });
  }

  return { serieCombustion, serieElectrico, puntoEquilibrioMes: mesCruce };
}

// Re-exportar para uso en PymeDiagnostico sin imports extras
export {
  CONSUMO_EV_KM_KWH,
  PRECIO_ELECTRICIDAD_CASA,
  PRECIO_ELECTRICIDAD_PUBLICA,
};
