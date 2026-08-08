import { Truck } from "lucide-react";
import { DELIVERY_FREE_ZONES, DELIVERY_TIERS } from "../data/catalog";

export default function Delivery() {
  return (
    <section id="delivery" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-blush-500">Delivery</span>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-olive-800 sm:text-4xl">Nuestras tarifas</h2>
        <p className="mt-3 text-olive-600">Entregamos en toda la ciudad de Panamá. El costo de delivery se suma al confirmar tu pedido.</p>
      </div>

      <div className="mx-auto mt-8 flex w-fit items-center gap-3 rounded-full bg-olive-500 px-5 py-3 text-sm font-bold text-white shadow-soft">
        <Truck size={18} />
        Delivery gratis: {DELIVERY_FREE_ZONES.join(" y ")}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {DELIVERY_TIERS.map((tier) => (
          <div key={tier.price} className="flex items-start gap-4 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-olive-200/60">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blush-100 font-display text-sm font-extrabold text-blush-500">
              ${tier.price.toFixed(2)}
            </span>
            <p className="text-sm text-olive-600">{tier.zones.join(" · ")}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
