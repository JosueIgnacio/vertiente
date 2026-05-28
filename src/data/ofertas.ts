import type { Oferta } from '../types';

/** Ofertas de demostración — 7 combinaciones modelo × proveedor */
export const OFERTAS: Oferta[] = [
  { id: 'andes-dolphin',  modeloId: 'byd-dolphin-mini',   proveedorId: 'andes',   precio: 15_990_000 },
  { id: 'andes-mg4',      modeloId: 'mg4',                 proveedorId: 'andes',   precio: 24_000_000 },
  { id: 'ev-nammi',       modeloId: 'nammi-001',           proveedorId: 'evstore', precio: 19_490_000 },
  { id: 'ev-mg4',         modeloId: 'mg4',                 proveedorId: 'evstore', precio: 23_490_000 },
  { id: 'ev-ioniq5',      modeloId: 'hyundai-ioniq5',      proveedorId: 'evstore', precio: 39_990_000 },
  { id: 'verde-geely',    modeloId: 'geely-ex2-pro',       proveedorId: 'verde',   precio: 16_990_000 },
  { id: 'verde-atto3',    modeloId: 'byd-atto3',           proveedorId: 'verde',   precio: 30_000_000 },
  // ── Segmentos pyme ──────────────────────────────────────────────────────────
  { id: 'verde-t90',      modeloId: 'maxus-t90',           proveedorId: 'verde',   precio: 33_500_000 },
  { id: 'verde-edelivery',modeloId: 'maxus-edelivery3',    proveedorId: 'verde',   precio: 32_000_000 },
];
