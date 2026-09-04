import "./globals.css";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { CartProvider, CartButton } from "@/components/CartProvider";
import { AuthGate } from "@/components/AuthGate";

export const metadata = {
  title: "Zohran Ayurveda | Natural • Trusted • Ayurvedic",
  description: "Zohran Ayurveda — premium Ayurvedic wellness products from Hyderabad.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1045049664709570"
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>
        <CartProvider>
          <div className="topbar">Natural • Trusted • Ayurvedic &nbsp;|&nbsp; Hyderabad</div>
          <nav className="nav">
            <div className="container navinner">
              <Link className="brand" href="/">
                <Image src="/logo.png" width={92} height={92} alt="Zohran Ayurveda logo" />
                <span>ZOHRAN AYURVEDA</span>
              </Link>
              <div className="navlinks">
                <Link href="/products">Products</Link>
                <Link href="/#story">Our Story</Link>
                <Link href="/#contact">Contact</Link>
                <Link href="/track-order">Track order</Link>
                <Link href="/blog">Journal</Link>
                <Link href="/account">Account</Link>
              </div>
              <CartButton />
            </div>
          </nav>
          {children}
          <AuthGate />
          <footer className="footer">
            <div className="container footerinner">
              <span>© 2026 Zohran Ayurveda</span>
              <span><Link href="/privacy">Privacy</Link> · <Link href="/terms">Terms</Link> · <Link href="/shipping">Shipping</Link> · <Link href="/refunds">Returns</Link></span>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
