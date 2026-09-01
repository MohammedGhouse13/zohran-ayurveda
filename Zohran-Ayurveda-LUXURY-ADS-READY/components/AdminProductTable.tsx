"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { formatINR } from "@/lib/money";
import { ProductForm, EditButton, DeleteButton } from "@/components/ProductForm";
import { Product } from "@/types/database";

export function AdminProductTable({ products }: { products: Product[] }) {
  const [query,setQuery]=useState("");
  const [status,setStatus]=useState("all");
  const filtered=useMemo(()=>products.filter(p=>{
    const q=query.trim().toLowerCase();
    const matches=!q || p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchesStatus = status === "all" || (status === "published" && p.is_active) || (status === "hidden" && !p.is_active) || (status === "low" && p.stock_qty <= 5);
    return matches && matchesStatus;
  }),[products,query,status]);
  return <>
    <div className="adminlistbar">
      <input className="searchbox" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products, slugs, categories…"/>
      <select className="sortselect" value={status} onChange={e=>setStatus(e.target.value)}>
        <option value="all">All products</option><option value="published">Published</option><option value="hidden">Hidden</option><option value="low">Low stock (≤ 5)</option>
      </select>
      <span className="resultmeta">{filtered.length} of {products.length}</span>
    </div>
    <div className="tablewrap">
      <table className="table admintable">
        <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{filtered.map(p=><tr key={p.id}>
          <td><div className="adminproductcell"><div className="adminthumb">{p.image_url&&<Image src={p.image_url} alt="" fill sizes="52px"/>}</div><div><b>{p.name}</b><small>{p.slug}</small></div></div></td>
          <td>{p.category}</td><td>{p.price_paise>0?formatINR(p.price_paise):<span className="muted">Not priced</span>}</td>
          <td><span className={p.stock_qty<=5?"stocklow":"stockok"}>{p.stock_qty}</span></td>
          <td><span className="status">{p.is_active?"Published":"Hidden"}</span></td>
          <td><div className="actionrow"><EditButton product={p}/><DeleteButton id={p.id}/></div></td>
        </tr>)}</tbody>
      </table>
      {!filtered.length&&<div className="emptytable">No products match your filters.</div>}
    </div>
  </>;
}
