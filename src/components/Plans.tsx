import { PLANS } from "../data/catalog";
import ProductCard from "./ProductCard";

export default function Plans() {
  return (
    <section id="planes" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-blush-500">Planes de cumpleaños</span>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-olive-800 sm:text-4xl">
          Elige el plan perfecto para su fiesta
        </h2>
        <p className="mt-3 text-olive-600">
          Todos nuestros planes incluyen cake, toppers, banderines, gorrito personalizado y delivery incluido.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
