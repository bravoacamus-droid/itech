/** Configuración de la tienda. */
// Número de WhatsApp de iTech (formato internacional sin "+"). CAMBIAR por el real.
export const WHATSAPP_NUMBER = "51999999999";
export const STORE_NAME = "iTech Import Perú";

export const PAYMENT_METHODS = [
  { value: "whatsapp", label: "Coordinar por WhatsApp" },
  { value: "yape", label: "Yape" },
  { value: "plin", label: "Plin" },
  { value: "transferencia", label: "Transferencia bancaria" },
  { value: "contra_entrega", label: "Pago contra entrega" },
] as const;
