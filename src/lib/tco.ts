import type { DiagnosticoData, TCOResult, InfoCarga } from '../types';
import {
  PRECIO_BENCINA,
  PRECIO_ELECTRICIDAD_CASA,
  PRECIO_ELECTRICIDAD_PUBLICA,
  PRECIO_EV_ESTANDAR,
  CONSUMO_EV_KM_KWH,
  REVENTA_COMBUSTION,
  MANTENCION_EV_MENSUAL,
  DIAS_POR_MES,
  POTENCIA_CARGADOR_VIAJE,
  POTENCIA_CARGADOR_DOMICILIARIO,
  COSTO_CARGADOR_ESTANDAR,
  UMBRAL_KM_SOLO_VIAJE,
  UMBRAL_KM_CARGA_PUBLICA,
} from '../data/mockDefaults';

/**
 * Determina el tramo de carga e información asociada según km/día.
 * Lógica física alineada con SEC y Estudio de Costos AgenciaSE 2026:
 *   ≤ 70 km/día  → viaje (enchufe 2,3 kW, sin instalación especial)
 *   71–200 km/día → domiciliario (cargador 7,4 kW, costo $1.900.000)
 *   > 200 km/día  → mixto (7,4 kW en casa + excedente en red pública)
 */
export function calcularInfoCarga(kmDia: number): InfoCarga {
  if (kmDia <= UMBRAL_KM_SOLO_VIAJE) {
    const kmMes = kmDia * DIAS_POR_MES;
    return {
      tramo: 'viaje',
      potenciaCargador: POTENCIA_CARGADOR_VIAJE,
      costoInstalacion: 0,
      energiaDomiciliariaKwMes: kmMes / CONSUMO_EV_KM_KWH,
      energiaPublicaKwMes: 0,
    };
  } else if (kmDia <= UMBRAL_KM_CARGA_PUBLICA) {
    const kmMes = kmDia * DIAS_POR_MES;
    return {
      tramo: 'domiciliario',
      potenciaCargador: POTENCIA_CARGADOR_DOMICILIARIO,
      costoInstalacion: COSTO_CARGADOR_ESTANDAR,
      energiaDomiciliariaKwMes: kmMes / CONSUMO_EV_KM_KWH,
      energiaPublicaKwMes: 0,
    };
  } else {
    // Primeros 200 km/día en casa, excedente en red pública
    const kmHomeMes    = UMBRAL_KM_CARGA_PUBLICA * DIAS_POR_MES;
    const kmPublicoMes = (kmDia - UMBRAL_KM_CARGA_PUBLICA) * DIAS_POR_MES;
    return {
      tramo: 'mixto',
      potenciaCargador: POTENCIA_CARGADOR_DOMICILIARIO,
      costoInstalacion: COSTO_CARGADOR_ESTANDAR,
      energiaDomiciliariaKwMes: kmHomeMes / CONSUMO_EV_KM_KWH,
      energiaPublicaKwMes: kmPublicoMes / CONSUMO_EV_KM_KWH,
    };
  }
}

/**
 * Función pura de cálculo TCO para el diagnóstico de persona natural.
 * No emite veredictos ni semáforos: solo calcula y devuelve los números.
 */
export function calcularTCO(data: DiagnosticoData): TCOResult {
  const { kmDia, rendimientoKmL, mantencionAnual } = data;

  // ── Kilómetros mensuales ────────────────────────────────────────────────────
  const kmMes = kmDia * DIAS_POR_MES;

  // ── Costos combustión ───────────────────────────────────────────────────────
  const costoCombustibleMes    = (kmMes / rendimientoKmL) * PRECIO_BENCINA;
  const mantencionCombustionMes = mantencionAnual / 12;

  // ── Infraestructura y costo energía EV ─────────────────────────────────────
  const infoCarga = calcularInfoCarga(kmDia);
  const costoEnergiaEVMes =
    infoCarga.energiaDomiciliariaKwMes * PRECIO_ELECTRICIDAD_CASA +
    infoCarga.energiaPublicaKwMes      * PRECIO_ELECTRICIDAD_PUBLICA;
  const costoInstalacion = infoCarga.costoInstalacion;

  // ── Inversión neta ──────────────────────────────────────────────────────────
  // Se descuenta la reventa del auto a combustión y se suma la instalación
  const inversionNetaEV = PRECIO_EV_ESTANDAR - REVENTA_COMBUSTION + costoInstalacion;

  // ── Ahorro operacional ──────────────────────────────────────────────────────
  const ahorroOperacionalMes =
    (costoCombustibleMes + mantencionCombustionMes) -
    (costoEnergiaEVMes + MANTENCION_EV_MENSUAL);

  const ahorroA5Anios = ahorroOperacionalMes * 60; // 60 meses

  // ── Punto de equilibrio ─────────────────────────────────────────────────────
  const ahorroAnual = ahorroOperacionalMes * 12;
  const puntoEquilibrioAnios =
    ahorroAnual > 0 ? inversionNetaEV / ahorroAnual : 99;

  // ── Series para el gráfico ──────────────────────────────────────────────────
  // Combustión: parte en $0 (el usuario ya tiene el auto) + costos operacionales
  // Eléctrico:  parte en inversionNetaEV + costos operacionales acumulados
  //
  // totalMeses = max(60, mesCruce + 12), cap 120 meses (10 años)

  const costoOpCombustionMes = costoCombustibleMes + mantencionCombustionMes;
  const costoOpEVMes         = costoEnergiaEVMes + MANTENCION_EV_MENSUAL;

  const mesesHastaCruce =
    ahorroOperacionalMes > 0
      ? Math.ceil(inversionNetaEV / ahorroOperacionalMes)
      : null;

  const totalMeses = Math.min(
    120,
    Math.max(60, mesesHastaCruce !== null ? mesesHastaCruce + 12 : 60)
  );

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
    infoCarga,
    costoInstalacion,
    serieCombustion,
    serieElectrico,
    totalMeses,
  };
}

/**
 * Calcula el ahorro mensual operacional para un modelo EV específico.
 * Escala el consumo de energía según el consumo real del modelo (km/kWh),
 * usando el consumo estándar `CONSUMO_EV_KM_KWH` como referencia base.
 */
export function calcularAhorroMensualConModelo(
  data: DiagnosticoData,
  consumoKmKwh: number,
): number {
  const kmMes = data.kmDia * DIAS_POR_MES;
  const costoCombustibleMes     = (kmMes / data.rendimientoKmL) * PRECIO_BENCINA;
  const mantencionCombustionMes = data.mantencionAnual / 12;

  const infoCarga = calcularInfoCarga(data.kmDia);

  // Factor de escala: modelo con menor consumo (más eficiente) gasta menos energía
  const factor = CONSUMO_EV_KM_KWH / consumoKmKwh;

  const costoEnergiaModeloMes =
    infoCarga.energiaDomiciliariaKwMes * factor * PRECIO_ELECTRICIDAD_CASA +
    infoCarga.energiaPublicaKwMes      * factor * PRECIO_ELECTRICIDAD_PUBLICA;

  return (costoCombustibleMes + mantencionCombustionMes) -
         (costoEnergiaModeloMes + MANTENCION_EV_MENSUAL);
}
