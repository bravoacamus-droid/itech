/** Utilidades puras (seguras para cliente y servidor). */
export function money(value: number | string | null | undefined): string {
  return `S/ ${Number(value ?? 0).toFixed(2)}`;
}
