'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar role="manager" />
      <div className="flex flex-col flex-1">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}