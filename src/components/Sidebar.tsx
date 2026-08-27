import React from 'react';
import { NavigationTab } from '../types';
import { APP_LOGO_URL } from '../data/initialData';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  lowStockCount?: number;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isMobileOpen,
  onCloseMobile,
  lowStockCount,
  onLogout,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'produk', label: 'Produk', icon: 'inventory_2' },
    { id: 'stok', label: 'Stok', icon: 'inventory', badge: lowStockCount && lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'transaksi', label: 'Transaksi', icon: 'swap_horiz' },
    { id: 'supplier', label: 'Supplier', icon: 'storefront' },
    { id: 'laporan', label: 'Laporan', icon: 'assessment' },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="sidebar"
        className={`fixed md:relative inset-y-0 left-0 z-50 md:z-10 w-[260px] h-screen md:h-full shrink-0 border-r border-[#c4c5d5]/50 bg-[#fbf8ff] flex flex-col py-5 px-4 transition-transform md:transition-none duration-200 ease-in-out shadow-lg md:shadow-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden absolute top-4 right-4 p-1.5 text-[#444653] hover:bg-[#e8e7f1] rounded-lg transition-colors"
          title="Tutup Menu"
          aria-label="Tutup Menu"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Brand Header */}
        <div className="mb-6 px-2 text-center flex flex-col items-center">
          <div className="w-16 h-20 mb-2 flex items-center justify-center p-0.5">
            <img
              src={APP_LOGO_URL}
              alt="ADDA RASA Logo"
              className="w-full h-full object-contain drop-shadow-xs"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-bold text-[18px] text-[#00288e] tracking-tight leading-tight">
            ADDA RASA KJD
          </h1>
          <p className="text-[11px] font-semibold text-[#444653] uppercase tracking-widest mt-0.5">
            Inventory System
          </p>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 space-y-1.5 font-medium text-[14px] overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onTabChange(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all text-left group ${
                  isActive
                    ? 'text-[#00288e] font-bold bg-[#00288e]/10 shadow-xs'
                    : 'text-[#444653] hover:bg-[#e8e7f1] hover:text-[#1a1b22]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`material-symbols-outlined text-[22px] transition-transform group-hover:scale-105 shrink-0 ${
                      isActive ? 'fill text-[#00288e]' : 'text-[#757684]'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#ba1a1a] text-white shrink-0">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Bottom Setting Action */}
        <div className="mt-auto pt-3 border-t border-[#c4c5d5]/40 space-y-1">
          <button
            id="nav-item-setting"
            onClick={() => {
              onTabChange('setting');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl transition-all text-left ${
              activeTab === 'setting' || activeTab === 'pengaturan'
                ? 'text-[#00288e] font-bold bg-[#00288e]/10 shadow-xs'
                : 'text-[#444653] hover:bg-[#e8e7f1] hover:text-[#1a1b22]'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                activeTab === 'setting' || activeTab === 'pengaturan'
                  ? 'fill text-[#00288e]'
                  : 'text-[#757684]'
              }`}
            >
              settings
            </span>
            <span>Pengaturan</span>
          </button>

          {onLogout && (
            <button
              onClick={() => {
                onCloseMobile();
                onLogout();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-2 rounded-xl text-[13px] text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors text-left font-medium"
            >
              <span className="material-symbols-outlined text-[20px] text-[#ba1a1a]">
                logout
              </span>
              <span>Keluar</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
