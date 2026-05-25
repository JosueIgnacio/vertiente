import type { DiagnosticoData, TCOResult, MixCarga } from '../types';
import {
  PRECIO_BENCINA,
  PRECIO_ELECTRICIDAD_CASA,
  PRECIO_ELECTRICIDAD_PUBLICA,
  PRECIO_EV_ESTANDAR,
  CONSUMO_EV_KM_KWH,
  REVENTA_COMBUSTION,
  MANTENCION_EV_MENSUAL,
  DIAS_POR_MES,
} from '../data/mockDefaults';

/**
 * Determina el mix de carga automáticamente según los km/día.
 * El usuario no elige; se asigna según su perfil de uso.
 */
export function calcularMixCarga(kmDia: number): MixCarga {
  let pctCasa: number;
  let pctPublica: number;

  if (kmDia < 100) {
    pctCasa = 1.0;
    pctPublica = 0.0;
  } else if (kmDia < 200) {
    pctCasa = 0.7;
    pctPublica = 0.3;
  } else {
    pctCasa = 0.5;
    pctPublica = 0.5;
  }

  const precioKwhEfectivo =
    pctCasa * PRECIO_ELECTRICIDAD_CASA + pctPublica * PRECIO_ELECTRICIDAD_PUBLICA;

  return { pctCasa, pctPublica, precioKwhEfectivo };
}

/**
 * Función pura de cálculo TCO para el diagnóstico de persona natural.
 * No emite veredictos ni semáforos: solo calcula y devuelve los números.
 */
export function calcularTCO(data: DiagnosticoData): TCOResult {
  const { kmDia, rendimientoKmL, mantencionAnual } = data;

  // ── Kilómetros mensuales ────────────────────────────────────────────────────
  const kmMes = kmDia * DIAS_POR_MES;

  // ── Costos combustión ────────────────────────────────────────────────────────
  const costoCombustibleMes = (kmMes / rendimientoKmL) * PRECIO_BENCINA;
  const mantencionCombustionMes = mantencionAnual / 12;

  // ── Mix y costo energía EV ──────────────────────────────────────────────────
  const mixCarga = calcularMixCarga(kmDia);
  const costoEnergiaEVMes = (kmMes / CONSUMO_EV_KM_KWH) * mixCarga.precioKwhEfectivo;

  // ── Ahorro operacional ──────────────────────────────────────────────────────
  const ahorroOperacionalMes =
    (costoCombustibleMes + mantencionCombustionMes) -
    (costoEnergiaEVMes + MANTENCION_EV_MENSUAL);

  const ahorroA5Anios = ahorroOperacionalMes * 60; // 60 meses

  // ── Inversión neta ──────────────────────────────────────────────────────────
  // Se descuenta la reventa del auto a combustión actual
  const inversionNetaEV = PRECIO_EV_ESTANDAR - REVENTA_COMBUSTION; // $12.000.000

  // ── Punto de equilibrio ─────────────────────────────────────────────────────
  const ahorroAnual = ahorroOperacionalMes * 12;
  const puntoEquilibrioAnios =
    ahorroAnual > 0 ? inversionNetaEV / ahorroAnual : 99;

  // ── Series para el gráfico ───────────────────────────────────────────────
  // Combustión: parte en $0 (el usuario ya tiene el auto) + costos operacionales
  // Eléctrico:  parte en inversionNetaEV + costos operacionales acumulados
  //
  // Las series incluyen mes 0 (puntos de partida visuales) y se extienden
  // dinámicamente para que el cruce siempre quede visible:
  //   totalMeses = max(60, mesCruce + 12), cap 120 meses (10 años)

  const costoOpCombustionMes = costoCombustibleMes + mantencionCombustionMes;
  const costoOpEVMes = costoEnergiaEVMes + MANTENCION_EV_MENSUAL;

  // Mes exacto del cruce calculado algebraicamente
  const mesesHastaCruce =
    ahorroOperacionalMes > 0
      ? Math.ceil(inversionNetaEV / ahorroOperacionalMes)
      : null;

  const totalMeses = Math.min(
    120,
    Math.max(60, mesesHastaCruce !== null ? mesesHastaCruce + 12 : 60)
  );

  // Mes 0: combustión en $0, eléctrico en inversionNetaEV (puntos de partida)
  const serieCombustion: { mes: number; costo: number }[] = [{ mes: 0, costo: 0 }];
  const serieElectrico:  { mes: number; costo: number }[] = [{ mes: 0, costo: inversionNetaEV }];

  for (let mes = 1; mes <= totalMeses; mes++) {
    serieCombustion.push({ mes, costo: costoOpCombustionMes * mes });
    serieElectrico.push({ mes, costo: inversionNetaEV + costoOpEVMes * mes });
  }

  return {
    kmMes,
    costoCombustibleMes,
    mantencionCombustionMes,
    costoEnergiaEVMes,
    ahorroOperacionalMes,
    ahorroA5Anios,
    inversionNetaEV,
    puntoEquilibrioAnios,
    mixCarga,
    serieCombustion,
    serieElectrico,
    totalMeses,
  };
}
