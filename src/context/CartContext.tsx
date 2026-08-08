import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartLine {
  key: string;
  productId: string;
  name: string;
  detail?: string;
  unitPrice: number;
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "qty">, qty: number) => void;
  removeLine: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "barki-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines]);

  const addLine: CartContextValue["addLine"] = (line, qty) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.key === line.key);
      if (existing) {
        return prev.map((l) => (l.key === line.key ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { ...line, qty }];
    });
    setIsOpen(true);
  };

  const removeLine = (key: string) => setLines((prev) => prev.filter((l) => l.key !== key));

  const updateQty = (key: string, qty: number) => {
    if (qty <= 0) {
      removeLine(key);
      return;
    }
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, qty } : l)));
  };

  const clear = () => setLines([]);

  const count = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);
  const subtotal = useMemo(() => lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0), [lines]);

  return (
    <CartContext.Provider
      value={{
        lines,
        addLine,
        removeLine,
        updateQty,
        clear,
        count,
        subtotal,
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
