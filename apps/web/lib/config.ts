/** Configuración de la tienda. */
// Número de WhatsApp de iTech (formato internacional sin "+").
// Valor por defecto; el real se administra desde el panel (tabla settings).
export const WHATSAPP_NUMBER = "51916854842";
export const STORE_NAME = "iTech Import Perú";

export const PAYMENT_METHODS = [
  { value: "whatsapp", label: "Coordinar por WhatsApp" },
  { value: "yape", label: "Yape" },
  { value: "plin", label: "Plin" },
  { value: "transferencia", label: "Transferencia bancaria" },
  { value: "contra_entrega", label: "Pago contra entrega" },
] as const;
