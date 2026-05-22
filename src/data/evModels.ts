import type { EVModel } from '../types';

// Modelos referenciales — precios y consumos aproximados, a calibrar
export const EV_MODELS: EVModel[] = [
  {
    id: 'byd-dolphin',
    nombre: 'BYD Dolphin',
    precio: 19_990_000,
    consumoKmKwh: 6.8,
    descripcion: 'Citadino compacto, ideal para uso diario urbano',
  },
  {
    id: 'ora-03',
    nombre: 'ORA 03',
    precio: 17_990_000,
    consumoKmKwh: 6.5,
    descripcion: 'Opción accesible con buena autonomía urbana',
  },
  {
    id: 'mg-4',
    nombre: 'MG 4',
    precio: 22_490_000,
    consumoKmKwh: 7.0,
    descripcion: 'Hatchback eléctrico con mayor autonomía',
  },
  {
    id: 'byd-atto3',
    nombre: 'BYD Atto 3',
    precio: 27_990_000,
    consumoKmKwh: 6.2,
    descripcion: 'SUV compacto, versátil para ciudad y carretera',
  },
];
