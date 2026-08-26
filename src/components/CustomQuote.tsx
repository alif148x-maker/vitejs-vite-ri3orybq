import { Sparkles } from "lucide-react";
import { CUSTOM_QUOTE } from "../data/catalog";
import ProductCard from "./ProductCard";

export default function CustomQuote() {
  return (
    <section id="cotiza" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blush-500">
          <Sparkles size={14} /> ¿Tienes algo distinto en mente?
        </span>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-olive-800 sm:text-4xl">Cotiza tu cake</h2>
        <p className="mt-3 text-olive-600">
          Si buscas un diseño o forma que no está en el catálogo, cuéntanos tu idea y te armamos una cotización.
        </p>
      </div>

      <div className="mt-8 mx-auto max-w-md">
        <ProductCard product={CUSTOM_QUOTE} />
      </div>
    </section>
  );
}
