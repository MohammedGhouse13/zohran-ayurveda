
import { createClient } from "@/lib/supabase/server";
import { ProductDiscovery } from "@/components/ProductDiscovery";
import Image from "next/image";

const fallback = [
  {id:"1",slug:"z-vericos-veins",name:"Z-Vericos Veins Syrup",category:"Wellness",description:"Ayurvedic syrup.",long_description:null,image_url:"/products/z-vericos-veins.png",price_paise:0,stock_qty:0,is_active:true},
  {id:"2",slug:"z-joint-ortho-oil",name:"Z-Joint Ortho Oil",category:"Joint & Pain",description:"Herbal pain oil.",long_description:null,image_url:"/products/z-joint-ortho-oil.png",price_paise:0,stock_qty:0,is_active:true},
  {id:"3",slug:"z-joint-care",name:"Z-Joint Care Syrup",category:"Joint & Pain",description:"Ayurvedic joint-care syrup.",long_description:null,image_url:"/products/z-joint-care.png",price_paise:0,stock_qty:0,is_active:true},
  {id:"4",slug:"z-vical",name:"Z-Vical Capsules",category:"Joint & Pain",description:"Ayurvedic cervical-care capsules.",long_description:null,image_url:"/products/z-vical.png",price_paise:0,stock_qty:0,is_active:true},
  {id:"5",slug:"z-lysis",name:"Z-Lysis Capsules",category:"Wellness",description:"Ayurvedic wellness capsules.",long_description:null,image_url:"/products/z-lysis.png",price_paise:0,stock_qty:0,is_active:true},
  {id:"6",slug:"z-fair-beauty",name:"Z-Fair & Beauty",category:"Beauty",description:"Skin-care cream.",long_description:null,image_url:"/products/z-fair-beauty.png",price_paise:0,stock_qty:0,is_active:true},
  {id:"7",slug:"z-uric-care",name:"Z-Uric Care Capsules",category:"Wellness",description:"Ayurvedic capsules.",long_description:null,image_url:"/products/z-uric-care.png",price_paise:0,stock_qty:0,is_active:true}
];
export default async function ProductsPage(){
 const supabase=await createClient();
 const {data}=await supabase.from("products").select("*").eq("is_active",true).order("created_at",{ascending:true});
 const products=data&&data.length?data:fallback;
 return <section className="section2"><div className="container">
  <div className="sectionhead2"><div><div className="kicker">THE COLLECTION</div><h2>All Zohran products.</h2></div><p>Search and shop the complete collection.</p></div>
  <ProductDiscovery products={products as any}/>
 </div></section>
}
