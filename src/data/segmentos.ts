import type { Carroceria } from '../types';

/**
 * Mapeo carrocería → IDs de modelos disponibles.
 * Sedán no tiene oferta mock; el dashboard muestra un mensaje especial.
 */
export const SEGMENTOS: Record<Carroceria, string[]> = {
  citycar:  ['byd-dolphin-mini', 'geely-ex2-pro'],
  hatchback:['byd-dolphin-mini', 'nammi-001', 'mg4'],
  sedan:    [], // sin oferta mock → mensaje "consulta directamente a un proveedor"
  suv:      ['byd-atto3', 'hyundai-ioniq5'],
  pickup:   ['maxus-t90'],
  furgon:   ['maxus-edelivery3'],
};

/** Precio referencial por carrocería (usa el primer modelo del segmento o default 20M) */
export function precioEVRefPorCarroceria(carroceria: Carroceria): number {
  const precios: Record<Carroceria, number> = {
    citycar:  15_990_000,
    hatchback:19_490_000,
    sedan:    20_000_000,
    suv:      30_000_000,
    pickup:   33_500_000,
    furgon:   32_000_000,
  };
  return precios[carroceria];
}
