import React, { useState } from 'react';
import { APP_LOGO_URL } from '../data/initialData';

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RequestAccessModal: React.FC<RequestAccessModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('ADDA RASA KJD Headquarter');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[24px] max-w-md w-full p-6 md:p-8 shadow-2xl border border-[#c4c5d5]/40">
        <div className="flex justify-between items-center pb-4 border-b border-[#c4c5d5]/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-10 flex items-center justify-center">
              <img
                src={APP_LOGO_URL}
                alt="ADDA RASA Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-[#1a1b22]">Request System Access</h3>
              <p className="text-[12px] text-[#444653]">Pengajuan izin akun operator & staf gudang.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#757684] hover:bg-[#e8e7f1] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-[#6cf8bb]/30 text-[#006c49] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <h4 className="font-bold text-[16px] text-[#1a1b22]">Permintaan Terkirim</h4>
            <p className="text-[13px] text-[#444653] max-w-xs mx-auto">
              Admin ADDA RASA KJD akan meninjau dan mengirimkan kredensial login ke email Anda.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-5">
            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Email Perusahaan
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@addarasa.com"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Unit / Cabang
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none cursor-pointer"
              >
                <option value="ADDA RASA KJD Headquarter">ADDA RASA KJD Headquarter</option>
                <option value="Central Kitchen Gudang A">Central Kitchen Gudang A</option>
                <option value="Outlet Cabang Sudirman">Outlet Cabang Sudirman</option>
                <option value="Outlet Cabang Gading Serpong">Outlet Cabang Gading Serpong</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Alasan / Keperluan Akses
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Input data stok harian dan mutasi bahan baku..."
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none resize-none"
                required
              />
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
                Kirim Pengajuan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
