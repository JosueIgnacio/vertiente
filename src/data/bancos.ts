import type { Banco } from '../types';

/** Bancos mock con líneas verdes para electromovilidad empresarial */
export const BANCOS: Banco[] = [
  {
    id: 'bancoestado',
    nombre: 'BancoEstado',
    linea: 'Crédito Verde Electromovilidad',
    tasaMensual: 0.0089,
    plazoMaxMeses: 60,
    casilla: 'leads.electromovilidad@bancoestado.cl',
  },
  {
    id: 'santander',
    nombre: 'Santander',
    linea: 'Línea Verde Empresas',
    tasaMensual: 0.0095,
    plazoMaxMeses: 60,
    casilla: 'lineaverde.empresas@santander.cl',
  },
  {
    id: 'bci',
    nombre: 'BCI',
    linea: 'Línea Verde Empresas',
    tasaMensual: 0.0099,
    plazoMaxMeses: 48,
    casilla: 'lineaverde@bci.cl',
  },
];
