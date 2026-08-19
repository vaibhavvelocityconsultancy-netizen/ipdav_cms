"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CartLine, cartStorageKey, findCartLine, getCartCount, getCartTotal, normalizeCart } from "./data";

type CartContextValue = { lines: CartLine[]; add: (line: CartLine) => void; update: (index: number, quantity: number) => void; remove: (index: number) => void; clear: () => void; count: number; total: number };
const CartContext = createContext<CartContextValue | null>(null);
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  useEffect(() => { try { setLines(normalizeCart(JSON.parse(window.localStorage.getItem(cartStorageKey) || "[]"))); } catch { setLines([]); } }, []);
  useEffect(() => { window.localStorage.setItem(cartStorageKey, JSON.stringify(lines)); }, [lines]);
  const value = useMemo(() => ({ lines, add: (line: CartLine) => setLines((current) => { const index = findCartLine(current, line); if (index < 0) return [...current, line]; return current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: Math.min(10, item.quantity + line.quantity) } : item); }), update: (index: number, quantity: number) => setLines((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: Math.max(1, Math.min(10, quantity)) } : item)), remove: (index: number) => setLines((current) => current.filter((_, itemIndex) => itemIndex !== index)), clear: () => setLines([]), count: getCartCount(lines), total: getCartTotal(lines) }), [lines]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export function useCart() { const value = useContext(CartContext); if (!value) throw new Error("useCart must be used inside CartProvider"); return value; }
