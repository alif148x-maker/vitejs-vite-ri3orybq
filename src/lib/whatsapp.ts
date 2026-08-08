import { WHATSAPP_NUMBER } from "../data/config";
import type { CartLine } from "../context/CartContext";

export interface OrderDetails {
  customerName: string;
  petName: string;
  date: string;
  comment: string;
}

export function buildWhatsAppMessage(lines: CartLine[], subtotal: number, details: OrderDetails) {
  const rows = lines.map((l) => {
    const detail = l.detail ? ` (${l.detail})` : "";
    return `• ${l.qty}x ${l.name}${detail} — $${(l.unitPrice * l.qty).toFixed(2)}`;
  });

  const parts = [
    "¡Hola Barki! 🐾 Quiero hacer un pedido:",
    "",
    ...rows,
    "",
    `*Subtotal: $${subtotal.toFixed(2)}*`,
    "_(el delivery se calcula según la zona)_",
    "",
    "*Datos del pedido:*",
    `Nombre: ${details.customerName || "-"}`,
    `Mascota: ${details.petName || "-"}`,
    `Fecha deseada: ${details.date || "-"}`,
  ];

  if (details.comment) {
    parts.push(`Comentarios: ${details.comment}`);
  }

  return parts.join("\n");
}

export function buildWhatsAppUrl(message: string, phone: string = WHATSAPP_NUMBER) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
