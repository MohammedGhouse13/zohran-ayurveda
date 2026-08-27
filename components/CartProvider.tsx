"use client";

import { useEffect, useMemo, useState, createContext, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, CartItem } from "@/types/database";
import { formatINR } from "@/lib/money";

type Ctx = {
  items: CartItem[];
  add: (product: Product) => void;
  remove: (id: string) => void;
  change: (id: string, qty: number) => void;
  count: number;
  subtotal: number;
  open: () => void;
  clear: () => void;
};

const CartContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "zohran-ayurveda-cart-v2";

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items, hydrated]);

  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawer]);

  const api = useMemo<Ctx>(() => ({
    items,
    add: (product) => {
      setItems(curr => {
        const found = curr.find(x => x.product.id === product.id);
        if (found) return curr.map(x => x.product.id === product.id ? { ...x, quantity: x.quantity + 1 } : x);
        return [...curr, { product, quantity: 1 }];
      });
      setDrawer(true);
    },
    remove: (id) => setItems(curr => curr.filter(x => x.product.id !== id)),
    change: (id, qty) => setItems(curr => curr.map(x => x.product.id === id ? { ...x, quantity: Math.max(1, qty) } : x)),
    count: items.reduce((a, x) => a + x.quantity, 0),
    subtotal: items.reduce((a, x) => a + x.product.price_paise * x.quantity, 0),
    open: () => setDrawer(true),
    clear: () => setItems([])
  }), [items]);

  return (
    <CartContext.Provider value={api}>
      {children}
      <CartDrawer open={drawer} close={() => setDrawer(false)} />
    </CartContext.Provider>
  );
}

export function CartButton() {
  const { count, subtotal, open } = useCart();
  return (
    <button className="carttrigger" type="button" onClick={open} aria-label={`Open cart, ${count} items`}>
      <span className="carticon">🛒</span>
      <span><b>Cart</b><small>{count} {count === 1 ? "item" : "items"}</small></span>
      <strong>{formatINR(subtotal)}</strong>
      <span className="badge">{count}</span>
    </button>
  );
}

function CartDrawer({ open, close }: { open: boolean; close: () => void }) {
  const { items, subtotal, remove, change } = useCart();
  return (
    <div className={`drawer ${open ? "open" : ""}`} aria-hidden={!open} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <aside className="drawerpanel" role="dialog" aria-modal="true" aria-label="Shopping cart">
        <div className="drawerhead">
          <div><div className="kicker">Your basket</div><h2>Shopping cart</h2></div>
          <button className="close circleclose" onClick={close} aria-label="Close cart">×</button>
        </div>

        {!items.length ? (
          <div className="emptycart">
            <div className="emptyicon">🛍</div>
            <h3>Your basket is empty</h3>
            <p className="muted">Add products from the collection and they will appear here.</p>
            <Link className="btn primary" href="/products" onClick={close}>Browse products</Link>
          </div>
        ) : (
          <>
            <div className="cartitems">
              {items.map(({ product, quantity }) => (
                <div className="draweritem" key={product.id}>
                  <div className="drawerimage">
                    {product.image_url ? <Image src={product.image_url} alt={product.name} fill sizes="88px" /> : <span>ZA</span>}
                  </div>
                  <div className="drawerinfo">
                    <div className="cardcat">{product.category}</div>
                    <b>{product.name}</b>
                    <span>{formatINR(product.price_paise)} each</span>
                    <div className="qtyrow">
                      <div className="qty">
                        <button onClick={() => quantity > 1 ? change(product.id, quantity - 1) : remove(product.id)} aria-label="Decrease quantity">−</button>
                        <span>{quantity}</span>
                        <button onClick={() => change(product.id, quantity + 1)} aria-label="Increase quantity">+</button>
                      </div>
                      <button className="removebtn" onClick={() => remove(product.id)}>Remove</button>
                    </div>
                  </div>
                  <strong>{formatINR(product.price_paise * quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="drawersummary">
              <div><span>Subtotal</span><b>{formatINR(subtotal)}</b></div>
              <p>Shipping and any applicable taxes are confirmed at checkout.</p>
              <Link className="btn primary checkoutbtn" href="/checkout" onClick={close}>Proceed to checkout →</Link>
              <button className="continuebtn" onClick={close}>Continue shopping</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
