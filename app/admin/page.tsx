import { requireAdmin } from "@/lib/auth";
import { formatINR } from "@/lib/money";

export default async function AdminDashboard() {
  const { supabase } = await requireAdmin();
  const [{count:products},{count:orders},{data:allOrders},{data:lowStock}] = await Promise.all([
    supabase.from("products").select("id",{count:"exact",head:true}),
    supabase.from("orders").select("id",{count:"exact",head:true}),
    supabase.from("orders").select("total_paise,status").order("created_at",{ascending:false}).limit(500),
    supabase.from("products").select("id,name,stock_qty,is_active").eq("is_active",true).lte("stock_qty",5).order("stock_qty",{ascending:true}).limit(8)
  ]);
  const paid=(allOrders||[]).filter((o:any)=>o.payment_status==="captured" || o.status==="paid" || o.status==="processing" || o.status==="shipped" || o.status==="delivered");
  const revenue=paid.reduce((a:number,o:any)=>a+Number(o.total_paise||0),0);
  const pending=(allOrders||[]).filter((o:any)=>["pending","payment_review"].includes(o.status)).length;
  return <>
    <div className="dashboard">
      <div className="metric"><span>Products</span><b>{products||0}</b><small>Catalog records</small></div>
      <div className="metric"><span>Orders</span><b>{orders||0}</b><small>{pending} need attention</small></div>
      <div className="metric"><span>Captured sales</span><b>{formatINR(revenue)}</b><small>From recorded orders</small></div>
      <div className="metric"><span>Store status</span><b>READY</b><small>Database connected</small></div>
    </div>
    <div className="adminhomegrid">
      <div className="card adminpanel"><div className="panelhead"><div><div className="kicker">INVENTORY</div><h3>Low stock</h3></div><a href="/admin/products">Manage →</a></div>
        {!lowStock?.length?<p className="muted">All published products have more than 5 units in stock.</p>:<div className="lowstocklist">{lowStock.map((p:any)=><div key={p.id}><span>{p.name}</span><b>{p.stock_qty} left</b></div>)}</div>}
      </div>
      <div className="card adminpanel"><div className="panelhead"><div><div className="kicker">OPERATIONS</div><h3>Quick actions</h3></div></div>
        <div className="quickactions"><a href="/admin/products">＋ Add product</a><a href="/admin/orders">View orders →</a><a href="/products">Open storefront →</a></div>
      </div>
    </div>
    <div className="notice" style={{marginTop:18}}>Production note: add your Razorpay live credentials and webhook secret before accepting real payments. Never put the Supabase service-role key in browser code.</div>
  </>;
}
