import { useState } from "react";
import { CATALOG, type Category } from "../data/catalog";
import ProductCard from "./ProductCard";

const TABS: { id: Category | "todos"; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "cakes", label: "Cakes" },
  { id: "pupcakes", label: "Pupcakes" },
  { id: "treats", label: "Treats" },
  { id: "decor", label: "Decoración" },
  { id: "gatos", label: "Gatos" },
];

export default function Catalog() {
  const [tab, setTab] = useState<Category | "todos">("todos");
  const items = tab === "todos" ? CATALOG : CATALOG.filter((p) => p.category === tab);

  return (
    <section id="catalogo" className="bg-olive-50 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-blush-500">Catálogo</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-olive-800 sm:text-4xl">
            Cotiza y arma tu pedido
          </h2>
          <p className="mt-3 text-olive-600">
            Agrega los productos que quieras al carrito y envíanos tu pedido directo por WhatsApp.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                tab === t.id ? "bg-olive-500 text-white shadow-soft" : "bg-white text-olive-600 ring-1 ring-olive-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
