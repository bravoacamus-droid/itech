/** Utilidades puras (seguras para cliente y servidor). */
export function formatPrice(value: number, currency = "PEN"): string {
  const symbol = currency === "PEN" ? "S/" : currency + " ";
  return `${symbol} ${value.toFixed(2)}`;
}
