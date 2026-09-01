import { requireAdmin } from "@/lib/auth";
import BlogManager from "@/components/BlogManager";
export default async function BlogAdmin(){const {supabase}=await requireAdmin();const {data}=await supabase.from("blog_posts").select("*").order("created_at",{ascending:false});return <BlogManager initial={data||[]}/>}
