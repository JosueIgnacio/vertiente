/**
 * Formatea un número como pesos chilenos.
 * Ej: 125558 → "$125.558"
 */
export function formatCLP(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-CL');
}

/**
 * Formatea un número como millones de pesos chilenos.
 * Ej: 19990000 → "$19,9M"
 */
export function formatCLPMillon(value: number): string {
  const m = value / 1_000_000;
  return `$${m.toFixed(1).replace('.', ',')}M`;
}

/**
 * Redondea años al decimal más cercano para mostrar.
 * Ej: 3.4 → "3,4 años"
 */
export function formatAnios(value: number): string {
  if (value <= 0) return '< 1 año';
  if (value > 99) return '> 10 años';
  return `${value.toFixed(1).replace('.', ',')} años`;
}
