
"use client";
import Link from "next/link";
import { Product } from "@/types/database";
import { useCart } from "./CartProvider";
export function AddToCartButton({product}:{product:Product}){
 const {add}=useCart();
 const disabled=product.price_paise<=0||product.stock_qty<=0;
 if(disabled) return <button className="btn" disabled>Currently unavailable</button>;
 return <><button className="btn primary" onClick={()=>add(product)}>Add to basket</button><Link href="/checkout" className="btn" style={{marginLeft:8}}>Checkout</Link></>;
}
