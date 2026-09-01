
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProductDiscovery } from "@/components/ProductDiscovery";

export const revalidate = 60;

const FALLBACK_PRODUCTS = [
  { id:"1", slug:"z-vericos-veins", name:"Z-Vericos Veins Syrup", category:"Wellness", description:"Ayurvedic syrup presented in the supplied brand creative.", image_url:"/products/z-vericos-veins.png", price_paise:0, stock_qty:0, is_active:true },
  { id:"2", slug:"z-joint-ortho-oil", name:"Z-Joint Ortho Oil", category:"Joint & Pain", description:"Herbal pain oil presented in the supplied brand creative.", image_url:"/products/z-joint-ortho-oil.png", price_paise:0, stock_qty:0, is_active:true },
  { id:"3", slug:"z-joint-care", name:"Z-Joint Care Syrup", category:"Joint & Pain", description:"Ayurvedic joint-care syrup presented in the supplied brand creative.", image_url:"/products/z-joint-care.png", price_paise:0, stock_qty:0, is_active:true },
  { id:"4", slug:"z-vical", name:"Z-Vical Capsules", category:"Joint & Pain", description:"Ayurvedic cervical-care capsule presented in the supplied brand creative.", image_url:"/products/z-vical.png", price_paise:0, stock_qty:0, is_active:true },
  { id:"5", slug:"z-lysis", name:"Z-Lysis Capsules", category:"Wellness", description:"Ayurvedic wellness capsule presented in the supplied brand creative.", image_url:"/products/z-lysis.png", price_paise:0, stock_qty:0, is_active:true },
  { id:"6", slug:"z-fair-beauty", name:"Z-Fair & Beauty", category:"Beauty", description:"Skin-care cream presented in the supplied brand creative.", image_url:"/products/z-fair-beauty.png", price_paise:0, stock_qty:0, is_active:true },
  { id:"7", slug:"z-uric-care", name:"Z-Uric Care Capsules", category:"Wellness", description:"Ayurvedic capsule presented in the supplied brand creative.", image_url:"/products/z-uric-care.png", price_paise:0, stock_qty:0, is_active:true }
];

const categoryCards = [
  { title:"Joint & Mobility", copy:"Shop oils, syrups and capsules in one focused collection.", href:"/products?category=Joint%20%26%20Pain", image:"/products/z-joint-ortho-oil.png" },
  { title:"Daily Wellness", copy:"Explore everyday Ayurvedic wellness products.", href:"/products?category=Wellness", image:"/products/z-uric-care.png" },
  { title:"Beauty & Care", copy:"Simple self-care with an Ayurvedic visual language.", href:"/products?category=Beauty", image:"/products/z-fair-beauty.png" }
];

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: true });
  const products = data && data.length ? data : FALLBACK_PRODUCTS;

  return <>
    <section className="hero2">
      <div className="container hero2grid">
        <div className="hero2copy">
          <div className="kicker">ZOHRAN AYURVEDA · HYDERABAD</div>
          <h1>Ancient wisdom.<br/><em>Modern everyday care.</em></h1>
          <p>Discover a calmer way to shop Ayurvedic wellness — with focused collections, clear product stories and a premium experience built for today.</p>
          <div className="buttonrow">
            <Link href="#shop" className="btn primary">Shop the collection →</Link>
            <Link href="#story" className="btn">Our story</Link>
          </div>
          <div className="hero2meta"><span>✓ Product-first</span><span>✓ Secure checkout</span><span>✓ Hyderabad based</span></div>
        </div>
        <div className="hero2visual">
          <div className="halo"/>
          <Image src="/products/z-joint-care.png" alt="Zohran Ayurveda featured product" width={900} height={900} priority />
          <div className="hero2card"><small>FEATURED COLLECTION</small><b>Joint & Mobility</b><span>Explore the range →</span></div>
        </div>
      </div>
    </section>

    <section className="quicknav">
      <div className="container quicknavgrid">
        <Link href="/products">All Products <span>→</span></Link>
        <Link href="/products?category=Joint%20%26%20Pain">Joint & Pain <span>→</span></Link>
        <Link href="/products?category=Wellness">Wellness <span>→</span></Link>
        <Link href="/products?category=Beauty">Beauty <span>→</span></Link>
        <Link href="/account">My account <span>→</span></Link><Link href="#contact">Need help? <span>→</span></Link>
      </div>
    </section>

    <section id="shop" className="section2">
      <div className="container">
        <div className="sectionhead2">
          <div><div className="kicker">SHOP ZOHRAN</div><h2>Find what fits your routine.</h2></div>
          <p>Search by product name, browse by category and open quick views without losing your place.</p>
        </div>
        <ProductDiscovery products={products as any} />
      </div>
    </section>

    <section className="section2 band2">
      <div className="container">
        <div className="sectionhead2"><div><div className="kicker">SHOP BY NEED</div><h2>Curated collections.</h2></div></div>
        <div className="collectiongrid">
          {categoryCards.map(card => (
            <Link href={card.href} className="collectioncard" key={card.title}>
              <Image src={card.image} alt={card.title} fill sizes="(max-width:900px) 100vw, 33vw"/>
              <div className="collectionshade"/>
              <div className="collectioncopy"><small>SHOP COLLECTION</small><h3>{card.title}</h3><p>{card.copy}</p><span>Explore →</span></div>
            </Link>
          ))}
        </div>
      </div>
    </section>

    <section id="story" className="section2">
      <div className="container storygrid">
        <div className="storyimage"><Image src="/founder.png" alt="Md Tawseef, Founder of Zohran Ayurveda" fill sizes="(max-width:900px) 100vw, 45vw"/></div>
        <div className="storycopy">
          <div className="kicker">THE ZOHRAN STORY</div>
          <h2>A founder-led Ayurvedic brand with a modern point of view.</h2>
          <p>Zohran Ayurveda is being built around an idea that traditional wellness can still feel beautifully relevant, easy to discover and easy to buy.</p>
          <p><strong>Md Tawseef</strong> leads the business as Founder, with <strong>Mohammad Khaja Moin Uddin</strong> as Co-Founder.</p>
          <Link href="#contact" className="btn primary">Talk to the team →</Link>
        </div>
      </div>
    </section>

    <section className="section2 band2">
      <div className="container">
        <div className="sectionhead2"><div><div className="kicker">WHY ZOHRAN</div><h2>The details matter.</h2></div></div>
        <div className="trustgrid2">
          <div><b>01</b><h3>Thoughtful discovery</h3><p>Products are organized so customers can move from concern to collection to product in a few clicks.</p></div>
          <div><b>02</b><h3>Secure commerce</h3><p>Checkout, payment verification, orders and inventory are designed around a real backend rather than browser storage.</p></div>
          <div><b>03</b><h3>Built to grow</h3><p>The same backend can power the website now and the Zohran Ayurveda mobile app later.</p></div>
          <div><b>04</b><h3>Human support</h3><p>Clear contact options give customers a direct path to the business when they need help.</p></div>
        </div>
      </div>
    </section>

    <section className="section2" id="contact">
      <div className="container contact2">
        <div><div className="kicker">CONTACT</div><h2>Need help choosing a product?</h2><p>Reach the Zohran Ayurveda team for product and order enquiries.</p></div>
        <div className="contact2cards">
          <a href="tel:9845035769"><small>FOUNDER</small><b>9845035769</b></a>
          <a href="tel:9032684740"><small>CO-FOUNDER</small><b>9032684740</b></a>
          <div><small>ADDRESS</small><b>Mahaveer Nagar Guddi Malkapur, Asif Nagar, Hyderabad 500028</b></div>
        </div>
      </div>
    </section>
  </>;
}
