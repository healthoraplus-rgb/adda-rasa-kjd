import React, { useState } from 'react';

interface ResetProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productCount: number;
  onClearAll: () => void;
  onResetDefault: () => void;
  onResetFiltersOnly: () => void;
}

export const ResetProductsModal: React.FC<ResetProductsModalProps> = ({
  isOpen,
  onClose,
  productCount,
  onClearAll,
  onResetDefault,
  onResetFiltersOnly,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [selectedAction, setSelectedAction] = useState<'clear' | 'default' | 'filter' | null>(null);

  if (!isOpen) return null;

  const handleExecute = () => {
    if (selectedAction === 'clear') {
      onClearAll();
      onClose();
      setSelectedAction(null);
      setConfirmText('');
    } else if (selectedAction === 'default') {
      onResetDefault();
      onClose();
      setSelectedAction(null);
      setConfirmText('');
    } else if (selectedAction === 'filter') {
      onResetFiltersOnly();
      onClose();
      setSelectedAction(null);
      setConfirmText('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#c4c5d5]/40 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-[#c4c5d5]/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#ba1a1a]/10 text-[#ba1a1a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">restart_alt</span>
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-[#1a1b22]">
                Reset & Kelola Katalog Produk
              </h3>
              <p className="text-[12px] text-[#444653]">
                Total produk saat ini: <strong className="text-[#00288e]">{productCount} item</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              setSelectedAction(null);
              setConfirmText('');
            }}
            className="p-1.5 rounded-full text-[#757684] hover:bg-[#e8e7f1] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Action Selection */}
        <div className="space-y-3.5 my-5">
          <p className="text-[13px] font-medium text-[#1a1b22]">
            Silakan pilih tindakan reset yang ingin Anda jalankan:
          </p>

          {/* Option 1: Hapus Semua Produk */}
          <div
            onClick={() => setSelectedAction('clear')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
              selectedAction === 'clear'
                ? 'border-[#ba1a1a] bg-[#fff8f7] shadow-sm'
                : 'border-[#c4c5d5]/40 hover:border-[#ba1a1a]/40 bg-white'
            }`}
          >
            <div className="w-5 h-5 rounded-full border-2 border-[#ba1a1a] flex items-center justify-center mt-0.5 shrink-0">
              {selectedAction === 'clear' && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-[14px] font-bold text-[#ba1a1a] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                  <span>Hapus / Kosongkan Semua Produk</span>
                </h4>
                <span className="text-[11px] font-bold bg-[#ffdad6] text-[#ba1a1a] px-2 py-0.5 rounded-full">
                  0 Item
                </span>
              </div>
              <p className="text-[12px] text-[#444653] mt-1 leading-relaxed">
                Menghapus <strong>seluruh {productCount} data produk</strong> dari katalog inventaris sehingga katalog menjadi kosong sepenuhnya.
              </p>
            </div>
          </div>

          {/* Option 2: Reset ke Data Awal Pabrik */}
          <div
            onClick={() => setSelectedAction('default')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
              selectedAction === 'default'
                ? 'border-[#00288e] bg-[#f0effa] shadow-sm'
                : 'border-[#c4c5d5]/40 hover:border-[#00288e]/40 bg-white'
            }`}
          >
            <div className="w-5 h-5 rounded-full border-2 border-[#00288e] flex items-center justify-center mt-0.5 shrink-0">
              {selectedAction === 'default' && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#00288e]" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-[14px] font-bold text-[#00288e] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">settings_backup_restore</span>
                  <span>Reset ke Data Awal Pabrik (Default)</span>
                </h4>
                <span className="text-[11px] font-bold bg-[#dde1ff] text-[#00288e] px-2 py-0.5 rounded-full">
                  Data Sampel
                </span>
              </div>
              <p className="text-[12px] text-[#444653] mt-1 leading-relaxed">
                Mengembalikan daftar produk ke data awal sistem ADDA RASA KJD (6 produk bawaan beserta stok standar).
              </p>
            </div>
          </div>

          {/* Option 3: Reset Filter Saja */}
          <div
            onClick={() => setSelectedAction('filter')}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
              selectedAction === 'filter'
                ? 'border-[#00714d] bg-[#6cf8bb]/10 shadow-sm'
                : 'border-[#c4c5d5]/40 hover:border-[#00714d]/40 bg-white'
            }`}
          >
            <div className="w-5 h-5 rounded-full border-2 border-[#00714d] flex items-center justify-center mt-0.5 shrink-0">
              {selectedAction === 'filter' && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#00714d]" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-[14px] font-bold text-[#00714d] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                  <span>Reset Filter & Pencarian Saja</span>
                </h4>
                <span className="text-[11px] font-semibold text-[#757684]">
                  Bersihkan Form
                </span>
              </div>
              <p className="text-[12px] text-[#444653] mt-1 leading-relaxed">
                Hanya mengosongkan kata kunci pencarian, kategori, dan dropdown supplier tanpa menghapus produk.
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation safety box for Clear action */}
        {selectedAction === 'clear' && (
          <div className="p-3.5 bg-[#fff8f7] border border-[#ffdad6] rounded-xl text-[12px] space-y-2 animate-in fade-in">
            <p className="font-semibold text-[#ba1a1a] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>Peringatan: Tindakan ini tidak dapat dibatalkan.</span>
            </p>
            <p className="text-[#444653]">
              Ketik kata <strong className="text-[#ba1a1a] font-mono">HAPUS</strong> di bawah untuk mengonfirmasi pengosongan produk:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="Ketik HAPUS..."
              className="w-full px-3 py-1.5 border border-[#ba1a1a]/50 rounded-lg text-[13px] font-mono tracking-wider text-[#ba1a1a] bg-white outline-none focus:ring-2 focus:ring-[#ba1a1a]/30"
            />
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#c4c5d5]/30 mt-5">
          <button
            type="button"
            onClick={() => {
              onClose();
              setSelectedAction(null);
              setConfirmText('');
            }}
            className="px-4 py-2 border border-[#c4c5d5] rounded-xl text-[13px] font-semibold text-[#444653] hover:bg-[#f4f2fc] transition-colors cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={
              !selectedAction ||
              (selectedAction === 'clear' && confirmText !== 'HAPUS')
            }
            onClick={handleExecute}
            className={`px-5 py-2 rounded-xl text-[13px] font-bold text-white transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedAction === 'clear'
                ? 'bg-[#ba1a1a] hover:bg-[#93000a]'
                : selectedAction === 'default'
                ? 'bg-[#00288e] hover:bg-[#1e40af]'
                : 'bg-[#00714d] hover:bg-[#005238]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {selectedAction === 'clear'
                ? 'delete_forever'
                : selectedAction === 'default'
                ? 'check_circle'
                : 'filter_alt_off'}
            </span>
            <span>
              {selectedAction === 'clear'
                ? 'Ya, Hapus Semua Produk'
                : selectedAction === 'default'
                ? 'Ya, Reset ke Data Awal'
                : selectedAction === 'filter'
                ? 'Terapkan Reset Filter'
                : 'Pilih Tindakan'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
