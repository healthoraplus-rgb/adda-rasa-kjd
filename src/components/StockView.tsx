import React, { useState } from 'react';
import { Product, Transaction } from '../types';
import {
  calculateInventoryMetrics,
  getProductStockSummary,
  getRealStock,
} from '../utils/stockCalculator';

interface StockViewProps {
  products: Product[];
  transactions?: Transaction[];
  onUpdateStock: (productId: string, newStock: number) => void;
  onOpenCriticalMessageModal?: (supplierName?: string) => void;
  onSyncStockFromTransactions?: () => void;
}

export const StockView: React.FC<StockViewProps> = ({
  products,
  transactions = [],
  onUpdateStock,
  onOpenCriticalMessageModal,
  onSyncStockFromTransactions,
}) => {
  const [filterHealth, setFilterHealth] = useState<'All' | 'Aman' | 'Menipis' | 'Habis'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);

  const {
    totalStock: totalStockUnits,
    totalHealthy,
    totalLow,
    totalOut,
    totalIn,
    totalOutUnits,
  } = calculateInventoryMetrics(products, transactions);

  const filteredProducts = products.filter((p) => {
    const summary = getProductStockSummary(p, transactions);
    const matchesHealth = filterHealth === 'All' || summary.health === filterHealth;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesHealth && matchesSearch;
  });

  const handleSaveStock = (productId: string) => {
    onUpdateStock(productId, Math.max(0, tempStockValue));
    setEditingStockId(null);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Title & Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[28px] font-semibold text-[#1a1b22] tracking-tight">
            Manajemen Stok & Opname
          </h2>
          <p className="text-[14px] text-[#444653] mt-0.5">
            Pantau ketersediaan fisik real time, mutasi barang (Masuk/Keluar), sesuaikan kuantitas opname, dan peringatan batas minimum.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {onSyncStockFromTransactions && (
            <button
              onClick={onSyncStockFromTransactions}
              title="Hitung ulang seluruh stok berdasarkan rumus: Stok Awal + Mutasi Masuk - Mutasi Keluar"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-[13px] border border-[#00288e] text-[#00288e] bg-white hover:bg-[#00288e]/5 transition-all shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">sync</span>
              <span>Sinkronkan Mutasi</span>
            </button>
          )}

          {onOpenCriticalMessageModal && (
            <button
              onClick={() => onOpenCriticalMessageModal()}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px] transition-all shadow-xs cursor-pointer ${
                totalLow + totalOut > 0
                  ? 'bg-[#ba1a1a] text-white hover:bg-[#93000a]'
                  : 'bg-[#00288e] text-white hover:bg-[#1e40af]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">forward_to_inbox</span>
              <span>
                {totalLow + totalOut > 0
                  ? `Pesan Supplier (${totalLow + totalOut} Kritis)`
                  : 'Kirim Pesan ke Supplier'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      {(totalLow > 0 || totalOut > 0) && onOpenCriticalMessageModal && (
        <div className="bg-[#fff8f7] border border-[#ffdad6] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ba1a1a] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-[#ba1a1a]">
                Peringatan Batas Stok Kritis Terdeteksi!
              </h4>
              <p className="text-[12px] text-[#444653]">
                Terdapat <strong className="text-[#ba1a1a]">{totalLow + totalOut} produk</strong> yang telah menyentuh atau di bawah batas minimum stok gudang.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenCriticalMessageModal()}
            className="flex items-center gap-2 px-4 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-xl text-[12px] font-bold shadow-xs transition-all cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-[16px]">chat</span>
            <span>Kirim Pesan Otomatis ke Supplier</span>
          </button>
        </div>
      )}

      {/* Stock Health Badges Header */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card Real Stok Fisik (Total Unit) */}
        <button
          onClick={() => setFilterHealth('All')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            filterHealth === 'All'
              ? 'bg-[#00288e]/10 border-[#00288e] ring-2 ring-[#00288e]/20'
              : 'bg-white border-[#c4c5d5]/40 hover:bg-[#f4f2fc]'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#00288e] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">inventory</span>
            Real Stok Fisik
          </div>
          <div className="text-[22px] font-bold text-[#00288e] mt-1">
            {totalStockUnits.toLocaleString('id-ID')} <span className="text-[13px] font-semibold text-[#757684]">unit</span>
          </div>
        </button>

        {/* Card Total SKU Item */}
        <button
          onClick={() => setFilterHealth('All')}
          className="p-4 rounded-2xl border text-left transition-all cursor-pointer bg-white border-[#c4c5d5]/40 hover:bg-[#f4f2fc]"
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#444653] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">inventory_2</span>
            Total SKU
          </div>
          <div className="text-[22px] font-bold text-[#1a1b22] mt-1">
            {products.length} <span className="text-[13px] font-semibold text-[#757684]">SKU</span>
          </div>
        </button>

        {/* Card Mutasi Masuk */}
        <div className="p-4 rounded-2xl border text-left bg-white border-[#c4c5d5]/40">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#006c49] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">arrow_downward</span>
            Total Masuk
          </div>
          <div className="text-[22px] font-bold text-[#006c49] mt-1">
            +{totalIn.toLocaleString('id-ID')} <span className="text-[13px] font-semibold text-[#006c49]/70">unit</span>
          </div>
        </div>

        {/* Card Mutasi Keluar */}
        <div className="p-4 rounded-2xl border text-left bg-white border-[#c4c5d5]/40">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#ba1a1a] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
            Total Keluar
          </div>
          <div className="text-[22px] font-bold text-[#ba1a1a] mt-1">
            -{totalOutUnits.toLocaleString('id-ID')} <span className="text-[13px] font-semibold text-[#ba1a1a]/70">unit</span>
          </div>
        </div>

        {/* Card Stok Menipis */}
        <button
          onClick={() => setFilterHealth('Menipis')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            filterHealth === 'Menipis'
              ? 'bg-[#f59e0b]/10 border-[#f59e0b] ring-2 ring-[#f59e0b]/20'
              : 'bg-white border-[#c4c5d5]/40 hover:bg-[#f4f2fc]'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#4c2e00] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            Stok Menipis
          </div>
          <div className="text-[22px] font-bold text-[#4c2e00] mt-1">
            {totalLow} <span className="text-[13px] font-semibold text-[#4c2e00]/70">item</span>
          </div>
        </button>

        {/* Card Stok Habis */}
        <button
          onClick={() => setFilterHealth('Habis')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            filterHealth === 'Habis'
              ? 'bg-[#ba1a1a]/10 border-[#ba1a1a] ring-2 ring-[#ba1a1a]/20'
              : 'bg-white border-[#c4c5d5]/40 hover:bg-[#f4f2fc]'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#ba1a1a] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
            Stok Habis
          </div>
          <div className="text-[22px] font-bold text-[#ba1a1a] mt-1">
            {totalOut} <span className="text-[13px] font-semibold text-[#ba1a1a]/70">item</span>
          </div>
        </button>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-[24px] ambient-shadow border border-[#c4c5d5]/30 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-[#c4c5d5]/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757684] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kode, nama, atau supplier..."
              className="w-full pl-10 pr-4 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20"
            />
          </div>

          <div className="text-[13px] text-[#444653]">
            Menampilkan <span className="font-semibold text-[#1a1b22]">{filteredProducts.length}</span> dari {products.length} barang
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#c4c5d5]/30">
            <thead className="bg-[#eeedf7]/50">
              <tr>
                <th className="px-5 py-4 text-left text-[12px] font-semibold text-[#444653] uppercase">
                  Kode
                </th>
                <th className="px-5 py-4 text-left text-[12px] font-semibold text-[#444653] uppercase">
                  Nama Barang
                </th>
                <th className="px-5 py-4 text-left text-[12px] font-semibold text-[#444653] uppercase">
                  Kategori & Satuan
                </th>
                <th className="px-5 py-4 text-right text-[12px] font-semibold text-[#757684] uppercase">
                  Stok Awal
                </th>
                <th className="px-5 py-4 text-right text-[12px] font-semibold text-[#006c49] uppercase">
                  Masuk (+)
                </th>
                <th className="px-5 py-4 text-right text-[12px] font-semibold text-[#ba1a1a] uppercase">
                  Keluar (-)
                </th>
                <th className="px-5 py-4 text-right text-[12px] font-bold text-[#00288e] uppercase bg-[#00288e]/5">
                  Real Stok Fisik
                </th>
                <th className="px-5 py-4 text-right text-[12px] font-semibold text-[#757684] uppercase">
                  Min. Stok
                </th>
                <th className="px-5 py-4 text-center text-[12px] font-semibold text-[#444653] uppercase">
                  Status
                </th>
                <th className="px-5 py-4 text-right text-[12px] font-semibold text-[#444653] uppercase">
                  Opname / Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#c4c5d5]/20 text-[14px]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-[#757684]">
                    Belum ada data barang atau data tidak cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const summary = getProductStockSummary(p, transactions);
                  const isEditing = editingStockId === p.id;

                  return (
                    <tr key={p.id} className="hover:bg-[#f4f2fc]/50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap font-mono text-[13px] text-[#00288e] font-semibold">
                        {p.code}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-[#1a1b22]">
                        <div>{p.name}</div>
                        <div className="text-[11px] text-[#757684]">{p.supplier || 'Umum'}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-[#444653]">
                        <span className="px-2 py-0.5 rounded bg-[#e8e7f1] text-[12px] mr-1.5">
                          {p.category}
                        </span>
                        {p.unit}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right font-mono text-[13px] text-[#757684]">
                        {summary.initialStock} {p.unit}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right font-mono text-[13px] font-semibold text-[#006c49]">
                        {summary.totalIn > 0 ? `+${summary.totalIn}` : '0'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right font-mono text-[13px] font-semibold text-[#ba1a1a]">
                        {summary.totalOut > 0 ? `-${summary.totalOut}` : '0'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right font-mono text-[15px] font-bold bg-[#00288e]/5">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={tempStockValue}
                              onChange={(e) => setTempStockValue(Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-[#00288e] rounded text-right text-[13px] font-mono focus:outline-none bg-white shadow-inner"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span
                            className={
                              summary.health === 'Habis'
                                ? 'text-[#ba1a1a]'
                                : summary.health === 'Menipis'
                                ? 'text-[#4c2e00]'
                                : 'text-[#00288e]'
                            }
                          >
                            {summary.currentStock} {p.unit}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right font-mono text-[13px] text-[#757684]">
                        {p.minStock} {p.unit}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        {summary.health === 'Aman' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#6cf8bb]/20 text-[#00714d] border border-[#6cf8bb]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]" />
                            Aman
                          </span>
                        )}
                        {summary.health === 'Menipis' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#6b4200]/10 text-[#4c2e00] border border-[#6b4200]/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
                            Menipis
                          </span>
                        )}
                        {summary.health === 'Habis' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#ffdad6]/60 text-[#93000a] border border-[#ffdad6]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
                            Habis
                          </span>
                        )}
                        {(summary.health === 'Menipis' || summary.health === 'Habis') && onOpenCriticalMessageModal && (
                          <button
                            type="button"
                            onClick={() => onOpenCriticalMessageModal(p.supplier)}
                            title={`Kirim pesan restock ke ${p.supplier}`}
                            className="mt-1 flex items-center justify-center gap-1 mx-auto px-2 py-0.5 rounded-full bg-[#00288e]/10 text-[#00288e] hover:bg-[#00288e] hover:text-white transition-colors text-[10px] font-bold cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">chat</span>
                            <span>Pesan Supplier</span>
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleSaveStock(p.id)}
                              className="px-2.5 py-1 bg-[#00288e] text-white rounded text-[12px] font-semibold hover:bg-[#1e40af] cursor-pointer"
                            >
                              Simpan
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="px-2.5 py-1 border border-[#c4c5d5] rounded text-[12px] text-[#444653] hover:bg-[#f4f2fc] cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                onUpdateStock(p.id, Math.max(0, summary.currentStock - 1));
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded border border-[#c4c5d5] hover:bg-[#ffdad6]/40 text-[#ba1a1a] text-sm font-bold cursor-pointer"
                              title="Kurang 1"
                            >
                              -
                            </button>
                            <button
                              onClick={() => {
                                setEditingStockId(p.id);
                                setTempStockValue(summary.currentStock);
                              }}
                              className="px-2 py-1 text-[12px] text-[#00288e] font-semibold hover:bg-[#1e40af]/10 rounded cursor-pointer"
                            >
                              Opname
                            </button>
                            <button
                              onClick={() => {
                                onUpdateStock(p.id, summary.currentStock + 1);
                              }}
                              className="w-7 h-7 flex items-center justify-center rounded border border-[#c4c5d5] hover:bg-[#6cf8bb]/20 text-[#006c49] text-sm font-bold cursor-pointer"
                              title="Tambah 1"
                            >
                              +
                            </button>
                          </div>
                        )}
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
  );
};
