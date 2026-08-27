import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Omit<User, 'id'> | User) => void;
  userToEdit?: User | null;
  existingUsers: User[];
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  userToEdit,
  existingUsers,
}) => {
  const isEditing = !!userToEdit;

  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Operator Gudang');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      if (userToEdit) {
        setUsername(userToEdit.username);
        setName(userToEdit.name);
        setEmail(userToEdit.email);
        setPhone(userToEdit.phone || '');
        setRole(userToEdit.role);
        setPassword(userToEdit.password || '');
        setStatus(userToEdit.status || 'Aktif');
      } else {
        setUsername('');
        setName('');
        setEmail('');
        setPhone('');
        setRole('Operator Gudang');
        setPassword('');
        setStatus('Aktif');
      }
    }
  }, [isOpen, userToEdit]);

  if (!isOpen) return null;

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase() || 'US';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !name.trim() || !email.trim()) {
      setErrorMessage('Harap isi semua kolom wajib.');
      return;
    }

    // Check duplicate username if adding new
    if (
      !isEditing &&
      existingUsers.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())
    ) {
      setErrorMessage('Username ini sudah terdaftar. Silakan gunakan username lain.');
      return;
    }

    if (!isEditing && !password) {
      setErrorMessage('Silakan tentukan kata sandi untuk pengguna baru.');
      return;
    }

    const userData: User = {
      id: isEditing ? userToEdit.id : `usr-${Date.now()}`,
      username: username.trim().toLowerCase(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+62 812-0000-0000',
      role,
      password: password || '123456',
      avatar: isEditing ? userToEdit.avatar : '',
      initials: getInitials(name),
      status,
      createdAt: isEditing ? userToEdit.createdAt : new Date().toISOString().split('T')[0],
      lastLogin: isEditing ? userToEdit.lastLogin : '-',
    };

    onSave(userData);
    onClose();
  };

  const availableRoles = [
    'Inventory Manager',
    'Operator Gudang',
    'Supervisor Logistik',
    'Staff Purchasing',
    'Kepala Gudang',
    'Admin Keuangan',
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#c4c5d5]/40 animate-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center pb-4 border-b border-[#c4c5d5]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00288e]/10 text-[#00288e] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">
                {isEditing ? 'manage_accounts' : 'person_add'}
              </span>
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-[#1a1b22]">
                {isEditing ? 'Edit Akun Pengguna' : 'Tambah Akun Pengguna Baru'}
              </h3>
              <p className="text-[12px] text-[#444653]">
                Kelola hak akses dan informasi staf inventaris ADDA RASA KJD.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#757684] hover:bg-[#e8e7f1] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-[#ffdad6]/60 border border-[#ba1a1a]/30 text-[#93000a] text-[12px] font-medium rounded-xl flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[#444653] mb-1">
                Username Login <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isEditing}
                placeholder="Contoh: ahmad_fauzi"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-xl text-[13px] bg-[#fbf8ff] disabled:bg-[#eeedf7] disabled:text-[#757684] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#444653] mb-1">
                Nama Lengkap <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Ahmad Fauzi"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-xl text-[13px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[#444653] mb-1">
                Email Resmi <span className="text-[#ba1a1a]">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@addarasakjd.co.id"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-xl text-[13px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#444653] mb-1">
                No. HP / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+62 812-xxxx-xxxx"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-xl text-[13px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-[#444653] mb-1">
                Role / Hak Akses <span className="text-[#ba1a1a]">*</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-xl text-[13px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none font-medium"
              >
                {availableRoles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#444653] mb-1">
                Status Akun
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-xl text-[13px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none font-medium"
              >
                <option value="Aktif">Aktif (Dapat Login)</option>
                <option value="Nonaktif">Nonaktif (Dibekukan)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-bold text-[#444653] mb-1">
              Kata Sandi (Password) {!isEditing && <span className="text-[#ba1a1a]">*</span>}
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEditing ? 'Kosongkan jika tidak ingin mengubah sandi' : 'Minimal 6 karakter'}
              className="w-full px-3 py-2 border border-[#c4c5d5] rounded-xl text-[13px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#c4c5d5]/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#c4c5d5] rounded-xl text-[13px] font-semibold text-[#444653] hover:bg-[#f4f2fc] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00288e] hover:bg-[#1e40af] text-white rounded-xl text-[13px] font-bold shadow-xs transition-all cursor-pointer"
            >
              {isEditing ? 'Simpan Perubahan' : 'Tambah Pengguna'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
