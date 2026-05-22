export type TipoUsuario = 'persona' | 'empresa';

export type UsoPrincipal = 'diario' | 'trabajo' | 'reparto' | 'taxi-app' | 'pyme';

export type TipoCarga = 'casa' | 'edificio' | 'empresa' | 'publica';

export type SemaforoEstado = 'conviene' | 'conviene-condiciones' | 'no-conviene';

export interface SimuladorData {
  // Paso 1: Uso
  tipoUsuario: TipoUsuario;
  kmMensuales: number;
  ciudad: string;
  usoPrincipal: UsoPrincipal;

  // Paso 2: Vehículo actual
  gastoMensualCombustible: number;
  rendimientoKmL: number;
  mantencionMensual: number;

  // Paso 3: Alternativa eléctrica
  modeloEVId: string;
  precioEV: number;
  consumoKmKwh: number;
  tipoCarga: TipoCarga;

  // Paso 4: Infraestructura
  tieneEstacionamiento: boolean;
  interesaCargador: boolean;
}

export interface TCOResult {
  costoCombustibleMes: number;
  costoEnergiaEVMes: number;
  ahorroOperacionalMes: number;
  ahorroA5Anios: number;
  inversionIncremental: number;
  puntoEquilibrioAnios: number;
  semaforoEstado: SemaforoEstado;
  serieCombustion: { mes: number; costo: number }[];
  serieElectrico: { mes: number; costo: number }[];
  mensajeDinamico: string;
}

export interface EVModel {
  id: string;
  nombre: string;
  precio: number;
  consumoKmKwh: number;
  descripcion: string;
}
