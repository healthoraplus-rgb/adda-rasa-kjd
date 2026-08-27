import React, { useState } from 'react';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[24px] max-w-md w-full p-6 md:p-8 shadow-2xl border border-[#c4c5d5]/40">
        <div className="flex justify-between items-center pb-4 border-b border-[#c4c5d5]/30">
          <div>
            <h3 className="text-[18px] font-bold text-[#1a1b22]">Reset Kata Sandi</h3>
            <p className="text-[12px] text-[#444653]">Instruksi pemulihan akun akan dikirimkan.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#757684] hover:bg-[#e8e7f1] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {sent ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 bg-[#6cf8bb]/30 text-[#006c49] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[28px]">mark_email_read</span>
            </div>
            <h4 className="font-bold text-[15px] text-[#1a1b22]">Tautan Reset Terkirim!</h4>
            <p className="text-[13px] text-[#444653]">
              Periksa kotak masuk email <span className="font-semibold">{email}</span> untuk membuat kata sandi baru.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-5">
            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Email Akun Terdaftar
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@addarasa.com"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>

            <div className="p-3 bg-[#dde1ff]/40 rounded-xl text-[12px] text-[#00288e] flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <span>Info: Gunakan akun default <b>admin / admin123</b> untuk demo.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#c4c5d5]/30">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#c4c5d5] rounded-lg text-[13px] font-semibold text-[#444653] hover:bg-[#f4f2fc] transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#00288e] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1e40af] transition-all shadow-xs"
              >
                Kirim Tautan Reset
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
