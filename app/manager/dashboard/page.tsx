"use client";

import { useRouter } from "next/navigation";
import ManagerDashboard from "@/components/ManagerDashboard";
import { createClientSupabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import type { User } from "@supabase/auth-helpers-nextjs";

export default function ManagerDashboardPage() {
  const router = useRouter();
  const supabase = createClientSupabase();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
      } else {
        setUser(user);
      }
    };
    fetchUser();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (!user) return null;

  return (
    <ManagerDashboard
      userId={user.id}
      email={user.email ?? ""}
      fullName={user.user_metadata?.full_name ?? ""}
      role="manager"
      onLogout={handleSignOut}
    />
  );
}