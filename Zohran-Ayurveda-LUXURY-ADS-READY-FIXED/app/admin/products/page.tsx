import { requireAdmin } from "@/lib/auth";
import { AdminProductTable } from "@/components/AdminProductTable";
import { ProductForm } from "@/components/ProductForm";

export default async function ProductsAdmin() {
  const {supabase}=await requireAdmin();
  const {data:products,error}=await supabase.from("products").select("*").order("created_at",{ascending:true});
  if(error) throw new Error(error.message);
  const rows=products||[];
  const low=rows.filter(p=>p.stock_qty<=5).length;
  const published=rows.filter(p=>p.is_active).length;
  return <>
    <div className="adminstats"><div><span>Total products</span><b>{rows.length}</b></div><div><span>Published</span><b>{published}</b></div><div><span>Low stock</span><b>{low}</b></div></div>
    <ProductForm />
    <div style={{marginTop:24}}><AdminProductTable products={rows as any}/></div>
  </>;
}
