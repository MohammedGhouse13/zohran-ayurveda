
'use client';
import { useState } from "react";

export function OrderStatus({id,value}:{id:string;value:string}) {
  const [status,setStatus]=useState(value);
  const [busy,setBusy]=useState(false);
  async function update(next:string){
    const old=status; setStatus(next); setBusy(true);
    const r=await fetch("/api/admin/orders",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status:next})});
    if(!r.ok){setStatus(old); const d=await r.json(); alert(d.error||"Update failed");}
    setBusy(false);
  }
  return <select className="select" value={status} disabled={busy} onChange={e=>update(e.target.value)}>
    {["pending","paid","processing","shipped","delivered","cancelled","payment_failed","payment_review"].map(s=><option key={s}>{s}</option>)}
  </select>;
}
