import { createContext, useContext, useState, type ReactNode } from "react";
import type { Product } from "@/data/products";

interface CartItem {
  product: Product;
  quantity: number;
  engraving?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, engraving?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  totalItems: number;
  totalPrice: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, engraving?: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1, engraving: engraving || i.engraving } : i));
      }
      return [...prev, { product, quantity: 1, engraving }];
    });
  };

  const removeItem = (productId: string) => setItems((prev) => prev.filter((i) => i.product.id !== productId));
  const updateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) return removeItem(productId);
    setItems((prev) => prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i)));
  };
  const clearCart = () => setItems([]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, totalItems, totalPrice, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
