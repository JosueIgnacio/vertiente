import type { TipoVehiculo, SeleccionTipo, DatosSitio, PlanInfraestructura, PlanTipo } from '../types';
import { calcularRangoInstalacion } from './instalacion';
import {
  POTENCIA_AC_ESTANDAR_PYME,
  CAPACIDAD_DIARIA_UTIL_DC,
  COSTO_CARGADOR_DC_INSTALADO,
  FACTOR_UTILIZACION_AC,
  COSTO_INCREMENTAL_CARGADOR_AC,
  UMBRAL_KM_CARGA_PUBLICA,
  COSTO_CARGADOR_ESTANDAR,
} from '../data/mockDefaults';

/**
 * Dimensiona la infraestructura de carga para la flota seleccionada y el sitio indicado.
 *
 * Supuesto de serialización: los vehículos se turnan en el/los cargadores durante
 * la ventana disponible (24 - horasOperacion). Cuando la ventana es amplia (ej. 18 h
 * para vehículos que operan 6 h), un solo cargador puede atender varios vehículos de
 * forma consecutiva. Cuando la ventana es muy corta, el cálculo de ceil arroja más
 * cargadores en paralelo automáticamente.
 */
export function dimensionarInfraestructura(
  seleccion: SeleccionTipo[],
  flota: TipoVehiculo[],
  sitio: DatosSitio,
): PlanInfraestructura {
  const distribucionPorTipo: PlanTipo[] = [];
  let cargadoresACTotales = 0;
  let advertenciaSinDCPeroIntensivo = false;
  let mensajeDCSinNecesidad = false;

  // ── Por cada tipo seleccionado con recambio > 0 ────────────────────────────
  const tiposActivos = seleccion.filter((s) => s.cantidadRecambio > 0);

  for (const sel of tiposActivos) {
    const tipo = flota.find((t) => t.id === sel.tipoId);
    if (!tipo) continue;

    const N = sel.cantidadRecambio;
    const kWhPorVehiculoDia = tipo.kmDia / 5; // consumo estándar 5 km/kWh
    const ventana = 24 - tipo.horasOperacion; // horas disponibles para cargar

    // Horas que necesita 1 vehículo para cargarse completamente
    const horasCargaPorVehiculo = kWhPorVehiculoDia / POTENCIA_AC_ESTANDAR_PYME;

    // Cuántos vehículos puede atender 1 cargador en la ventana (serializados)
    const vehiculosPorCargador =
      horasCargaPorVehiculo > 0
        ? Math.floor((ventana * FACTOR_UTILIZACION_AC) / horasCargaPorVehiculo)
        : 0;

    // Cargadores AC necesarios para este tipo
    const cargadoresACTipo = Math.ceil(N / Math.max(1, vehiculosPorCargador));
    cargadoresACTotales += cargadoresACTipo;

    // Explicación legible
    const ventanaStr = ventana.toFixed(0);
    const explicacion =
      vehiculosPorCargador >= 2
        ? `${N} ${tipo.etiqueta || 'vehículos'} operan ${tipo.horasOperacion} h/día → 1 cargador AC puede rotar ${vehiculosPorCargador} vehículos en las ${ventanaStr} h de ventana`
        : vehiculosPorCargador === 1
        ? `${N} ${tipo.etiqueta || 'vehículos'} operan ${tipo.horasOperacion} h/día → cada cargador atiende 1 vehículo por ventana (${ventanaStr} h)`
        : `Ventana de carga corta (${ventanaStr} h) → se requieren ${cargadoresACTipo} cargadores en paralelo`;

    distribucionPorTipo.push({
      tipoId: sel.tipoId,
      cargadoresAC: cargadoresACTipo,
      usaDC: false,
      explicacion,
    });

    // Advertencia sin DC si hay tipos intensivos pero el usuario no lo solicitó
    if (!sitio.quiereCargaRapida && tipo.kmDia > UMBRAL_KM_CARGA_PUBLICA) {
      advertenciaSinDCPeroIntensivo = true;
    }
  }

  // ── Dimensionamiento DC (si la empresa lo solicitó) ────────────────────────
  let cargadoresDCTotales = 0;
  let costoDC = 0;

  if (sitio.quiereCargaRapida) {
    const tiposIntensivos = tiposActivos.filter((sel) => {
      const tipo = flota.find((t) => t.id === sel.tipoId);
      return tipo && tipo.kmDia > UMBRAL_KM_CARGA_PUBLICA;
    });

    if (tiposIntensivos.length === 0) {
      // No hay tipos que realmente necesiten DC
      mensajeDCSinNecesidad = true;
    } else {
      const energiaExcedenteDiariaTotal = tiposIntensivos.reduce((sum, sel) => {
        const tipo = flota.find((t) => t.id === sel.tipoId)!;
        const excedente = (tipo.kmDia - UMBRAL_KM_CARGA_PUBLICA) / 5; // kWh/día por vehículo
        return sum + excedente * sel.cantidadRecambio;
      }, 0);

      cargadoresDCTotales = Math.max(
        1,
        Math.ceil(energiaExcedenteDiariaTotal / CAPACIDAD_DIARIA_UTIL_DC),
      );
      costoDC = cargadoresDCTotales * COSTO_CARGADOR_DC_INSTALADO;

      // Marcar qué tipos usan DC
      tiposIntensivos.forEach((sel) => {
        const planTipo = distribucionPorTipo.find((p) => p.tipoId === sel.tipoId);
        if (planTipo) planTipo.usaDC = true;
      });
    }
  }

  // ── Costo AC: sitio compartido + incrementales ─────────────────────────────
  // El trabajo de sitio (acometida, canalización, empalme) se paga una sola vez.
  // Cada cargador adicional más allá del primero tiene un costo incremental menor.
  const { min: costoSitioBase } = calcularRangoInstalacion(
    sitio.distAcometida,
    sitio.distInterna,
    sitio.canalizacion,
    sitio.empalme,
  );

  // Costo base: instalación del primer cargador (incluye trabajo de sitio)
  // + COSTO_CARGADOR_ESTANDAR × (totalAC - 1) para los adicionales
  // + COSTO_INCREMENTAL por cada punto adicional más allá del hardware estándar
  const cargadoresACExtra = Math.max(0, cargadoresACTotales - 1);
  const costoAC =
    costoSitioBase +
    cargadoresACExtra * COSTO_CARGADOR_ESTANDAR +
    cargadoresACExtra * COSTO_INCREMENTAL_CARGADOR_AC;

  const costoTotal = costoAC + costoDC;

  return {
    cargadoresACTotales,
    cargadoresDCTotales,
    costoAC,
    costoDC,
    costoTotal,
    distribucionPorTipo,
    advertenciaSinDCPeroIntensivo,
    mensajeDCSinNecesidad,
  };
}
