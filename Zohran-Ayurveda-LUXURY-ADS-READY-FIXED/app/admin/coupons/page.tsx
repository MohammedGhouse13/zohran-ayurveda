import { requireAdmin } from "@/lib/auth";
import CouponManager from "@/components/CouponManager";
export default async function CouponsAdmin(){const {supabase}=await requireAdmin();const {data}=await supabase.from("coupons").select("*").order("created_at",{ascending:false});return <CouponManager initial={data||[]}/>}
