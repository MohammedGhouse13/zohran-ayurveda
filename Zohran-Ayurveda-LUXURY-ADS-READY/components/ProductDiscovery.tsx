"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Product } from "@/types/database";
import { formatINR } from "@/lib/money";
import { useCart } from "./CartProvider";

function discount(p: Product){ return p.compare_at_price_paise && p.compare_at_price_paise>p.price_paise ? Math.round((1-p.price_paise/p.compare_at_price_paise)*100) : 0; }
export function ProductDiscovery({ products }: { products: Product[] }) {
 const [query,setQuery]=useState(""); const [category,setCategory]=useState("All"); const [sort,setSort]=useState("featured"); const [active,setActive]=useState<Product|null>(null); const [zoom,setZoom]=useState(1); const {add}=useCart();
 const categories=["All",...Array.from(new Set(products.map(p=>p.category)))];
 const shown=useMemo(()=>{ let list=products.filter(p=>{const q=query.toLowerCase().trim();return (!q||p.name.toLowerCase().includes(q)||(p.description||"").toLowerCase().includes(q)||p.category.toLowerCase().includes(q))&&(category==="All"||p.category===category)}); if(sort==="price-asc")list=[...list].sort((a,b)=>a.price_paise-b.price_paise); if(sort==="price-desc")list=[...list].sort((a,b)=>b.price_paise-a.price_paise); if(sort==="name")list=[...list].sort((a,b)=>a.name.localeCompare(b.name)); return list;},[products,query,category,sort]);
 return <>
  <div className="discoveryTop"><input className="searchbox" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products, categories, concerns..."/><select className="sortselect" value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="name">Name</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></div>
  <div className="filters">{categories.map(c=><button key={c} className={`chip ${category===c?"active":""}`} onClick={()=>setCategory(c)}>{c}</button>)}</div>
  <div className="resultmeta" style={{marginBottom:16}}>{shown.length} product{shown.length===1?"":"s"} found</div>
  <div className="productgrid">{shown.map(p=>{const unavailable=p.price_paise<=0||p.stock_qty<=0; const d=discount(p); return <article className={`card ${unavailable?"soldout":""}`} key={p.id}>
    <div className="cardimgWrap"><div className="cardimg">{p.image_url&&<Image src={p.image_url} width={700} height={700} alt={p.name}/>}</div><span className="productbadge">{p.category}</span>{d>0&&<span className="salebadge">-{d}%</span>}</div>
    <div className="cardbody"><div className="cardtitle">{p.name}</div><div className="carddesc">{p.description||"Ayurvedic wellness product from Zohran Ayurveda."}</div><div className="price">{p.price_paise>0?formatINR(p.price_paise):"Price on request"} {p.compare_at_price_paise&&p.compare_at_price_paise>p.price_paise?<del>{formatINR(p.compare_at_price_paise)}</del>:null}</div>
      <div className="cardactions"><button className="smallbtn" onClick={()=>{setActive(p);setZoom(1)}}>Quick view + zoom</button><button className="smallbtn" disabled={unavailable} onClick={()=>add(p)}>{p.stock_qty<=0&&p.price_paise>0?"Out of stock":p.price_paise<=0?"Unavailable":"Add +"}</button></div>
    </div></article>})}</div>
  {active&&<div className="modal open" onClick={e=>{if(e.target===e.currentTarget)setActive(null)}}><div className="modalbox"><button className="close" onClick={()=>setActive(null)}>×</button><div className="modalgrid"><div><div className="zoomstage">{active.image_url&&<Image src={active.image_url} width={900} height={900} alt={active.name} style={{transform:`scale(${zoom})`,transition:"transform .2s"}}/>}</div><div className="zoomcontrols"><button onClick={()=>setZoom(z=>Math.max(.7,z-.2))}>−</button><span>{Math.round(zoom*100)}%</span><button onClick={()=>setZoom(z=>Math.min(2.5,z+.2))}>+</button><button onClick={()=>setZoom(1)}>Reset</button></div></div><div><div className="kicker">{active.category}</div><h2>{active.name}</h2><p className="muted">{active.long_description||active.description}</p><div className="price">{formatINR(active.price_paise)}</div><button className="btn primary" disabled={active.price_paise<=0||active.stock_qty<=0} onClick={()=>{add(active);setActive(null)}}>Add to basket</button></div></div></div></div>}
 </>;
}
