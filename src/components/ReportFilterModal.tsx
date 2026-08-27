import React, { useState } from 'react';
import { ReportFilter, Supplier } from '../types';

interface ReportFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filter: ReportFilter;
  onApplyFilter: (filter: ReportFilter) => void;
  suppliers: Supplier[];
}

export const ReportFilterModal: React.FC<ReportFilterModalProps> = ({
  isOpen,
  onClose,
  filter,
  onApplyFilter,
  suppliers,
}) => {
  const [startDate, setStartDate] = useState(filter.startDate);
  const [endDate, setEndDate] = useState(filter.endDate);
  const [month, setMonth] = useState(filter.month);
  const [supplier, setSupplier] = useState(filter.supplier);
  const [category, setCategory] = useState(filter.category);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilter({
      startDate,
      endDate,
      month,
      supplier,
      category,
    });
    onClose();
  };

  const categories = [
    'Semua Kategori',
    'Minuman',
    'Bahan Baku',
    'Bahan Pokok',
    'Frozen Food',
    'Packaging',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 md:p-8 shadow-2xl border border-[#c4c5d5]/40">
        <div className="flex justify-between items-center pb-4 border-b border-[#c4c5d5]/30">
          <div>
            <h3 className="text-[20px] font-bold text-[#1a1b22]">Sesuaikan Filter Laporan</h3>
            <p className="text-[12px] text-[#444653]">Pilih parameter periode tanggal dan supplier laporan.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#757684] hover:bg-[#e8e7f1] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Tanggal Mulai
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="01-08-2026"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Tanggal Akhir
              </label>
              <input
                type="text"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="31-08-2026"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#444653] mb-1">
              Bulan Periode
            </label>
            <input
              type="text"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              placeholder="Agustus 2026"
              className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#444653] mb-1">
              Pilih Supplier
            </label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none cursor-pointer"
            >
              <option value="Semua Supplier">Semua Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#444653] mb-1">
              Kategori Produk
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#c4c5d5]/30">
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
              Terapkan Filter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
