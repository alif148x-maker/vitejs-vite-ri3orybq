import { Heart } from "lucide-react";
import { PROMO } from "../data/catalog";
import ProductCard from "./ProductCard";

export default function Promo() {
  return (
    <section id="promo" className="bg-blush-50 py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blush-500">
            <Heart size={14} className="fill-blush-400 text-blush-400" /> Oferta por tiempo limitado
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-olive-800 sm:text-4xl">Promo del mes</h2>
        </div>

        <div className="mt-8 mx-auto max-w-md">
          <ProductCard product={PROMO} wide />
        </div>
      </div>
    </section>
  );
}
