import { Instagram, MessageCircle, PawPrint } from "lucide-react";
import dogCake from "../assets/hero-dog-cake.jpg";
import { INSTAGRAM_URL, WHATSAPP_NUMBER } from "../data/config";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden paw-bg">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
        <div className="relative z-10 flex flex-col gap-5 text-center md:text-left">
          <span className="mx-auto inline-flex w-fit items-center gap-2 rounded-full bg-blush-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blush-500 md:mx-0">
            <PawPrint size={14} /> Repostería artesanal para mascotas · Panamá
          </span>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-olive-800 sm:text-5xl">
            Celebra a tu peludito con un cake hecho con <span className="text-blush-400">amor</span>
          </h1>
          <p className="text-lg text-olive-600">
            En Barki creamos cakes, pupcakes, treats y decoraciones 100% personalizadas para el cumpleaños de tu perro o
            gato — hechos a mano, con ingredientes naturales y mucho cariño.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
            <a
              href="#catalogo"
              className="rounded-full bg-blush-400 px-6 py-3 text-center text-sm font-bold text-white shadow-soft transition hover:bg-blush-500"
            >
              Ver catálogo y planes
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border-2 border-olive-400 px-6 py-3 text-sm font-bold text-olive-700 transition hover:bg-olive-100"
            >
              <MessageCircle size={18} /> Escríbenos
            </a>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="mx-auto flex w-fit items-center gap-2 text-sm font-semibold text-olive-500 hover:text-blush-500 md:mx-0"
          >
            <Instagram size={16} /> @barkipty
          </a>
        </div>

        <div className="relative mx-auto grid w-full max-w-md grid-cols-2 gap-4">
          <img
            src={dogCake}
            alt="Koko celebrando su cumpleaños con un cake Barki"
            className="col-span-2 aspect-[4/3] w-full rounded-[2rem] object-cover shadow-soft"
          />
          <div className="col-span-2 flex flex-col justify-center rounded-[2rem] bg-olive-500 p-5 text-white shadow-soft">
            <span className="font-display text-3xl font-extrabold">100%</span>
            <span className="text-sm font-semibold text-olive-100">Natural · Libre de gluten, soya y azúcar</span>
          </div>
        </div>
      </div>
    </section>
  );
}
