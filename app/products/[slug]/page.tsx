
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/money";
import { AddToCartButton } from "@/components/AddToCartButton";

export default async function ProductPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const supabase=await createClient();
 const {data:p}=await supabase.from("products").select("*").eq("slug",slug).eq("is_active",true).single();
 if(!p) return <section className="section"><div className="container"><h2>Product not found</h2><Link className="btn" href="/products">Back to products</Link></div></section>;
 return <section className="section2"><div className="container modalgrid">
  <div className="cardimg" style={{borderRadius:24,overflow:"hidden"}}>{p.image_url&&<Image src={p.image_url} width={1000} height={1000} alt={p.name}/>}</div>
  <div>
   <div className="kicker">{p.category}</div><h1 style={{font:"500 54px/1.02 Georgia,serif",color:"var(--forest)",margin:"12px 0 15px"}}>{p.name}</h1>
   <p className="muted">{p.long_description||p.description}</p>
   <div className="price" style={{fontSize:24}}>{p.price_paise>0?formatINR(p.price_paise):"Price on request"}</div>
   <p className="muted" style={{fontSize:12}}>Stock: {p.stock_qty>0 ? "Available" : "Currently unavailable"}</p>
   <AddToCartButton product={p}/>
  </div>
 </div></section>
}
