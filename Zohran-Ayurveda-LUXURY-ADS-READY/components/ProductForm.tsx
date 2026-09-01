'use client';

import { useState } from "react";
import { Product } from "@/types/database";

type FormState = {
  id: string; name: string; slug: string; category: string; description: string;
  long_description: string; image_url: string; price: string; mrp: string; stock: string; is_active: boolean;
};

export function ProductForm({ existing = null }: { existing?: Product | null }) {
  const [form,setForm] = useState<FormState>({
    id: existing?.id || "",
    name: existing?.name || "",
    slug: existing?.slug || "",
    category: existing?.category || "Wellness",
    description: existing?.description || "",
    long_description: existing?.long_description || "",
    image_url: existing?.image_url || "",
    price: existing ? String(existing.price_paise / 100) : "",
    mrp: existing?.compare_at_price_paise ? String(existing.compare_at_price_paise / 100) : "",
    stock: existing ? String(existing.stock_qty) : "0",
    is_active: existing?.is_active ?? true
  });
  const [busy,setBusy] = useState(false);
  const [msg,setMsg] = useState("");

  const set = (key:keyof FormState, value:string|boolean) => setForm(f=>({...f,[key]:value}));

  async function upload(file:File) {
    const data = new FormData();
    data.append("file",file);
    const r = await fetch("/api/admin/upload",{method:"POST",body:data});
    const d = await r.json();
    if(!r.ok) throw new Error(d.error || "Upload failed");
    set("image_url",d.url);
    setMsg("Image uploaded.");
  }

  async function submit(e:React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    try {
      const r = await fetch("/api/admin/products",{
        method:form.id ? "PATCH" : "POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          id:form.id || undefined, name:form.name, slug:form.slug,
          category:form.category, description:form.description,
          long_description:form.long_description, image_url:form.image_url,
          price_paise:Math.round(Number(form.price||0)*100),
          compare_at_price_paise:Math.round(Number(form.mrp||form.price||0)*100) || null,
          stock_qty:Number(form.stock||0), is_active:form.is_active
        })
      });
      const d=await r.json();
      if(!r.ok) throw new Error(d.error || "Save failed");
      setMsg(form.id ? "Product updated. Refresh to see changes." : "Product added. Refresh to see it.");
      if (!form.id) setForm(f=>({...f,name:"",slug:"",description:"",long_description:"",image_url:"",price:"",mrp:"",stock:"0"}));
    } catch(e:any) { setMsg(e.message); }
    finally { setBusy(false); }
  }

  return <div className="card" style={{padding:20}}>
    <h3 style={{fontFamily:"Georgia,serif",color:"var(--forest)"}}>{form.id ? "Edit product" : "Add product"}</h3>
    <form className="form" onSubmit={submit}>
      <div className="formgrid">
        <input className="input" required placeholder="Product name" value={form.name} onChange={e=>set("name",e.target.value)} />
        <input className="input" required placeholder="Slug e.g. z-vericos-veins" value={form.slug} onChange={e=>set("slug",e.target.value)} />
      </div>
      <div className="formgrid">
        <select className="select" value={form.category} onChange={e=>set("category",e.target.value)}>
          <option>Wellness</option><option>Joint & Pain</option><option>Beauty</option>
        </select>
        <input className="input" required type="number" min="0" placeholder="Price ₹" value={form.price} onChange={e=>set("price",e.target.value)} />
      </div>
      <div className="formgrid">
        <input className="input" type="number" min="0" placeholder="MRP ₹" value={form.mrp} onChange={e=>set("mrp",e.target.value)} />
        <input className="input" type="number" min="0" placeholder="Stock quantity" value={form.stock} onChange={e=>set("stock",e.target.value)} />
        <label style={{display:"flex",alignItems:"center",gap:8,color:"var(--muted)",fontSize:13}}>
          <input type="checkbox" checked={form.is_active} onChange={e=>set("is_active",e.target.checked)} /> Published
        </label>
      </div>
      <input className="input" placeholder="Image URL or /products/file.png" value={form.image_url} onChange={e=>set("image_url",e.target.value)} />
      <input className="input" type="file" accept="image/*" onChange={async e=>{const f=e.target.files?.[0];if(!f)return;try{await upload(f)}catch(err:any){setMsg(err.message)}}} />
      <input className="input" placeholder="Short description" value={form.description} onChange={e=>set("description",e.target.value)} />
      <textarea className="textarea" rows={4} placeholder="Long description" value={form.long_description} onChange={e=>set("long_description",e.target.value)} />
      <button className="btn primary" disabled={busy}>{busy?"Saving...":form.id?"Update product":"Save product"}</button>
      {msg && <div className="notice">{msg}</div>}
    </form>
  </div>;
}

export function EditButton({ product }: { product: Product }) {
  const [open,setOpen] = useState(false);
  if (!open) return <button className="smallbtn" onClick={()=>setOpen(true)}>Edit</button>;
  return <div style={{position:"fixed",inset:0,zIndex:120,background:"#07120dcc",padding:20,overflow:"auto"}}>
    <div style={{maxWidth:850,margin:"40px auto"}}>
      <button className="close" onClick={()=>setOpen(false)}>×</button>
      <ProductForm existing={product}/>
    </div>
  </div>;
}

export function DeleteButton({ id }: { id:string }) {
  const [busy,setBusy]=useState(false);
  async function remove() {
    if(!confirm("Delete this product?")) return;
    setBusy(true);
    const r=await fetch("/api/admin/products",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    if(r.ok) window.location.reload();
    else { const d=await r.json(); alert(d.error || "Delete failed"); setBusy(false); }
  }
  return <button className="smallbtn" style={{color:"#9d3939",borderColor:"#d7aaaa"}} onClick={remove} disabled={busy}>{busy?"...":"Delete"}</button>;
}
