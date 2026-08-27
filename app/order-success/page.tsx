import Link from "next/link";

export default async function Success({ searchParams }: { searchParams: Promise<{order?:string}> }) {
  const sp = await searchParams;
  return <section className="success"><div className="successbox">
    <div className="kicker">Payment complete</div>
    <h1 style={{font:"500 55px Georgia,serif",color:"var(--forest)"}}>Thank you for your order.</h1>
    <p className="muted">Your payment has been submitted successfully. Your order number is <strong>{sp.order || "—"}</strong>.</p>
    <div className="buttonrow" style={{justifyContent:"center"}}><Link className="btn primary" href="/">Continue shopping</Link></div>
  </div></section>;
}
