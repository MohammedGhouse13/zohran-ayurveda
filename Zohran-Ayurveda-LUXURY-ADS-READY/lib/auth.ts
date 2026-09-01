import { createClient } from "./supabase/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("UNAUTHORIZED");

  const role =
    (user.app_metadata?.role as string | undefined) ||
    (user.user_metadata?.role as string | undefined);

  if (role !== "admin") throw new Error("FORBIDDEN");
  return { supabase, user };
}
