import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import './globals.css';
import { AppProvider } from '@/components/context/AppContext';

export default function RoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <div className="flex min-h-screen bg-secondary-50 text-secondary-900">
        {/* Sidebar fissa a sinistra */}
        <aside className="hidden lg:block lg:w-64 border-r border-secondary-200 bg-white shadow-md z-20">
          <Sidebar role="manager" />
        </aside>

        {/* Contenuto principale con Topbar */}
        <div className="flex flex-col flex-1 min-h-screen overflow-hidden">
          <header className="sticky top-0 z-30 bg-white border-b border-secondary-200 shadow-sm">
            <Topbar />
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 bg-secondary-50">
            {children}
          </main>
        </div>
      </div>

      {/* Toast & Modal */}
      <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2" />
      <div id="modal-container" />
    </AppProvider>
  );
}
