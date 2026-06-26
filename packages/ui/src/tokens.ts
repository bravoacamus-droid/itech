/**
 * Tokens de marca iTech: blanco dominante + juego de celestes.
 * El oscuro no es color de marca, solo neutro de UI/texto.
 */
export const brand = {
  50: "#F0F9FF",
  100: "#E0F2FE",
  200: "#BAE6FD",
  300: "#7BDEFF", // celeste claro (corazón de la marca)
  400: "#38BDF8",
  500: "#0080FF", // azul primario / eléctrico
  600: "#0057AD", // azul profundo (hover / activo)
  700: "#004A94",
  800: "#003B75",
  900: "#00264D",
} as const;

export const ink = {
  DEFAULT: "#212529",
  soft: "#4D5B7C", // slate
  muted: "#6C757D",
};

export const surface = {
  white: "#FFFFFF",
  subtle: "#F9FAFE",
  border: "#DEE2E6",
};

export const semantic = {
  success: "#28A745",
  danger: "#DC3545",
  warning: "#FFC107",
};
