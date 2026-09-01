import Link from "next/link";
export default function AdminLayout({children}:{children:React.ReactNode}) {
  return <section className="section band"><div className="container">
    <div className="sectionhead"><div><div className="kicker">Store administration</div><h2>Zohran Ayurveda Admin</h2></div></div>
    <div className="adminnav">
      <Link href="/admin">Dashboard</Link>
      <Link href="/admin/products">Products & Inventory</Link>
      <Link href="/admin/orders">Orders</Link>
      <Link href="/admin/coupons">Coupons & discounts</Link>
      <Link href="/admin/customers">Customers & loyalty</Link>
      <Link href="/admin/blog">Blog / Journal</Link>
      <Link href="/">View store</Link>
    </div>
    {children}
  </div></section>;
}
