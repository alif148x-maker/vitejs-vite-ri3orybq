import { useState } from "react";
import { Menu, ShoppingBasket, X } from "lucide-react";
import logo from "../assets/logo.jpg";
import { useCart } from "../context/CartContext";

const LINKS = [
  { href: "#promo", label: "Promo" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#planes", label: "Planes" },
  { href: "#catalogo", label: "Catálogo" },
  { href: "#pedir", label: "Cómo pedir" },
  { href: "#delivery", label: "Delivery" },
];

export default function Header() {
  const { count, open } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-olive-200/70 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <img src={logo} alt="Barki" className="h-11 w-11 rounded-full object-cover shadow-soft" />
          <span className="font-display text-xl font-bold text-olive-800">
            barki <span className="text-blush-400">fur pets</span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-semibold text-olive-600 transition hover:text-blush-500">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={open}
            className="relative flex items-center gap-2 rounded-full bg-olive-500 px-4 py-2 text-sm font-bold text-white shadow-soft transition hover:bg-olive-600"
          >
            <ShoppingBasket size={18} />
            <span className="hidden sm:inline">Mi pedido</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blush-400 text-xs font-bold text-white">
                {count}
              </span>
            )}
          </button>
          <button
            className="rounded-full border border-olive-200 p-2 text-olive-600 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-olive-200/70 bg-cream px-4 pb-4 pt-2 md:hidden">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-lg px-2 py-2 text-sm font-semibold text-olive-700 hover:bg-olive-100"
            >
              {l.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
