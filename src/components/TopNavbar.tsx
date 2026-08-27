import React, { useState, useRef, useEffect } from 'react';
import { User, NavigationTab, Product, Transaction, GoogleSheetsSyncState } from '../types';
import { getProductStockSummary } from '../utils/stockCalculator';

interface TopNavbarProps {
  activeTab: NavigationTab;
  user: User;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggleMobileMenu: () => void;
  onLogout: () => void;
  onNavigate: (tab: NavigationTab) => void;
  onOpenCriticalMessageModal?: (supplierName?: string) => void;
  products?: Product[];
  transactions?: Transaction[];
  syncState?: GoogleSheetsSyncState;
  onOpenGoogleSheetsModal?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  user,
  searchQuery,
  onSearchChange,
  onToggleMobileMenu,
  onLogout,
  onNavigate,
  onOpenCriticalMessageModal,
  products = [],
  transactions = [],
  syncState,
  onOpenGoogleSheetsModal,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Generate dynamic real-time notifications from critical products
  const criticalProductsWithSummary = products
    .map((p) => ({
      product: p,
      summary: getProductStockSummary(p, transactions),
    }))
    .filter(({ summary }) => summary.health === 'Habis' || summary.health === 'Menipis');

  const notificationsList = criticalProductsWithSummary.map(({ product: p, summary }, idx) => {
    return {
      id: idx + 1,
      title: summary.health === 'Habis' ? 'Stok Produk Habis!' : 'Stok Kritis Terdeteksi',
      message: `${p.name} (${p.code}) tersisa ${summary.currentStock} ${p.unit} (Batas minimum: ${p.minStock}).`,
      time: 'Baru saja',
      unread: true,
      type: 'warning',
      supplier: p.supplier,
    };
  });

  const unreadCount = notificationsList.length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'produk':
        return null; // Has search bar in header as in Image 6
      case 'stok':
        return 'Manajemen Stok';
      case 'transaksi':
        return 'Riwayat Transaksi';
      case 'supplier':
        return 'Daftar Supplier';
      case 'laporan':
        return 'Laporan Stok';
      case 'setting':
        return 'Pengaturan Sistem';
      default:
        return 'Inventory System';
    }
  };

  const title = getHeaderTitle();

  return (
    <header
      id="top-navbar"
      className="bg-[#fbf8ff] flex justify-between items-center px-4 md:px-6 py-3 border-b border-[#c4c5d5]/50 sticky top-0 z-20 w-full min-h-[60px] shrink-0"
    >
      {/* Left side: Mobile menu toggle + Header Title & Search Input */}
      <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
        <button
          id="btn-mobile-menu"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-[#444653] hover:bg-[#e8e7f1] rounded-lg transition-colors shrink-0"
          title="Buka Menu Navigasi"
          aria-label="Buka Menu Navigasi"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {activeTab === 'produk' ? (
          <div className="flex items-center gap-3 w-full max-w-lg">
            <h2 className="hidden sm:inline-block text-[18px] md:text-[20px] font-bold text-[#1a1b22] tracking-tight shrink-0">
              Data Produk
            </h2>
            <div className="relative flex-1 min-w-[140px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#757684]">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </div>
              <input
                id="top-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari kode / nama produk..."
                className="block w-full pl-9 pr-3 py-1.5 border border-[#c4c5d5] rounded-lg bg-[#ffffff] text-[#1a1b22] placeholder-[#757684] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] text-[13px] transition-all"
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-[18px] md:text-[20px] font-bold text-[#1a1b22] tracking-tight truncate">
              {title}
            </h2>
          </div>
        )}
      </div>

      {/* Right side: Quick Info, Notifications & User Avatar */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0 relative">
        {/* Google Sheets Realtime Sync Button */}
        {onOpenGoogleSheetsModal && (
          <button
            id="btn-google-sheets-sync"
            type="button"
            onClick={onOpenGoogleSheetsModal}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all border cursor-pointer ${
              syncState?.isConnected
                ? 'bg-[#6cf8bb]/15 text-[#00714d] border-[#6cf8bb]/40 hover:bg-[#6cf8bb]/25'
                : 'bg-[#f4f2fc] text-[#444653] border-[#c4c5d5]/50 hover:bg-[#eeedf7]'
            }`}
            title="Sinkronisasi Google Spreadsheet Realtime"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
              <path d="M7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z" />
            </svg>
            <span>{syncState?.isConnected ? 'Sheets Sync: Aktif' : 'Hubungkan Sheets'}</span>
            {syncState?.isSyncing && (
              <span className="w-2 h-2 rounded-full bg-[#00288e] animate-ping" />
            )}
          </button>
        )}

        {/* Notifications Button */}
        <div className="relative" ref={notifRef}>
          <button
            id="btn-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-[#444653] hover:bg-[#e8e7f1] rounded-full transition-colors relative"
            title="Notifikasi"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              id="notifications-dropdown"
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#ffffff] rounded-xl shadow-lg border border-[#c4c5d5]/40 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="px-4 pb-2 border-b border-[#c4c5d5]/30 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-[14px] text-[#1a1b22]">Notifikasi Sistem</h4>
                  <p className="text-[11px] text-[#757684]">
                    {unreadCount > 0 ? `${unreadCount} peringatan stok aktif` : 'Semua stok aman'}
                  </p>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-[#c4c5d5]/20">
                {notificationsList.length > 0 ? (
                  notificationsList.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3.5 hover:bg-[#f4f2fc] transition-colors flex gap-3 bg-[#eeedf7]/40"
                    >
                      <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5 text-[#ba1a1a]">
                        warning
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-[13px] text-[#1a1b22]">{notif.title}</p>
                        <p className="text-[12px] text-[#444653] mt-0.5 leading-snug">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] text-[#757684]">
                            {notif.time}
                          </span>
                          {onOpenCriticalMessageModal && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowNotifications(false);
                                onOpenCriticalMessageModal(notif.supplier);
                              }}
                              className="flex items-center gap-1 text-[11px] font-bold text-[#ba1a1a] hover:underline cursor-pointer bg-[#ffdad6]/60 px-2 py-0.5 rounded-full"
                            >
                              <span className="material-symbols-outlined text-[13px]">forward_to_inbox</span>
                              <span>Pesan Supplier</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 px-4 text-center text-[#757684]">
                    <span className="material-symbols-outlined text-[32px] text-[#006c49] mb-1">
                      check_circle
                    </span>
                    <p className="text-[13px] font-medium text-[#1a1b22]">Tidak Ada Notifikasi</p>
                    <p className="text-[11px] text-[#757684] mt-0.5">
                      Semua stok barang berada dalam batas aman.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            id="btn-user-profile"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-full p-0.5 border-2 border-[#c4c5d5] hover:border-[#00288e] transition-all focus:outline-none focus:ring-2 focus:ring-[#00288e]/30"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-[#dde1ff] flex items-center justify-center text-[#00288e] font-bold text-sm">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{user.initials}</span>
              )}
            </div>
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div
              id="profile-dropdown"
              className="absolute right-0 mt-2 w-64 bg-[#ffffff] rounded-xl shadow-lg border border-[#c4c5d5]/40 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="px-4 py-3 border-b border-[#c4c5d5]/30">
                <p className="font-semibold text-[14px] text-[#1a1b22]">{user.name}</p>
                <p className="text-[12px] text-[#00288e] font-medium">{user.role}</p>
                <p className="text-[11px] text-[#757684] mt-0.5 truncate">{user.email}</p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigate('setting');
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-[13px] text-[#444653] hover:bg-[#f4f2fc] flex items-center gap-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#757684]">
                    settings
                  </span>
                  <span>Pengaturan Akun</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('laporan');
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-[13px] text-[#444653] hover:bg-[#f4f2fc] flex items-center gap-2.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#757684]">
                    assessment
                  </span>
                  <span>Laporan Cepat</span>
                </button>
              </div>

              <div className="pt-1 border-t border-[#c4c5d5]/30">
                <button
                  id="btn-logout"
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-[13px] text-[#ba1a1a] hover:bg-[#ffdad6]/40 flex items-center gap-2.5 transition-colors font-medium"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#ba1a1a]">
                    logout
                  </span>
                  <span>Keluar (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
