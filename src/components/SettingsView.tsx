import React, { useState } from 'react';
import { User, GoogleSheetsSyncState, Product, Supplier, Transaction } from '../types';
import { APP_LOGO_URL } from '../data/initialData';
import { UserAccountModal } from './UserAccountModal';

interface SettingsViewProps {
  user: User;
  users: User[];
  onUpdateUser: (updated: Partial<User>) => void;
  onAddUser?: (newUser: Omit<User, 'id'> | User) => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (userId: string) => void;
  onToggleUserStatus?: (userId: string) => void;
  onLogout: () => void;
  syncState?: GoogleSheetsSyncState;
  onConnectGoogle?: () => Promise<void>;
  onDisconnectGoogle?: () => Promise<void>;
  onSyncNow?: (direction: 'push' | 'pull' | 'both') => Promise<void>;
  onToggleAutoSync?: (enabled: boolean) => void;
  products?: Product[];
  suppliers?: Supplier[];
  transactions?: Transaction[];
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  users,
  onUpdateUser,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onToggleUserStatus,
  onLogout,
  syncState,
  onConnectGoogle,
  onDisconnectGoogle,
  onSyncNow,
  onToggleAutoSync,
  products = [],
  suppliers = [],
  transactions = [],
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'inventory' | 'sheets'>('profile');
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // Profile Form States
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [phone, setPhone] = useState(user.phone || '+62 812-9988-7711');
  const [password, setPassword] = useState(user.password || '');
  const [lowStockThreshold, setLowStockThreshold] = useState(15);
  const [enableEmailAlerts, setEnableEmailAlerts] = useState(true);
  const [enableDailySummary, setEnableDailySummary] = useState(true);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // User Management States
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleAction = async (actionFn: (() => Promise<void>) | undefined, name: string) => {
    if (!actionFn) return;
    try {
      setActiveAction(name);
      await actionFn();
      showToast(`Sukses: ${name} berhasil diselesaikan!`);
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Gagal memproses tindakan.'}`);
    } finally {
      setActiveAction(null);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name, email, role, phone, password: password || undefined });
    showToast('Profil pengguna berhasil diperbarui!');
  };

  const handleOpenAddUser = () => {
    setUserToEdit(null);
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (targetUser: User) => {
    setUserToEdit(targetUser);
    setIsUserModalOpen(true);
  };

  const handleSaveUserModal = (userData: User | Omit<User, 'id'>) => {
    if (userToEdit && onEditUser) {
      onEditUser(userData as User);
      showToast(`Akun ${(userData as User).name} berhasil diperbarui.`);
    } else if (onAddUser) {
      onAddUser(userData);
      showToast(`Akun pengguna baru berhasil ditambahkan.`);
    }
  };

  const handleDeleteUserConfirm = () => {
    if (deleteConfirmUser && onDeleteUser) {
      if (deleteConfirmUser.username === user.username) {
        alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.');
        setDeleteConfirmUser(null);
        return;
      }
      onDeleteUser(deleteConfirmUser.id || deleteConfirmUser.username);
      showToast(`Akun ${deleteConfirmUser.name} berhasil dihapus.`);
      setDeleteConfirmUser(null);
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const q = userSearchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const activeUsersCount = users.filter((u) => u.status !== 'Nonaktif').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-[#1a1b22] tracking-tight">
            Pengaturan Sistem & Pengguna
          </h2>
          <p className="text-[14px] text-[#444653] mt-0.5">
            Kelola profil akun, daftar seluruh pengguna terhubung, dan preferensi inventaris.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1 bg-[#f4f2fc] rounded-2xl border border-[#c4c5d5]/40 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-[#00288e] shadow-xs'
                : 'text-[#757684] hover:text-[#1a1b22]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">badge</span>
            <span>Profil Saya</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-white text-[#00288e] shadow-xs'
                : 'text-[#757684] hover:text-[#1a1b22]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">group</span>
            <span>Daftar Pengguna ({users.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-white text-[#00288e] shadow-xs'
                : 'text-[#757684] hover:text-[#1a1b22]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Preferensi Stok</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sheets')}
            className={`px-4 py-2 rounded-xl text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sheets'
                ? 'bg-white text-[#00288e] shadow-xs'
                : 'text-[#757684] hover:text-[#1a1b22]'
            }`}
          >
            <svg className="w-4 h-4 text-[#34A853]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
              <path d="M7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z" />
            </svg>
            <span>Google Spreadsheet</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {saveToast && (
        <div className="p-3.5 bg-[#6cf8bb]/20 border border-[#006c49]/30 text-[#00714d] rounded-2xl flex items-center gap-2 text-[14px] font-semibold animate-in fade-in">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{saveToast}</span>
        </div>
      )}

      {/* TAB 1: PROFIL SAYA */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-[24px] p-6 sm:p-8 ambient-shadow border border-[#c4c5d5]/30 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#c4c5d5]/20">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-[#dde1ff] border-2 border-[#00288e]/20 flex items-center justify-center text-[#00288e] text-2xl font-bold shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                user.initials
              )}
            </div>
            <div className="text-center sm:text-left flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h4 className="font-bold text-[18px] text-[#1a1b22]">{user.name}</h4>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#dde1ff] text-[#00288e] w-fit mx-auto sm:mx-0">
                  {user.role}
                </span>
              </div>
              <p className="text-[13px] text-[#757684] mt-0.5">
                Username: <strong className="text-[#1a1b22] font-mono">@{user.username}</strong> • ADDA RASA KJD Headquarter
              </p>
              <p className="text-[12px] text-[#757684]">
                Status Akun: <strong className="text-[#00714d]">Aktif</strong> • Terdaftar sejak: {user.createdAt || '2024-01-15'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-[#444653] mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#c4c5d5] rounded-xl text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#444653] mb-1.5">
                  Email Akun
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#c4c5d5] rounded-xl text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#444653] mb-1.5">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#c4c5d5] rounded-xl text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#444653] mb-1.5">
                  Role / Jabatan
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-[#c4c5d5] rounded-xl text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#444653] mb-1.5">
                  Username Login
                </label>
                <input
                  type="text"
                  value={user.username}
                  disabled
                  className="w-full px-3.5 py-2.5 border border-[#c4c5d5]/50 rounded-xl text-[14px] bg-[#e8e7f1]/50 text-[#757684] cursor-not-allowed font-mono"
                />
              </div>

              <div>
                <label className="block text-[12px] font-bold text-[#444653] mb-1.5">
                  Ganti Kata Sandi (Password)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin ganti sandi"
                  className="w-full px-3.5 py-2.5 border border-[#c4c5d5] rounded-xl text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#00288e] text-white rounded-xl text-[13px] font-bold hover:bg-[#1e40af] transition-all shadow-xs cursor-pointer"
              >
                Simpan Perubahan Profil
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: DAFTAR PENGGUNA TERHUBUNG */}
      {activeTab === 'users' && (
        <div className="space-y-5">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-[20px] p-5 ambient-shadow border border-[#c4c5d5]/30 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold text-[#757684]">Total Akun Terdaftar</p>
                <h4 className="text-[24px] font-extrabold text-[#1a1b22] mt-0.5">
                  {users.length} <span className="text-[13px] font-normal text-[#757684]">Pengguna</span>
                </h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#00288e]/10 text-[#00288e] flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">groups</span>
              </div>
            </div>

            <div className="bg-white rounded-[20px] p-5 ambient-shadow border border-[#c4c5d5]/30 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold text-[#757684]">Akun Aktif</p>
                <h4 className="text-[24px] font-extrabold text-[#00714d] mt-0.5">
                  {activeUsersCount} <span className="text-[13px] font-normal text-[#757684]">User</span>
                </h4>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#6cf8bb]/20 text-[#00714d] flex items-center justify-center">
                <span className="material-symbols-outlined text-[26px]">check_circle</span>
              </div>
            </div>

            <div className="bg-white rounded-[20px] p-5 ambient-shadow border border-[#c4c5d5]/30 flex items-center justify-between">
              <div>
                <p className="text-[12px] font-semibold text-[#757684]">Akun Anda Saat Ini</p>
                <h4 className="text-[18px] font-bold text-[#00288e] mt-0.5 truncate max-w-[150px]">
                  @{user.username}
                </h4>
                <p className="text-[11px] text-[#757684]">{user.role}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#dde1ff] text-[#00288e] flex items-center justify-center font-bold">
                {user.initials}
              </div>
            </div>
          </div>

          {/* User Table Header & Search */}
          <div className="bg-white rounded-[24px] ambient-shadow border border-[#c4c5d5]/30 overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#c4c5d5]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757684] text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Cari nama, username, role..."
                  className="w-full pl-10 pr-3 py-2 border border-[#c4c5d5] rounded-xl text-[13px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                />
              </div>

              <button
                type="button"
                id="btn-tambah-user"
                onClick={handleOpenAddUser}
                className="w-full sm:w-auto px-4 py-2 bg-[#00288e] text-white rounded-xl text-[12px] font-bold hover:bg-[#1e40af] transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>+ Tambah Akun Pengguna</span>
              </button>
            </div>

            {/* Table of Registered Users */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#c4c5d5]/40">
                <thead className="bg-[#eeedf7]/60">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-[12px] font-bold text-[#444653] uppercase tracking-wider">
                      Pengguna & Username
                    </th>
                    <th className="px-6 py-3.5 text-left text-[12px] font-bold text-[#444653] uppercase tracking-wider">
                      Role / Hak Akses
                    </th>
                    <th className="px-6 py-3.5 text-left text-[12px] font-bold text-[#444653] uppercase tracking-wider">
                      Kontak
                    </th>
                    <th className="px-6 py-3.5 text-center text-[12px] font-bold text-[#444653] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-[12px] font-bold text-[#444653] uppercase tracking-wider">
                      Terdaftar Sejak
                    </th>
                    <th className="px-6 py-3.5 text-right text-[12px] font-bold text-[#444653] uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c4c5d5]/30 bg-white text-[13px]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-[#757684]">
                        Tidak ada akun pengguna yang sesuai pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isCurrent = u.username === user.username;
                      const isActive = u.status !== 'Nonaktif';

                      return (
                        <tr
                          key={u.id || u.username}
                          className={`hover:bg-[#f4f2fc]/60 transition-colors ${
                            isCurrent ? 'bg-[#00288e]/5' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-[#dde1ff] text-[#00288e] flex items-center justify-center font-bold text-[13px] shrink-0">
                                {u.avatar ? (
                                  <img
                                    src={u.avatar}
                                    alt={u.name}
                                    className="w-full h-full object-cover rounded-xl"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  u.initials || u.name.slice(0, 2).toUpperCase()
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-[#1a1b22]">{u.name}</span>
                                  {isCurrent && (
                                    <span className="text-[10px] font-bold bg-[#00288e] text-white px-1.5 py-0.2 rounded-full">
                                      Anda
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-[12px] text-[#757684]">
                                  @{u.username}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-medium text-[#1a1b22]">{u.role}</span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-[#444653]">
                            <div>{u.email}</div>
                            <div className="text-[11px] text-[#757684]">{u.phone || '-'}</div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                isActive
                                  ? 'bg-[#6cf8bb]/20 text-[#00714d] border-[#6cf8bb]/30'
                                  : 'bg-[#ffdad6]/40 text-[#ba1a1a] border-[#ffdad6]'
                              }`}
                            >
                              {u.status || 'Aktif'}
                            </span>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-[#757684] text-[12px]">
                            {u.createdAt || '2024-01-15'}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              {onToggleUserStatus && !isCurrent && (
                                <button
                                  type="button"
                                  onClick={() => onToggleUserStatus(u.id || u.username)}
                                  title={isActive ? 'Bekukan / Nonaktifkan Akun' : 'Aktifkan Akun'}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    isActive
                                      ? 'text-[#757684] hover:bg-[#eeedf7]'
                                      : 'text-[#00714d] hover:bg-[#6cf8bb]/20'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[18px]">
                                    {isActive ? 'block' : 'lock_open'}
                                  </span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(u)}
                                title="Edit Akun Pengguna"
                                className="p-1.5 text-[#00288e] hover:bg-[#00288e]/10 rounded-lg transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>

                              {!isCurrent && onDeleteUser && (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmUser(u)}
                                  title="Hapus Akun Pengguna"
                                  className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded-lg transition-colors cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PREFERENSI STOK & NOTIFIKASI */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-[24px] p-6 sm:p-8 ambient-shadow border border-[#c4c5d5]/30 space-y-6">
          <h3 className="text-[18px] font-bold text-[#1a1b22] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00288e]">notifications_active</span>
            Notifikasi & Ambang Batas Stok
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f4f2fc] border border-[#c4c5d5]/30">
              <div>
                <h5 className="font-bold text-[14px] text-[#1a1b22]">
                  Peringatan Stok Menipis Otomatis
                </h5>
                <p className="text-[12px] text-[#757684]">
                  Kirim pemberitahuan saat stok produk di bawah batas minimum
                </p>
              </div>
              <input
                type="checkbox"
                checked={enableEmailAlerts}
                onChange={(e) => setEnableEmailAlerts(e.target.checked)}
                className="w-5 h-5 accent-[#00288e] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f4f2fc] border border-[#c4c5d5]/30">
              <div>
                <h5 className="font-bold text-[14px] text-[#1a1b22]">
                  Laporan Ringkasan Harian
                </h5>
                <p className="text-[12px] text-[#757684]">
                  Rekapitulasi transaksi masuk dan keluar setiap pukul 18:00 WIB
                </p>
              </div>
              <input
                type="checkbox"
                checked={enableDailySummary}
                onChange={(e) => setEnableDailySummary(e.target.checked)}
                className="w-5 h-5 accent-[#00288e] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f4f2fc] border border-[#c4c5d5]/30">
              <div>
                <h5 className="font-bold text-[14px] text-[#1a1b22]">
                  Default Ambang Batas Minimum Stok
                </h5>
                <p className="text-[12px] text-[#757684]">
                  Kuantitas default minimum stok untuk produk baru
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  className="w-20 px-3 py-1.5 border border-[#c4c5d5] rounded-xl text-right font-mono text-[14px] bg-white focus:outline-none focus:border-[#00288e]"
                />
                <span className="text-[13px] text-[#444653] font-medium">unit</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Google Spreadsheet Sync */}
      {activeTab === 'sheets' && (
        <div className="space-y-6">
          {/* Connection Status Card */}
          <div className="bg-white rounded-[24px] p-6 sm:p-7 ambient-shadow border border-[#c4c5d5]/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#c4c5d5]/30">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#34A853]/10 text-[#34A853] flex items-center justify-center border border-[#34A853]/20">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                    <path d="M7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[18px] font-bold text-[#1a1b22]">
                      Integrasi Google Spreadsheet
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        syncState?.isConnected
                          ? 'bg-[#6cf8bb]/30 text-[#00714d] border border-[#6cf8bb]/50'
                          : 'bg-[#ffdad6]/60 text-[#93000a] border border-[#ffdad6]'
                      }`}
                    >
                      {syncState?.isConnected ? 'Terhubung & Aktif' : 'Belum Terhubung'}
                    </span>
                  </div>
                  <p className="text-[13px] text-[#444653] mt-0.5">
                    Data master produk, supplier, dan transaksi otomatis tersinkronisasi realtime ke spreadsheet.
                  </p>
                </div>
              </div>

              {syncState?.isConnected ? (
                <div className="flex items-center gap-3">
                  <span className="text-[12px] text-[#006c49] font-medium hidden md:inline">
                    Terhubung ({syncState.userEmail || 'Google User'})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAction(onDisconnectGoogle, 'Putus Koneksi Google')}
                    disabled={activeAction !== null}
                    className="px-4 py-2 border border-[#ba1a1a]/40 text-[#ba1a1a] rounded-xl hover:bg-[#ffdad6]/40 text-[13px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Putus Akun Google
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleAction(onConnectGoogle, 'Koneksi Google')}
                  disabled={activeAction !== null}
                  className="flex items-center gap-2.5 px-5 py-2.5 bg-white text-[#1a1b22] border border-[#c4c5d5] rounded-xl font-bold shadow-xs hover:bg-[#fbf8ff] text-[13px] transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{activeAction === 'Koneksi Google' ? 'Membuka Pop-up...' : 'Hubungkan Google (Pop-up)'}</span>
                </button>
              )}
            </div>

            {/* Target Spreadsheet Details */}
            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-2xl bg-[#f4f2fc] border border-[#c4c5d5]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-[#757684] uppercase tracking-wider block">
                    ID Spreadsheet Terhubung
                  </span>
                  <p className="font-mono text-[14px] font-bold text-[#00288e] mt-0.5 select-all break-all">
                    {syncState?.spreadsheetId || '1hKkT_Tr_MYd2Puy9KCrxdDOvlDwShth5Un7G5P7MHMg'}
                  </p>
                </div>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${syncState?.spreadsheetId || '1hKkT_Tr_MYd2Puy9KCrxdDOvlDwShth5Un7G5P7MHMg'}/edit`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-[#c4c5d5]/50 text-[#00288e] rounded-xl text-[13px] font-bold hover:bg-[#eeedf7] transition-all shrink-0 cursor-pointer shadow-2xs"
                >
                  <span>Buka Google Spreadsheet</span>
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </a>
              </div>

              {/* Data Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-[#ffffff] border border-[#c4c5d5]/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[#757684]">Sheet "Produk"</span>
                    <span className="material-symbols-outlined text-[20px] text-[#00288e]">inventory_2</span>
                  </div>
                  <div className="mt-2 text-[22px] font-bold text-[#1a1b22] font-mono">
                    {products.length} <span className="text-[13px] font-normal text-[#757684]">Barang</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#ffffff] border border-[#c4c5d5]/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[#757684]">Sheet "Supplier"</span>
                    <span className="material-symbols-outlined text-[20px] text-[#00288e]">local_shipping</span>
                  </div>
                  <div className="mt-2 text-[22px] font-bold text-[#1a1b22] font-mono">
                    {suppliers.length} <span className="text-[13px] font-normal text-[#757684]">Rekanan</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#ffffff] border border-[#c4c5d5]/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-[#757684]">Sheet "Transaksi"</span>
                    <span className="material-symbols-outlined text-[20px] text-[#00288e]">receipt_long</span>
                  </div>
                  <div className="mt-2 text-[22px] font-bold text-[#1a1b22] font-mono">
                    {transactions.length} <span className="text-[13px] font-normal text-[#757684]">Mutasi</span>
                  </div>
                </div>
              </div>

              {/* Sync Actions & Auto-Sync Switch */}
              <div className="p-5 rounded-2xl bg-[#f4f2fc]/60 border border-[#c4c5d5]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-[14px] text-[#1a1b22]">Sinkronisasi Otomatis Realtime</h4>
                  <p className="text-[12px] text-[#757684]">
                    Setiap penambahan, edit stok, dan transaksi langsung dikirim ke spreadsheet tanpa perlu tombol manual.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={syncState?.autoSync ?? true}
                    onChange={(e) => onToggleAutoSync && onToggleAutoSync(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00288e]"></div>
                </label>
              </div>

              {/* Manual Trigger Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleAction(() => (onSyncNow ? onSyncNow('push') : Promise.resolve()), 'Kirim Data ke Sheet')}
                  disabled={activeAction !== null}
                  className="px-5 py-2.5 bg-[#00288e] text-white rounded-xl text-[13px] font-bold hover:bg-[#1e40af] transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  <span>{activeAction === 'Kirim Data ke Sheet' ? 'Mengunggah...' : 'Upload Semua Data ke Google Sheet'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(() => (onSyncNow ? onSyncNow('pull') : Promise.resolve()), 'Tarik Data dari Sheet')}
                  disabled={activeAction !== null}
                  className="px-5 py-2.5 bg-white text-[#00288e] border border-[#00288e] rounded-xl text-[13px] font-bold hover:bg-[#f4f2fc] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">cloud_download</span>
                  <span>{activeAction === 'Tarik Data dari Sheet' ? 'Mengunduh...' : 'Tarik Data Terbaru dari Google Sheet'}</span>
                </button>
              </div>

              {syncState?.lastSyncedAt && (
                <p className="text-[12px] text-[#757684]">
                  Waktu sinkronisasi terakhir: <span className="font-semibold text-[#1a1b22]">{syncState.lastSyncedAt}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* System Information & Logout */}
      <div className="bg-white rounded-[24px] p-6 sm:p-7 ambient-shadow border border-[#c4c5d5]/30 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-14 flex items-center justify-center shrink-0">
            <img
              src={APP_LOGO_URL}
              alt="ADDA RASA"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h5 className="font-bold text-[14px] text-[#1a1b22]">
              ADDA RASA KJD Inventory System
            </h5>
            <p className="font-mono text-[12px] text-[#757684]">Versi 2.4.1 (Stable Build 2026)</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-5 py-2.5 border border-[#ba1a1a]/40 text-[#ba1a1a] rounded-xl hover:bg-[#ffdad6]/40 transition-colors text-[13px] font-bold cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Keluar dari Aplikasi</span>
        </button>
      </div>

      {/* User Add/Edit Modal */}
      <UserAccountModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onSave={handleSaveUserModal}
        userToEdit={userToEdit}
        existingUsers={users}
      />

      {/* Delete User Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-[#c4c5d5]/40 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">delete_forever</span>
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-[#1a1b22]">
                Hapus Akun Pengguna?
              </h4>
              <p className="text-[13px] text-[#444653] mt-1">
                Apakah Anda yakin ingin menghapus akun <strong>{deleteConfirmUser.name}</strong> (@{deleteConfirmUser.username})? Pengguna ini tidak akan bisa login lagi.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 border border-[#c4c5d5] rounded-xl text-[13px] font-semibold text-[#444653] hover:bg-[#f4f2fc] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteUserConfirm}
                className="px-5 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-xl text-[13px] font-bold shadow-xs cursor-pointer"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
