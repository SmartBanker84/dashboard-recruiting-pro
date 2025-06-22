

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authHelpers, dbHelpers } from "@/lib/supabase";
import ManagerDashboard from "@/components/ManagerDashboard";

export default function ManagerDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { user, error } = await authHelpers.getCurrentUser();
      if (error || !user) {
        router.push("/");
        return;
      }
      setUser(user);

      const { data: profile, error: profileError } = await authHelpers.getUserProfile(user.id);

      if (profileError || profile?.role !== "manager") {
        router.push("/");
        return;
      }
      setProfile(profile);

      setIsAuthorized(true);
      setIsLoading(false);
    };

    checkUser();
  }, [router]);

  if (isLoading) {
    return (
      <main className="p-8">
        <p>Caricamento in corso...</p>
      </main>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <main className="p-4">
      <ManagerDashboard userId={user?.id} role={profile?.role} />
    </main>
  );
}