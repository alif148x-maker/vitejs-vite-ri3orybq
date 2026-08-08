import { CheckCircle2, Clock } from "lucide-react";
import { ORDER_STEPS } from "../data/catalog";

export default function HowToOrder() {
  return (
    <section id="pedir" className="bg-olive-50 py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-blush-500">¿Cómo pedir?</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-olive-800 sm:text-4xl">
            Así de fácil es armar la fiesta de tu peludito
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {ORDER_STEPS.map((s) => (
            <div key={s.step} className="relative rounded-3xl bg-white p-6 shadow-soft ring-1 ring-olive-200/60">
              <span className="font-display text-4xl font-extrabold text-blush-200">0{s.step}</span>
              <h3 className="mt-2 font-display text-lg font-bold text-olive-800">{s.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-olive-600">
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-olive-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 flex w-fit items-center gap-3 rounded-full bg-blush-100 px-5 py-3 text-sm font-bold text-blush-500">
          <Clock size={18} />
          Pedidos con 4 días de anticipación
        </div>
      </div>
    </section>
  );
}
