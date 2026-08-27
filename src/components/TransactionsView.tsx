import React, { useState } from 'react';
import { Transaction } from '../types';

interface TransactionsViewProps {
  transactions: Transaction[];
  onOpenAddTransactionModal: () => void;
  onOpenSalesExportModal?: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onOpenAddTransactionModal,
  onOpenSalesExportModal,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter((t) => {
    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesSearch =
      t.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sourceDestination.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalIn = transactions
    .filter((t) => t.type === 'IN')
    .reduce((acc, t) => acc + t.quantity, 0);

  const totalOut = transactions
    .filter((t) => t.type === 'OUT')
    .reduce((acc, t) => acc + t.quantity, 0);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-[#1a1b22] tracking-tight">
            Log Mutasi & Transaksi
          </h2>
          <p className="text-[14px] text-[#444653] mt-0.5">
            Riwayat pencatatan barang masuk (pembelian/supplier) dan barang keluar (distribusi outlet/penjualan).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {onOpenSalesExportModal && (
            <button
              id="btn-transaksi-download-penjualan"
              type="button"
              onClick={onOpenSalesExportModal}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-[#00288e]/30 bg-[#dde1ff]/30 text-[#00288e] hover:bg-[#dde1ff]/60 rounded-xl text-[13px] font-bold transition-all shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
              <span>Download Laporan Penjualan</span>
            </button>
          )}

          <button
            id="btn-catat-transaksi-baru"
            type="button"
            onClick={onOpenAddTransactionModal}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00288e] text-white rounded-xl hover:bg-[#1e40af] text-[13px] font-bold transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>+ Catat Transaksi Baru</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-[20px] ambient-shadow border border-[#c4c5d5]/30">
          <div className="text-[12px] font-semibold text-[#444653] uppercase">Total Log Transaksi</div>
          <div className="text-[28px] font-bold text-[#1a1b22] mt-1">{transactions.length}</div>
          <div className="text-[12px] text-[#757684] mt-0.5">Seluruh aktivitas tercatat</div>
        </div>

        <div className="bg-white p-5 rounded-[20px] ambient-shadow border border-[#c4c5d5]/30">
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-semibold text-[#006c49] uppercase">Barang Masuk (In)</span>
            <span className="material-symbols-outlined text-[#006c49] text-[20px]">arrow_downward</span>
          </div>
          <div className="text-[28px] font-bold text-[#006c49] mt-1">{totalIn} unit</div>
          <div className="text-[12px] text-[#006c49] mt-0.5">Diterima dari supplier</div>
        </div>

        <div className="bg-white p-5 rounded-[20px] ambient-shadow border border-[#c4c5d5]/30">
          <div className="flex justify-between items-center">
            <span className="text-[12px] font-semibold text-[#ba1a1a] uppercase">Barang Keluar (Out)</span>
            <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">arrow_upward</span>
          </div>
          <div className="text-[28px] font-bold text-[#ba1a1a] mt-1">{totalOut} unit</div>
          <div className="text-[12px] text-[#ba1a1a] mt-0.5">Didistribusikan ke cabang/kitchen</div>
        </div>
      </div>

      {/* Filter and Table Card */}
      <div className="bg-white rounded-[24px] ambient-shadow border border-[#c4c5d5]/30 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-[#c4c5d5]/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors ${
                filterType === 'ALL'
                  ? 'bg-[#00288e] text-white'
                  : 'bg-[#f4f2fc] text-[#444653] hover:bg-[#eeedf7]'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('IN')}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-1 ${
                filterType === 'IN'
                  ? 'bg-[#006c49] text-white'
                  : 'bg-[#f4f2fc] text-[#444653] hover:bg-[#eeedf7]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              Barang Masuk
            </button>
            <button
              onClick={() => setFilterType('OUT')}
              className={`px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-colors flex items-center gap-1 ${
                filterType === 'OUT'
                  ? 'bg-[#ba1a1a] text-white'
                  : 'bg-[#f4f2fc] text-[#444653] hover:bg-[#eeedf7]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
              Barang Keluar
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#757684] text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari transaksi..."
              className="w-full pl-10 pr-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#c4c5d5]/30">
            <thead className="bg-[#eeedf7]/50">
              <tr>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#444653] uppercase">
                  Kode Transaksi
                </th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#444653] uppercase">
                  Tipe & Tanggal
                </th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#444653] uppercase">
                  Produk
                </th>
                <th className="px-6 py-4 text-right text-[12px] font-semibold text-[#444653] uppercase">
                  Jumlah
                </th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#444653] uppercase">
                  Asal / Tujuan
                </th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#444653] uppercase">
                  Keterangan
                </th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#444653] uppercase">
                  Petugas
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#c4c5d5]/20 text-[14px]">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-[#f4f2fc]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-[13px] text-[#00288e] font-semibold">
                      {t.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            t.type === 'IN'
                              ? 'bg-[#6cf8bb]/20 text-[#00714d] border border-[#6cf8bb]/40'
                              : 'bg-[#ffdad6]/60 text-[#93000a] border border-[#ffdad6]'
                          }`}
                        >
                          {t.type === 'IN' ? 'MASUK' : 'KELUAR'}
                        </span>
                        <span className="text-[12px] text-[#757684]">{t.date}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-[#1a1b22]">
                      <div>{t.productName}</div>
                      <div className="text-[11px] text-[#757684] font-mono">{t.productCode}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-[14px] font-bold">
                      <span className={t.type === 'IN' ? 'text-[#006c49]' : 'text-[#ba1a1a]'}>
                        {t.type === 'IN' ? '+' : '-'}
                        {t.quantity} {t.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#444653]">
                      {t.sourceDestination}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[#757684] text-[13px]">
                      {t.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#444653]">
                      {t.createdBy}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#757684]">
                    <span className="material-symbols-outlined text-[36px] text-[#757684] mb-2 block">
                      receipt_long
                    </span>
                    <p className="text-[14px] font-semibold text-[#1a1b22]">
                      Belum Ada Riwayat Transaksi
                    </p>
                    <p className="text-[12px] text-[#757684] mt-1 max-w-sm mx-auto">
                      Catat mutasi barang masuk atau barang keluar dengan menekan tombol Catat Transaksi di atas.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
