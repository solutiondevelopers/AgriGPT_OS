import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CartDrawer } from './CartDrawer';
import { CopilotDrawer } from './CopilotDrawer';
import { VoiceCommandRouter } from './VoiceCommandRouter';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 relative bg-zinc-50 overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1 overflow-hidden relative">
          <Outlet />
        </main>
      </div>
      <CartDrawer />
      <CopilotDrawer />
      <VoiceCommandRouter />
    </div>
  );
}
