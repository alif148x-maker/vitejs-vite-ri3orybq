import { Instagram, MessageCircle } from "lucide-react";
import logo from "../assets/logo.jpg";
import { INSTAGRAM_URL, WHATSAPP_NUMBER } from "../data/config";

export default function Footer() {
  return (
    <footer className="bg-olive-800 py-10 text-olive-100">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6">
        <img src={logo} alt="Barki" className="h-14 w-14 rounded-full object-cover" />
        <p className="font-display text-lg font-bold text-white">barki fur pets</p>
        <p className="max-w-md text-sm text-olive-300">
          Repostería artesanal y natural para perros y gatos. Emprendimiento panameño, hecho a mano con amor.
        </p>
        <div className="flex gap-4">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/20"
          >
            <Instagram size={16} /> @barkipty
          </a>
        </div>
        <p className="mt-4 text-xs text-olive-400">© {new Date().getFullYear()} Barki Fur Pets · Panamá</p>
      </div>
    </footer>
  );
}
