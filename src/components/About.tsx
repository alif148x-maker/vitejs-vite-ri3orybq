import { Wheat, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { CAKE_COLORS, FLAVORS } from "../data/catalog";

const FEATURES = [
  {
    icon: Wheat,
    title: "Harina de avena",
    text: "Nuestra receta base es libre de gluten, soya y azúcar.",
  },
  {
    icon: ShieldCheck,
    title: "Libre de res y pollo",
    text: "Ideal para peluditos con sensibilidades alimentarias.",
  },
  {
    icon: Heart,
    title: "Colores 100% naturales",
    text: "Remolacha, arándano, zanahoria, camote y espirulina.",
  },
  {
    icon: Sparkles,
    title: "Todo personalizado",
    text: "Cakes, toppers, banderines y gorritos a tu gusto.",
  },
];

export default function About() {
  return (
    <section id="nosotros" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-blush-500">Sobre nosotros</span>
        <h2 className="mt-2 font-display text-3xl font-extrabold text-olive-800 sm:text-4xl">
          Un emprendimiento panameño hecho con las patitas y el corazón
        </h2>
        <p className="mt-4 text-olive-600">
          Barki nació del amor por los peluditos: hacemos repostería artesanal para perros y gatos, pensada para que
          cada cumpleaños, aniversario o celebración especial tenga un cake tan rico como seguro para comer. Cada
          pedido se prepara a mano y se personaliza según el nombre, la edad y los colores favoritos de tu mascota.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-3xl bg-white p-5 text-center shadow-soft ring-1 ring-olive-200/60">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-olive-100 text-olive-600">
              <Icon size={22} />
            </div>
            <h3 className="mt-3 font-display text-sm font-bold text-olive-800">{title}</h3>
            <p className="mt-1 text-xs text-olive-500">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-6 rounded-[2rem] bg-olive-500 p-6 text-white shadow-soft sm:p-10 md:grid-cols-2">
        <div>
          <h3 className="font-display text-xl font-bold">Sabores</h3>
          <ul className="mt-3 space-y-2 text-sm text-olive-100">
            {FLAVORS.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blush-300" /> {f}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-olive-200">
            Nuestra receta sí contiene huevo y lácteos (yogur griego y queso crema). Si tu peludito es sensible o
            alérgico, con gusto preparamos una opción alternativa para él.
          </p>
        </div>
        <div>
          <h3 className="font-display text-xl font-bold">Colores para el cake</h3>
          <p className="mt-1 text-xs text-olive-200">Elige 1 o 2 colores — 100% naturales</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {CAKE_COLORS.map((c) => (
              <div key={c.name} className="flex items-center gap-2 rounded-full bg-white/10 py-1.5 pl-1.5 pr-3">
                <span className="h-6 w-6 rounded-full border-2 border-white/70" style={{ backgroundColor: c.hex }} />
                <span className="text-xs font-semibold">{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
