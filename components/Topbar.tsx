'use client';

import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

export default function Topbar() {
  const router = useRouter();

  const handleLogout = async () => {
    // Puoi integrare Supabase o qualsiasi auth logic qui
    // Esempio con Supabase:
    // await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
      <div className="text-xl font-semibold text-primary-700">Dashboard</div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-secondary-700">
          <User className="h-5 w-5" />
          <span>Benvenuto</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5 text-red-600" />
        </Button>
      </div>
    </header>
  );
}
