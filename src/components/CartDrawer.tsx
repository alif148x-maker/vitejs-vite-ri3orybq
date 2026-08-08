import { useState } from "react";
import { Minus, Plus, ShoppingBasket, Trash2, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { buildWhatsAppMessage, buildWhatsAppUrl } from "../lib/whatsapp";

export default function CartDrawer() {
  const { lines, isOpen, close, updateQty, removeLine, subtotal, clear } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [petName, setPetName] = useState("");
  const [date, setDate] = useState("");
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const message = buildWhatsAppMessage(lines, subtotal, { customerName, petName, date, comment });
  const url = buildWhatsAppUrl(message);

  function handleSend() {
    window.open(url, "_blank", "noreferrer");
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Cerrar carrito" className="absolute inset-0 bg-olive-900/40 backdrop-blur-sm" onClick={close} />

      <div className="relative flex h-full w-full max-w-md flex-col bg-cream shadow-2xl">
        <div className="flex items-center justify-between border-b border-olive-200 px-5 py-4">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-olive-800">
            <ShoppingBasket size={20} /> Tu pedido
          </h2>
          <button onClick={close} className="rounded-full p-2 text-olive-500 hover:bg-olive-100">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-olive-400">
              <ShoppingBasket size={40} strokeWidth={1.2} />
              <p className="text-sm">Aún no has agregado productos.</p>
              <p className="text-xs">Explora el catálogo y los planes para armar tu pedido.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {lines.map((l) => (
                <li key={l.key} className="flex gap-3 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-olive-200/60">
                  <div className="flex-1">
                    <p className="font-display text-sm font-bold text-olive-800">{l.name}</p>
                    {l.detail && <p className="text-xs text-olive-500">{l.detail}</p>}
                    <p className="mt-1 text-sm font-bold text-blush-500">${(l.unitPrice * l.qty).toFixed(2)}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeLine(l.key)} className="text-olive-300 hover:text-blush-500">
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-center gap-1 rounded-full border border-olive-200 px-1 py-0.5">
                      <button
                        onClick={() => updateQty(l.key, l.qty - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-olive-600 hover:bg-olive-100"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-4 text-center text-xs font-bold text-olive-700">{l.qty}</span>
                      <button
                        onClick={() => updateQty(l.key, l.qty + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-olive-600 hover:bg-olive-100"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {lines.length > 0 && (
            <div className="mt-6 space-y-3 border-t border-olive-200 pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-olive-500">Datos para tu pedido</p>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full rounded-xl border border-olive-200 bg-white px-3 py-2 text-sm focus:border-olive-400 focus:outline-none"
              />
              <input
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Nombre de tu mascota"
                className="w-full rounded-xl border border-olive-200 bg-white px-3 py-2 text-sm focus:border-olive-400 focus:outline-none"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-olive-200 bg-white px-3 py-2 text-sm text-olive-700 focus:border-olive-400 focus:outline-none"
              />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Temática, alergias u otro comentario (opcional)"
                rows={3}
                className="w-full rounded-xl border border-olive-200 bg-white px-3 py-2 text-sm focus:border-olive-400 focus:outline-none"
              />
            </div>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-olive-200 bg-white px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-olive-600">Subtotal</span>
              <span className="font-display text-xl font-extrabold text-olive-800">${subtotal.toFixed(2)}</span>
            </div>
            <p className="mb-3 text-xs text-olive-400">*El delivery se calcula según tu zona al confirmar por WhatsApp.</p>
            <button
              onClick={handleSend}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-green-500 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-green-600"
            >
              Enviar pedido por WhatsApp
            </button>
            <button onClick={clear} className="mt-2 w-full text-center text-xs font-semibold text-olive-400 hover:text-blush-500">
              Vaciar pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
