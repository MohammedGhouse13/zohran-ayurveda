
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(".env.local","utf8")
    .split(/\r?\n/)
    .filter(x=>x && !x.startsWith("#") && x.includes("="))
    .map(x=>{const i=x.indexOf("="); return [x.slice(0,i),x.slice(i+1)]})
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken:false, persistSession:false }
});

const email = process.argv[2];
const password = process.argv[3];

if(!email || !password){
  console.error("Usage: node scripts/create-admin.mjs admin@example.com 'StrongPasswordHere'");
  process.exit(1);
}

const {data,error}=await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm:true,
  app_metadata:{role:"admin"}
});

if(error) throw error;
console.log(`Admin created: ${data.user.email}`);
console.log("Open /login and use these credentials.");
