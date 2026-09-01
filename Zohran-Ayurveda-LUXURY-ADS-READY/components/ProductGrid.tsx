"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/types/database";
import { formatINR } from "@/lib/money";
import { useCart } from "./CartProvider";

export function ProductGrid({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState<Product | null>(null);
  const { add } = useCart();
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const shown = products.filter(p => filter === "All" || p.category === filter);

  return (
    <>
      <div className="filters">
        {categories.map(c => <button key={c} className={`chip ${filter===c?"active":""}`} onClick={()=>setFilter(c)}>{c}</button>)}
      </div>
      <div className="productgrid">
        {shown.map(p => (
          <article className="card" key={p.id}>
            <div className="cardimg">{p.image_url && <Image src={p.image_url} width={600} height={600} alt={p.name} />}</div>
            <div className="cardbody">
              <div className="cardcat">{p.category}</div>
              <div className="cardtitle">{p.name}</div>
              <div className="carddesc">{p.description || "Ayurvedic wellness product from Zohran Ayurveda."}</div>
              <div className="price">{p.price_paise > 0 ? formatINR(p.price_paise) : "Price on request"}</div>
              <div className="cardactions">
                <button className="smallbtn" onClick={()=>setActive(p)}>Details</button>
                <button className="smallbtn" onClick={()=>add(p)} disabled={p.stock_qty === 0 && p.price_paise > 0}>Add +</button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {active && (
        <div className="modal open" onClick={(e)=>{if(e.target===e.currentTarget)setActive(null)}}>
          <div className="modalbox">
            <button className="close" onClick={()=>setActive(null)}>×</button>
            <div className="modalgrid">
              <div>{active.image_url && <Image src={active.image_url} width={800} height={800} alt={active.name}/>}</div>
              <div>
                <div className="kicker">{active.category}</div>
                <h2>{active.name}</h2>
                <p className="muted">{active.long_description || active.description}</p>
                {active.price_paise > 0 && <div className="price">{formatINR(active.price_paise)}</div>}
                <button className="btn primary" onClick={()=>{add(active);setActive(null)}}>Add to basket</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
