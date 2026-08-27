import React, { useState } from 'react';
import { User } from '../types';
import { APP_LOGO_URL } from '../data/initialData';

interface LoginScreenProps {
  users: User[];
  onLogin: (credentials: { username: string; password?: string }) => { success: boolean; message?: string };
  onRegister: (newUser: User) => { success: boolean; message?: string };
  onForgotPassword: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  users,
  onLogin,
  onRegister,
  onForgotPassword,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login Form States
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState('Operator Gudang');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim()) {
      setErrorMessage('Silakan masukkan username Anda.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Silakan masukkan kata sandi.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    setTimeout(() => {
      setIsLoading(false);
      const res = onLogin({ username: loginUsername.trim(), password: loginPassword });
      if (!res.success) {
        setErrorMessage(res.message || 'Username atau password salah.');
      }
    }, 350);
  };

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase() || 'US';
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('Semua kolom bertanda bintang (*) wajib diisi.');
      return;
    }

    if (regPassword.length < 5) {
      setErrorMessage('Kata sandi minimal 5 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const newUser: User = {
        id: `usr-${Date.now()}`,
        username: regUsername.trim().toLowerCase(),
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim() || '+62 812-0000-0000',
        role: regRole,
        password: regPassword,
        avatar: '',
        initials: getInitials(regName),
        status: 'Aktif',
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }),
      };

      const result = onRegister(newUser);
      if (result.success) {
        setSuccessMessage('Akun berhasil didaftarkan! Mengalihkan ke sistem...');
      } else {
        setErrorMessage(result.message || 'Gagal mendaftarkan akun.');
      }
    }, 450);
  };

  const setQuickDemoUser = (user: User) => {
    setLoginUsername(user.username);
    setLoginPassword(user.password || 'admin123');
    setErrorMessage('');
  };

  const availableRoles = [
    'Operator Gudang',
    'Inventory Manager',
    'Supervisor Logistik',
    'Staff Purchasing',
    'Kepala Gudang',
    'Admin Keuangan',
  ];

  return (
    <div className="bg-pattern min-h-screen flex items-center justify-center p-4 md:p-6 text-[#1a1b22] relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00288e]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#006c49]/5 rounded-full blur-3xl pointer-events-none" />

      <main className="w-full max-w-[480px] z-10 relative my-6">
        <div className="bg-white rounded-[28px] card-shadow p-6 sm:p-8 border border-[#e3e1eb] flex flex-col gap-5 transition-all">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center gap-2.5 pb-4 border-b border-[#e3e1eb]">
            <div className="w-20 h-24 flex items-center justify-center">
              <img
                alt="ADDA RASA Logo"
                className="w-full h-full object-contain drop-shadow-xs"
                src={APP_LOGO_URL}
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-[#00288e] tracking-tight">
                ADDA RASA KJD
              </h1>
              <p className="text-[11px] font-bold text-[#444653] mt-0.5 uppercase tracking-widest">
                Inventory & Warehouse System
              </p>
            </div>

            {/* Tab Switcher: Masuk vs Daftar */}
            <div className="flex p-1 bg-[#f4f2fc] rounded-2xl w-full max-w-xs mt-2 border border-[#c4c5d5]/30">
              <button
                type="button"
                id="tab-login"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex-1 py-2 text-[12px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'login'
                    ? 'bg-white text-[#00288e] shadow-xs'
                    : 'text-[#757684] hover:text-[#1a1b22]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">login</span>
                <span>Masuk (Login)</span>
              </button>

              <button
                type="button"
                id="tab-register"
                onClick={() => {
                  setActiveTab('register');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex-1 py-2 text-[12px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'bg-white text-[#00288e] shadow-xs'
                    : 'text-[#757684] hover:text-[#1a1b22]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Daftar Akun</span>
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3 bg-[#ffdad6]/70 border border-[#ba1a1a]/30 text-[#93000a] text-[13px] rounded-xl flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-[#6cf8bb]/20 border border-[#006c49]/30 text-[#00714d] text-[13px] rounded-xl flex items-center gap-2 animate-in fade-in">
              <span className="material-symbols-outlined text-[18px] shrink-0">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-1.5">
                <label
                  className="text-[12px] font-bold text-[#1a1b22]"
                  htmlFor="login-username"
                >
                  Username Login
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c4c5d5] group-focus-within:text-[#00288e] transition-colors text-[20px]">
                    person
                  </span>
                  <input
                    id="login-username"
                    name="username"
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Masukkan username Anda"
                    className="w-full bg-[#fbf8ff] border border-[#c4c5d5] rounded-xl pl-10 pr-3 py-2.5 text-[14px] text-[#1a1b22] placeholder-[#757684] focus:border-[#00288e] focus:ring-2 focus:ring-[#00288e]/20 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label
                    className="text-[12px] font-bold text-[#1a1b22]"
                    htmlFor="login-password"
                  >
                    Kata Sandi (Password)
                  </label>
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-[12px] font-semibold text-[#00288e] hover:text-[#1e40af] transition-colors cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c4c5d5] group-focus-within:text-[#00288e] transition-colors text-[20px]">
                    lock
                  </span>
                  <input
                    id="login-password"
                    name="password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full bg-[#fbf8ff] border border-[#c4c5d5] rounded-xl pl-10 pr-10 py-2.5 text-[14px] text-[#1a1b22] placeholder-[#757684] focus:border-[#00288e] focus:ring-2 focus:ring-[#00288e]/20 transition-all outline-none font-mono"
                    required
                  />
                  <button
                    type="button"
                    id="togglePassword"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#1a1b22] transition-colors focus:outline-none cursor-pointer"
                    title={showLoginPassword ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showLoginPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#c4c5d5] text-[#00288e] focus:ring-[#00288e]/20 bg-[#fbf8ff] w-4 h-4 cursor-pointer accent-[#00288e]"
                />
                <label
                  htmlFor="remember"
                  className="text-[13px] text-[#444653] cursor-pointer select-none"
                >
                  Ingat sesi login saya selama 30 hari
                </label>
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00288e] text-white rounded-xl py-3 text-[13px] font-bold uppercase tracking-wider hover:bg-[#1e40af] active:ring-2 active:ring-[#00288e]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-1 shadow-sm cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <span>Memverifikasi Akun...</span>
                ) : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <span className="material-symbols-outlined text-[18px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>

              {/* Quick Demo Credentials */}
              <div className="pt-3 border-t border-[#e3e1eb]/80">
                <p className="text-[11px] font-semibold text-[#757684] mb-2 uppercase tracking-wider text-center">
                  Atau Pilih Akun Pengguna Cepat:
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {users.slice(0, 3).map((u) => (
                    <button
                      key={u.username}
                      type="button"
                      onClick={() => setQuickDemoUser(u)}
                      className="px-2.5 py-1 bg-[#f4f2fc] hover:bg-[#00288e]/10 border border-[#c4c5d5]/50 text-[#00288e] rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>{u.name}</span>
                      <span className="text-[#757684] font-normal">({u.role})</span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            /* TAB 2: REGISTER AKUN BARU */
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3.5 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#1a1b22]">
                    Nama Lengkap <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Budi Pratama"
                    className="w-full bg-[#fbf8ff] border border-[#c4c5d5] rounded-xl px-3 py-2 text-[13px] text-[#1a1b22] focus:border-[#00288e] focus:ring-2 focus:ring-[#00288e]/20 outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#1a1b22]">
                    Username Login <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Contoh: budi_pratama"
                    className="w-full bg-[#fbf8ff] border border-[#c4c5d5] rounded-xl px-3 py-2 text-[13px] text-[#1a1b22] focus:border-[#00288e] focus:ring-2 focus:ring-[#00288e]/20 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#1a1b22]">
                    Email Perusahaan <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="budi@addarasakjd.co.id"
                    className="w-full bg-[#fbf8ff] border border-[#c4c5d5] rounded-xl px-3 py-2 text-[13px] text-[#1a1b22] focus:border-[#00288e] focus:ring-2 focus:ring-[#00288e]/20 outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#1a1b22]">
                    No. HP / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+62 812-xxxx-xxxx"
                    className="w-full bg-[#fbf8ff] border border-[#c4c5d5] rounded-xl px-3 py-2 text-[13px] text-[#1a1b22] focus:border-[#00288e] focus:ring-2 focus:ring-[#00288e]/20 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-[#1a1b22]">
                  Role / Posisi Jabatan <span className="text-[#ba1a1a]">*</span>
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full bg-[#fbf8ff] border border-[#c4c5d5] rounded-xl px-3 py-2 text-[13px] text-[#1a1b22] focus:border-[#00288e] focus:ring-2 focus:ring-[#00288e]/20 outline-none font-medium"
                >
                  {availableRoles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#1a1b22]">
                    Kata Sandi <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min. 5 karakter"
                      className="w-full bg-[#fbf8ff] border border-[#c4c5d5] rounded-xl px-3 py-2 pr-9 text-[13px] text-[#1a1b22] focus:border-[#00288e] focus:ring-2 focus:ring-[#00288e]/20 outline-none font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#757684] hover:text-[#1a1b22] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {showRegPassword ? 'visibility' : 'visibility_off'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-[#1a1b22]">
                    Konfirmasi Sandi <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full bg-[#fbf8ff] border border-[#c4c5d5] rounded-xl px-3 py-2 text-[13px] text-[#1a1b22] focus:border-[#00288e] focus:ring-2 focus:ring-[#00288e]/20 outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <p className="text-[11px] text-[#757684]">
                Akun yang didaftarkan akan otomatis terhubung ke <strong>Pengaturan Akun Pengguna</strong> dan dapat langsung digunakan untuk login.
              </p>

              <button
                id="btn-register-submit"
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#00714d] hover:bg-[#005238] text-white rounded-xl py-3 text-[13px] font-bold uppercase tracking-wider active:ring-2 active:ring-[#00714d]/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-1 shadow-sm cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <span>Mendaftarkan Akun...</span>
                ) : (
                  <>
                    <span>Daftar & Masuk Sekarang</span>
                    <span className="material-symbols-outlined text-[18px]">
                      how_to_reg
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Footer Section */}
          <div className="pt-3 text-center border-t border-[#e3e1eb]">
            <p className="text-[13px] text-[#444653]">
              {activeTab === 'login' ? (
                <>
                  Belum memiliki akun terdaftar?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-[#00288e] font-bold hover:underline underline-offset-4 cursor-pointer"
                  >
                    Daftar Sekarang
                  </button>
                </>
              ) : (
                <>
                  Sudah memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-[#00288e] font-bold hover:underline underline-offset-4 cursor-pointer"
                  >
                    Masuk ke Akun
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* System Version */}
        <div className="text-center mt-5">
          <p className="font-mono text-[12px] text-[#757684]">
            ADDA RASA KJD Inventory System • Build 2026
          </p>
        </div>
      </main>
    </div>
  );
};
