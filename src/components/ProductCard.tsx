import { useMemo, useState, type TouchEvent } from "react";
import { Minus, Plus, ShoppingBasket, PawPrint, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "../data/catalog";
import { CAKE_COLORS, VEGETABLE_COLORS, FLAVORS, SHAPES } from "../data/catalog";
import { useCart } from "../context/CartContext";

const COLOR_OPTIONS = [...CAKE_COLORS, ...VEGETABLE_COLORS];

export default function ProductCard({ product, wide }: { product: Product; wide?: boolean }) {
  const { addLine } = useCart();
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id ?? "");
  const [extrasOn, setExtrasOn] = useState<Record<string, boolean>>({});
  const flavorList = product.flavorOptions ?? FLAVORS;
  const [flavor, setFlavor] = useState(flavorList[0]);
  const [colors, setColors] = useState<string[]>([]);
  const [shape, setShape] = useState(SHAPES[0]);
  const [choiceValue, setChoiceValue] = useState(product.choice?.options[0] ?? "");
  const [note, setNote] = useState("");
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const images = product.images ?? [];
  const [imgIndex, setImgIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  function prevImg() {
    setImgIndex((i) => (i - 1 + images.length) % images.length);
  }
  function nextImg() {
    setImgIndex((i) => (i + 1) % images.length);
  }
  function onTouchStart(e: TouchEvent) {
    setTouchStartX(e.touches[0].clientX);
  }
  function onTouchEnd(e: TouchEvent) {
    if (touchStartX === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (delta > 40) prevImg();
    else if (delta < -40) nextImg();
    setTouchStartX(null);
  }

  const basePrice = useMemo(() => {
    if (product.variants) {
      return product.variants.find((v) => v.id === variantId)?.price ?? product.variants[0].price;
    }
    return product.price ?? 0;
  }, [product, variantId]);

  const extrasPrice = useMemo(() => {
    if (!product.extras) return 0;
    return product.extras.reduce((sum, e) => (extrasOn[e.id] ? sum + e.price : sum), 0);
  }, [product.extras, extrasOn]);

  const unitPrice = basePrice + extrasPrice;

  function toggleColor(name: string) {
    setColors((prev) => {
      if (prev.includes(name)) return prev.filter((c) => c !== name);
      if (prev.length >= 2) return [prev[1], name];
      return [...prev, name];
    });
  }

  function handleAdd() {
    const variantLabel = product.variants?.find((v) => v.id === variantId)?.label;
    const extraLabels = product.extras?.filter((e) => extrasOn[e.id]).map((e) => e.label) ?? [];
    const detailParts = [
      variantLabel,
      ...extraLabels,
      product.hasFlavor ? `sabor: ${flavor}` : null,
      product.hasColor && colors.length ? `colores: ${colors.join(" y ")}` : null,
      product.hasShape ? `forma: ${shape}` : null,
      product.choice ? `${product.choice.label.toLowerCase()}: ${choiceValue}` : null,
      product.hasNote && note.trim() ? `nota: ${note.trim()}` : null,
    ].filter(Boolean) as string[];

    const key = [
      product.id,
      variantId,
      Object.keys(extrasOn).filter((k) => extrasOn[k]).join("+"),
      product.hasFlavor ? flavor : "",
      colors.join("-"),
      product.hasShape ? shape : "",
      product.choice ? choiceValue : "",
      product.hasNote ? note.trim() : "",
    ]
      .filter(Boolean)
      .join("::");

    addLine(
      {
        key,
        productId: product.id,
        name: product.name,
        detail: detailParts.join(", "),
        unitPrice,
      },
      qty,
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-soft ring-1 ring-olive-200/60 transition hover:-translate-y-1 hover:shadow-lg">
      <div
        className={`group relative w-full overflow-hidden bg-gradient-to-br from-olive-100 to-blush-100 ${
          wide ? "aspect-[7/2]" : "aspect-[4/3]"
        }`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {images.length > 0 ? (
          <img src={images[imgIndex]} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-olive-400 paw-bg">
            <PawPrint size={36} strokeWidth={1.5} />
            <span className="font-display text-sm">{product.quoteOnly ? "Cuéntanos tu idea" : "Foto próximamente"}</span>
          </div>
        )}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImg}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-olive-700 shadow transition hover:bg-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={nextImg}
              aria-label="Foto siguiente"
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-olive-700 shadow transition hover:bg-white"
            >
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setImgIndex(i)}
                  aria-label={`Foto ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === imgIndex ? "w-4 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
        {product.tagline && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-olive-700 shadow">
            {product.tagline}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-lg font-bold text-olive-800">{product.name}</h3>

        {product.bullets && (
          <ul className="space-y-1 text-sm text-olive-600">
            {product.bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="mt-1 text-blush-400">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {product.variants && (
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  variantId === v.id
                    ? "border-olive-500 bg-olive-500 text-white"
                    : "border-olive-200 bg-white text-olive-600 hover:border-olive-400"
                }`}
              >
                {v.label} · ${v.price.toFixed(2)}
              </button>
            ))}
          </div>
        )}

        {product.extras && (
          <div className="flex flex-wrap gap-2">
            {product.extras.map((e) => (
              <label
                key={e.id}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  extrasOn[e.id] ? "border-blush-400 bg-blush-100 text-blush-500" : "border-olive-200 text-olive-600"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={!!extrasOn[e.id]}
                  onChange={() => setExtrasOn((prev) => ({ ...prev, [e.id]: !prev[e.id] }))}
                />
                {e.label} (+${e.price.toFixed(2)})
              </label>
            ))}
          </div>
        )}

        {product.hasFlavor && (
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-olive-500">Sabor</label>
            <select
              value={flavor}
              onChange={(e) => setFlavor(e.target.value)}
              className="w-full rounded-xl border border-olive-200 bg-olive-50 px-3 py-2 text-sm text-olive-700 focus:border-olive-400 focus:outline-none"
            >
              {flavorList.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        )}

        {product.hasColor && (
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-olive-500">
              Colores (elige hasta 2)
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => toggleColor(c.name)}
                  title={c.name}
                  className={`h-8 w-8 rounded-full border-2 transition ${
                    colors.includes(c.name) ? "border-olive-600 scale-110" : "border-white shadow ring-1 ring-olive-200"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        )}

        {product.hasShape && (
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-olive-500">Forma</label>
            <div className="flex gap-2">
              {SHAPES.map((s) => (
                <button
                  key={s}
                  onClick={() => setShape(s)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    shape === s ? "border-olive-500 bg-olive-500 text-white" : "border-olive-200 text-olive-600"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.choice && (
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-olive-500">
              {product.choice.label}
            </label>
            <div className="flex flex-wrap gap-2">
              {product.choice.options.map((o) => (
                <button
                  key={o}
                  onClick={() => setChoiceValue(o)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    choiceValue === o ? "border-olive-500 bg-olive-500 text-white" : "border-olive-200 text-olive-600"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.hasNote && (
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-olive-500">
              Notas / diseño deseado
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Cuéntanos la forma, tema o detalles que imaginas..."
              rows={3}
              className="w-full rounded-xl border border-olive-200 bg-olive-50 px-3 py-2 text-sm text-olive-700 focus:border-olive-400 focus:outline-none"
            />
          </div>
        )}

        {product.note && <p className="text-xs italic text-olive-400">{product.note}</p>}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="font-display text-blush-500">
            {product.quoteOnly ? (
              <span className="text-base font-bold">{product.priceNote}</span>
            ) : (
              <span className="text-xl font-bold">
                {product.priceNote && <span className="mr-1 text-xs font-normal text-olive-400">{product.priceNote}</span>}
                ${unitPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 rounded-full border border-olive-200 bg-olive-50 px-1 py-1">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full text-olive-600 hover:bg-olive-200"
            >
              <Minus size={14} />
            </button>
            <span className="w-5 text-center text-sm font-semibold text-olive-700">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-olive-600 hover:bg-olive-200"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <button
          onClick={handleAdd}
          className={`flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-bold text-white shadow-soft transition ${
            justAdded ? "bg-green-500" : "bg-blush-400 hover:bg-blush-500"
          }`}
        >
          <ShoppingBasket size={16} />
          {justAdded ? "¡Agregado!" : product.quoteOnly ? "Enviar cotización" : "Agregar al pedido"}
        </button>
      </div>
    </div>
  );
}
