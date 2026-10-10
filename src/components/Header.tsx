import React from 'react';
import { Bell, Search, Menu, ChevronDown, User, LogOut, ShoppingCart, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const { items, setIsCartOpen } = useCart();
  
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const openCopilot = () => {
    window.dispatchEvent(new CustomEvent('open-copilot'));
  };
  
  return (
    <header className="h-14 bg-white/90 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-2.5 sm:px-4 z-10 sticky top-0 transition-all shrink-0 shadow-xs">
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        <button 
          onClick={toggleSidebar} 
          className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors shrink-0"
          aria-label="Toggle navigation sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium truncate">
          <span className="text-zinc-900 font-bold tracking-tight">AgriGPT OS</span>
          <span className="text-zinc-300 hidden sm:inline">/</span>
          <button className="hidden sm:flex items-center gap-1.5 text-zinc-600 font-medium hover:bg-zinc-100 px-2 py-1 rounded-md transition-colors text-xs">
            AgriGPT Pro <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <LanguageSwitcher />

        <button
          onClick={openCopilot}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all"
          title="Open embedded AgriGPT Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
          title="Shopping Cart"
        >
          <ShoppingCart className="w-4 h-4" />
          {cartItemCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </button>
        <button className="relative p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </button>
        <div className="h-4 w-px bg-zinc-200 mx-0.5 sm:mx-1"></div>
        <div className="flex items-center gap-2 ml-0.5">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-semibold text-zinc-800 leading-none">{user?.name || 'Guest'}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5 capitalize">{user?.role || 'user'}</div>
          </div>
          <button className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold hover:border-emerald-500 transition-colors uppercase text-xs">
            {user?.name?.[0] || <User className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
}
