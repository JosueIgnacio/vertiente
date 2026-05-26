import type { Proveedor } from '../types';

/** Proveedores de demostración — datos ficticios para el demo */
export const PROVEEDORES: Proveedor[] = [
  {
    id: 'andes',
    nombre: 'Electromovilidad Andes',
    telefono: '+56 2 2345 6789',
    correo: 'ventas@emandes.cl',
    leadCasilla: 'Solicitud de información VE — evmarket',
  },
  {
    id: 'evstore',
    nombre: 'EV Store Chile',
    telefono: '+56 2 2876 5432',
    correo: 'contacto@evstore.cl',
    leadCasilla: 'Lead evmarket — Interés en modelo eléctrico',
  },
  {
    id: 'verde',
    nombre: 'Verde Motors',
    telefono: '+56 9 8765 4321',
    correo: 'info@verdemotors.cl',
    leadCasilla: 'Cotización VE — evmarket referido',
  },
];
