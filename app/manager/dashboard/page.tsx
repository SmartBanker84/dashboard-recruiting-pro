"use client";

import ManagerDashboard from "@/components/ManagerDashboard";
import { createClientSupabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export default async function ManagerDashboardPage() {
  const supabase = createClientSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  return <ManagerDashboard userId={user.id} role="manager" />;
}