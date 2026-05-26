import type { ModeloEV } from '../types';

/** Modelos referenciales — valores aproximados de mercado chileno, a calibrar */
export const MODELOS: ModeloEV[] = [
  {
    id: 'byd-dolphin-mini',
    marca: 'BYD',
    modelo: 'Dolphin Mini',
    carroceria: 'Citycar / Hatchback',
    autonomiaKm: 340,
    consumoKmKwh: 6.5,
    plazas: 5,
  },
  {
    id: 'geely-ex2-pro',
    marca: 'Geely',
    modelo: 'EX2 Pro',
    carroceria: 'Hatchback',
    autonomiaKm: 330,
    consumoKmKwh: 6.0,
    plazas: 5,
  },
  {
    id: 'nammi-001',
    marca: 'Nammi',
    modelo: '001',
    carroceria: 'Hatchback',
    autonomiaKm: 430,
    consumoKmKwh: 6.0,
    plazas: 5,
  },
  {
    id: 'mg4',
    marca: 'MG',
    modelo: 'MG4',
    carroceria: 'Hatchback',
    autonomiaKm: 400,
    consumoKmKwh: 5.5,
    plazas: 5,
  },
  {
    id: 'byd-atto3',
    marca: 'BYD',
    modelo: 'Atto 3',
    carroceria: 'SUV / Crossover',
    autonomiaKm: 420,
    consumoKmKwh: 5.0,
    plazas: 5,
  },
  {
    id: 'hyundai-ioniq5',
    marca: 'Hyundai',
    modelo: 'IONIQ 5',
    carroceria: 'SUV / Crossover',
    autonomiaKm: 480,
    consumoKmKwh: 5.0,
    plazas: 5,
  },
];
