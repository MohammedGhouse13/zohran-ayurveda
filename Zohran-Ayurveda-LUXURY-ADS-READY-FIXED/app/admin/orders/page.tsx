import { requireAdmin } from "@/lib/auth";
import { formatINR } from "@/lib/money";
import { OrderStatus } from "@/components/OrderStatus";

export default async function OrdersAdmin() {
  const {supabase}=await requireAdmin();
  const {data:orders,error}=await supabase.from("orders").select("*").order("created_at",{ascending:false});
  if(error) throw new Error(error.message);
  const rows=orders||[];
  const ids=rows.map(o=>o.id);
  const {data:items}=ids.length?await supabase.from("order_items").select("order_id,product_name,quantity,unit_price_paise,line_total_paise").in("order_id",ids):{data:[] as any[]};
  const byOrder=new Map<string,any[]>();
  for(const item of items||[]) byOrder.set(item.order_id,[...(byOrder.get(item.order_id)||[]),item]);
  return <>
    <div className="adminstats"><div><span>Total orders</span><b>{rows.length}</b></div><div><span>Paid / fulfilled</span><b>{rows.filter((o:any)=>["paid","processing","shipped","delivered"].includes(o.status)).length}</b></div><div><span>Needs attention</span><b>{rows.filter((o:any)=>["pending","payment_review","payment_failed"].includes(o.status)).length}</b></div></div>
    <div className="tablewrap"><table className="table ordertable"><thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th><th>Created</th></tr></thead>
      <tbody>{rows.map((o:any)=><tr key={o.id}>
        <td><b>{o.order_number}</b><details><summary>View address</summary><span>{o.address_line1}{o.address_line2?`, ${o.address_line2}`:""}<br/>{o.city}, {o.state} {o.postal_code}</span></details></td>
        <td>{o.customer_name}<br/><span className="muted">{o.customer_phone}<br/>{o.customer_email}</span></td>
        <td><details><summary>{(byOrder.get(o.id)||[]).reduce((a,x)=>a+x.quantity,0)} units</summary><div className="orderitems">{(byOrder.get(o.id)||[]).map((i:any)=><div key={i.product_name+i.quantity}><span>{i.product_name} × {i.quantity}</span><b>{formatINR(i.line_total_paise)}</b></div>)}</div></details></td>
        <td><b>{formatINR(o.total_paise)}</b></td><td><OrderStatus id={o.id} value={o.status}/></td><td>{o.payment_status}</td><td>{new Date(o.created_at).toLocaleString("en-IN")}</td>
      </tr>)}</tbody></table>{!rows.length&&<div className="emptytable">No orders yet.</div>}</div>
  </>;
}
