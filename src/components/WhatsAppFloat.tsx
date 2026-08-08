import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "../data/config";

export default function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("¡Hola Barki! 🐾 Tengo una pregunta.")}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:scale-105 hover:bg-green-600"
      aria-label="Escríbenos por WhatsApp"
    >
      <MessageCircle size={26} />
    </a>
  );
}
