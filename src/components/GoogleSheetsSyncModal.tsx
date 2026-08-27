import React, { useState } from 'react';
import { GoogleSheetsSyncState, Product, Supplier, Transaction } from '../types';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncState: GoogleSheetsSyncState;
  onConnectGoogle: () => Promise<void>;
  onDisconnectGoogle: () => Promise<void>;
  onSyncNow: (direction: 'push' | 'pull' | 'both') => Promise<void>;
  onToggleAutoSync: (enabled: boolean) => void;
  products: Product[];
  suppliers: Supplier[];
  transactions: Transaction[];
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  syncState,
  onConnectGoogle,
  onDisconnectGoogle,
  onSyncNow,
  onToggleAutoSync,
  products,
  suppliers,
  transactions,
}) => {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleAction = async (actionFn: () => Promise<void>, name: string) => {
    try {
      setActiveAction(name);
      setFeedback(null);
      await actionFn();
      setFeedback({ type: 'success', text: `Operasi ${name} berhasil diselesaikan!` });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err?.message || `Gagal menjalankan ${name}. Pastikan Anda telah memberikan izin Google Spreadsheet.`,
      });
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-[#c4c5d5]/40 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#00288e] to-[#1e40af] p-6 text-white flex justify-between items-start">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <svg className="w-7 h-7 text-[#34A853]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                <path d="M7 7h10v2H7zm0 4h10v2H7zm0 4h7v2H7z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[20px] font-bold tracking-tight">Sinkronisasi Google Sheets</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    syncState.isConnected
                      ? 'bg-[#6cf8bb]/30 text-[#6cf8bb] border border-[#6cf8bb]/50'
                      : 'bg-white/20 text-white/80'
                  }`}
                >
                  {syncState.isConnected ? 'Terhubung' : 'Belum Terhubung'}
                </span>
              </div>
              <p className="text-[13px] text-white/80 mt-0.5">
                Penyimpanan data inventaris realtime terintegrasi dengan Google Spreadsheet.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-[14px]">
          {/* Status Message / Alert */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl flex items-start gap-3 text-[13px] ${
                feedback.type === 'success'
                  ? 'bg-[#6cf8bb]/20 text-[#00714d] border border-[#6cf8bb]/40'
                  : 'bg-[#ffdad6]/60 text-[#ba1a1a] border border-[#ffdad6]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
                {feedback.type === 'success' ? 'check_circle' : 'error'}
              </span>
              <div className="flex-1 font-medium">{feedback.text}</div>
            </div>
          )}

          {/* Spreadsheet Target Info Card */}
          <div className="p-4 rounded-2xl bg-[#f4f2fc] border border-[#c4c5d5]/40 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#757684]">
                  Target Spreadsheet ID
                </span>
                <p className="font-mono text-[13px] font-semibold text-[#00288e] break-all select-all mt-0.5">
                  {syncState.spreadsheetId}
                </p>
              </div>
              <a
                href={syncState.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${syncState.spreadsheetId}/edit`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[12px] font-bold text-[#00288e] hover:underline bg-white px-3 py-1.5 rounded-xl border border-[#c4c5d5]/40 shadow-2xs shrink-0 cursor-pointer"
              >
                <span>Buka Sheet</span>
                <span className="material-symbols-outlined text-[15px]">open_in_new</span>
              </a>
            </div>

            <div className="pt-2 border-t border-[#c4c5d5]/30 grid grid-cols-3 gap-2 text-center text-[12px]">
              <div className="bg-white p-2 rounded-xl border border-[#c4c5d5]/30">
                <span className="text-[#757684] block text-[11px]">Tab Produk</span>
                <span className="font-bold text-[#1a1b22] text-[14px]">{products.length} SKU</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#c4c5d5]/30">
                <span className="text-[#757684] block text-[11px]">Tab Supplier</span>
                <span className="font-bold text-[#1a1b22] text-[14px]">{suppliers.length} Vendor</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#c4c5d5]/30">
                <span className="text-[#757684] block text-[11px]">Tab Transaksi</span>
                <span className="font-bold text-[#1a1b22] text-[14px]">{transactions.length} Mutasi</span>
              </div>
            </div>
          </div>

          {/* Connection Section */}
          {!syncState.isConnected ? (
            <div className="p-5 rounded-2xl border border-[#00288e]/20 bg-[#00288e]/5 space-y-3 text-center">
              <p className="text-[13px] text-[#444653]">
                Hubungkan akun Google Anda untuk mengaktifkan sinkronisasi otomatis dan realtime ke Google Spreadsheet.
              </p>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#006c49] font-medium bg-[#6cf8bb]/20 py-1 px-3 rounded-lg border border-[#6cf8bb]/40">
                <span className="material-symbols-outlined text-[14px]">tab_unselected</span>
                <span>Metode Pop-up Langsung: Aman & kompatibel untuk hosting Netlify tanpa masalah kuki pihak ketiga.</span>
              </div>

              {/* Official Styled Google Sign-In Button */}
              <button
                type="button"
                onClick={() => handleAction(onConnectGoogle, 'Koneksi Google')}
                disabled={activeAction !== null}
                className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 bg-white text-[#1a1b22] border border-[#c4c5d5] rounded-2xl font-semibold hover:bg-[#fbf8ff] hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                <span>
                  {activeAction === 'Koneksi Google' ? 'Membuka Jendela Pop-up...' : 'Hubungkan dengan Google (Pop-up)'}
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#6cf8bb]/10 border border-[#6cf8bb]/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#006c49] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-[#006c49] uppercase tracking-wider block">
                      Akun Google Terverifikasi
                    </span>
                    <span className="text-[13px] font-bold text-[#1a1b22]">
                      {syncState.googleUserEmail || 'addarasakjd@gmail.com'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAction(onDisconnectGoogle, 'Putus Koneksi')}
                  className="text-[12px] text-[#ba1a1a] hover:underline font-semibold cursor-pointer"
                >
                  Putus Koneksi
                </button>
              </div>

              {/* Auto Sync Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#c4c5d5]/40 shadow-2xs">
                <div>
                  <h4 className="font-semibold text-[#1a1b22] text-[14px]">Auto-Sync Realtime</h4>
                  <p className="text-[12px] text-[#757684]">
                    Setiap penambahan/perubahan produk & transaksi langsung terupdate ke Sheet.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={syncState.autoSync}
                    onChange={(e) => onToggleAutoSync(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00288e]"></div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAction(() => onSyncNow('push'), 'Kirim Data ke Sheet')}
                  disabled={activeAction !== null}
                  className="p-3 bg-[#00288e] text-white rounded-2xl font-semibold hover:bg-[#1e40af] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-[13px]"
                >
                  <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                  <span>{activeAction === 'Kirim Data ke Sheet' ? 'Mengunggah...' : 'Upload ke Sheet'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(() => onSyncNow('pull'), 'Tarik Data dari Sheet')}
                  disabled={activeAction !== null}
                  className="p-3 bg-white text-[#00288e] border border-[#00288e] rounded-2xl font-semibold hover:bg-[#f4f2fc] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-[13px]"
                >
                  <span className="material-symbols-outlined text-[18px]">cloud_download</span>
                  <span>{activeAction === 'Tarik Data dari Sheet' ? 'Mengunduh...' : 'Tarik dari Sheet'}</span>
                </button>
              </div>

              {syncState.lastSyncedAt && (
                <p className="text-center text-[12px] text-[#757684]">
                  Terakhir disinkronkan: <span className="font-semibold text-[#1a1b22]">{syncState.lastSyncedAt}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#f4f2fc] border-t border-[#c4c5d5]/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white text-[#1a1b22] border border-[#c4c5d5]/50 font-semibold hover:bg-[#eeedf7] transition-colors text-[13px] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
