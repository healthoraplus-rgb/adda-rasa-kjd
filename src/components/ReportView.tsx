import React, { useState, useMemo } from 'react';
import { Product, ReportFilter, Supplier, Transaction, User } from '../types';
import { APP_LOGO_URL } from '../data/initialData';
import { getProductStockSummary } from '../utils/stockCalculator';
import { ReportPrintModal } from './ReportPrintModal';

interface ReportViewProps {
  products: Product[];
  suppliers: Supplier[];
  transactions?: Transaction[];
  onOpenFilterModal: () => void;
  reportFilter: ReportFilter;
  onExportExcel: () => void;
  onOpenSalesExportModal?: () => void;
  currentUser?: User;
}

export const ReportView: React.FC<ReportViewProps> = ({
  products,
  suppliers,
  transactions = [],
  onOpenFilterModal,
  reportFilter,
  onExportExcel,
  onOpenSalesExportModal,
  currentUser,
}) => {
  const [reportType, setReportType] = useState<'inventory' | 'sales'>('inventory');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const itemsPerPage = 6;

  // Filter products based on reportFilter settings
  const filteredProducts = products.filter((p) => {
    if (
      reportFilter.supplier &&
      reportFilter.supplier !== 'Semua Supplier' &&
      p.supplier !== reportFilter.supplier
    ) {
      return false;
    }
    if (
      reportFilter.category &&
      reportFilter.category !== 'Semua Kategori' &&
      p.category !== reportFilter.category
    ) {
      return false;
    }
    return true;
  });

  // Outbound / Sales Transactions
  const outboundTransactions = useMemo(() => {
    return transactions.filter((t) => t.type === 'OUT');
  }, [transactions]);

  const totalSalesRevenue = useMemo(() => {
    return outboundTransactions.reduce((acc, t) => {
      const prod = products.find(
        (p) =>
          p.id === t.productId ||
          p.code?.toLowerCase() === t.productCode?.toLowerCase() ||
          p.name?.toLowerCase() === t.productName?.toLowerCase()
      );
      const price = prod?.price || 0;
      return acc + t.quantity * price;
    }, 0);
  }, [outboundTransactions, products]);

  const totalSalesQty = useMemo(() => {
    return outboundTransactions.reduce((acc, t) => acc + t.quantity, 0);
  }, [outboundTransactions]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const getStockHealth = (p: Product) => {
    return getProductStockSummary(p, transactions).health;
  };

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Actions & Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
        <div>
          <h1 className="text-[28px] font-bold text-[#1a1b22] tracking-tight">
            Pusat Laporan & Rekapitulasi
          </h1>
          <p className="text-[14px] text-[#444653] mt-0.5">
            Laporan berkala stok inventaris, pergerakan barang, dan penjualan per supplier/bulan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            id="btn-open-sales-export"
            type="button"
            onClick={onOpenSalesExportModal}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00288e] text-white rounded-xl hover:bg-[#1e40af] transition-all shadow-xs text-[13px] font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
            <span>Download Laporan Penjualan</span>
          </button>

          <button
            id="btn-report-download-excel"
            onClick={onExportExcel}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-[#c4c5d5] rounded-xl text-[#1a1b22] hover:bg-[#f4f2fc] transition-colors text-[13px] font-semibold bg-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">table_view</span>
            <span>Ekspor Stok (.csv)</span>
          </button>

          <button
            id="btn-report-print-pdf"
            onClick={handlePrint}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 border border-[#00288e]/30 bg-[#dde1ff]/30 text-[#00288e] rounded-xl hover:bg-[#dde1ff]/60 transition-all text-[13px] font-bold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 p-1 bg-[#f4f2fc] rounded-2xl border border-[#c4c5d5]/40 w-fit no-print">
        <button
          type="button"
          onClick={() => setReportType('inventory')}
          className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
            reportType === 'inventory'
              ? 'bg-white text-[#00288e] shadow-xs'
              : 'text-[#757684] hover:text-[#1a1b22]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">inventory_2</span>
          <span>Laporan Stok & Inventaris</span>
        </button>

        <button
          type="button"
          onClick={() => setReportType('sales')}
          className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 cursor-pointer ${
            reportType === 'sales'
              ? 'bg-white text-[#00288e] shadow-xs'
              : 'text-[#757684] hover:text-[#1a1b22]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
          <span>Laporan Penjualan (Barang Keluar)</span>
        </button>
      </div>

      {/* SALES REPORT QUICK SUMMARY (When sales tab is active) */}
      {reportType === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
            <div className="bg-white p-5 rounded-2xl border border-[#c4c5d5]/30 shadow-xs">
              <span className="text-[12px] font-bold text-[#757684] uppercase block">
                Total Transaksi Keluar
              </span>
              <span className="text-[26px] font-bold text-[#1a1b22] mt-1 block">
                {outboundTransactions.length} Log
              </span>
              <span className="text-[12px] text-[#00288e] font-medium">Distribusi & Penjualan</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#c4c5d5]/30 shadow-xs">
              <span className="text-[12px] font-bold text-[#757684] uppercase block">
                Total Unit Terjual
              </span>
              <span className="text-[26px] font-bold text-[#006c49] mt-1 block font-mono">
                {totalSalesQty.toLocaleString('id-ID')} unit
              </span>
              <span className="text-[12px] text-[#006c49] font-medium">Akumulasi kuantitas</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#c4c5d5]/30 shadow-xs">
              <span className="text-[12px] font-bold text-[#757684] uppercase block">
                Estimasi Nilai Omset
              </span>
              <span className="text-[26px] font-bold text-[#00288e] mt-1 block font-mono">
                Rp {totalSalesRevenue.toLocaleString('id-ID')}
              </span>
              <span className="text-[12px] text-[#757684]">Berdasarkan harga master</span>
            </div>
          </div>

          {/* Sales Report CTA Card */}
          <div className="bg-linear-to-r from-[#00288e]/10 via-[#dde1ff]/40 to-white p-6 rounded-2xl border border-[#00288e]/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
            <div>
              <div className="flex items-center gap-2 text-[#00288e] font-bold text-[16px]">
                <span className="material-symbols-outlined text-[22px]">download_for_offline</span>
                <span>Download Laporan Penjualan Resmi</span>
              </div>
              <p className="text-[13px] text-[#444653] mt-1 max-w-xl">
                Dapatkan rekapitulasi data penjualan dengan pilihan filter per bulan, per supplier asal, atau spesifik produk lengkap dengan logo ADDA RASA, alamat toko, tanggal dokumen, dan format profesional.
              </p>
            </div>
            <button
              onClick={onOpenSalesExportModal}
              className="px-5 py-2.5 bg-[#00288e] text-white rounded-xl font-bold text-[13px] hover:bg-[#1e40af] shadow-xs cursor-pointer flex items-center gap-2 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Buka Filter & Download</span>
            </button>
          </div>
        </div>
      )}

      {/* Report Container (Printable Area Look) */}
      <div className="bg-white rounded-2xl ambient-shadow border border-[#c4c5d5]/30 overflow-hidden printable-area">
        {/* Report Header / Branding */}
        <div className="p-6 md:p-8 border-b border-[#c4c5d5]/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#ffffff]">
          <div className="flex items-center gap-4">
            <div className="w-14 h-18 flex items-center justify-center">
              <img
                alt="ADDA RASA Logo"
                className="w-full h-full object-contain"
                src={APP_LOGO_URL}
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h3 className="text-[20px] text-[#00288e] font-bold">ADDA RASA KJD</h3>
              <p className="text-[12px] font-semibold text-[#444653] uppercase tracking-wider">
                {reportType === 'inventory' ? 'Inventory Management System' : 'Sales & Distribution System'}
              </p>
              <p className="text-[11px] text-[#757684]">
                Jl. Kayu Jati Dukuh No. 12, Rawamangun, Jakarta Timur | addarasakjd@gmail.com
              </p>
            </div>
          </div>

          {/* Filters Display Meta Box */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3 text-[14px] bg-[#f4f2fc] p-4 rounded-xl border border-[#c4c5d5]/50 w-full md:w-auto">
            <div>
              <span className="block text-[11px] font-bold text-[#757684] uppercase mb-0.5">
                Periode
              </span>
              <span className="text-[13px] font-semibold text-[#1a1b22]">
                {reportFilter.startDate} - {reportFilter.endDate}
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-bold text-[#757684] uppercase mb-0.5">
                Bulan
              </span>
              <span className="text-[13px] font-semibold text-[#1a1b22]">
                {reportFilter.month}
              </span>
            </div>
            <div className="col-span-2 md:col-span-1">
              <span className="block text-[11px] font-bold text-[#757684] uppercase mb-0.5">
                Supplier
              </span>
              <span className="text-[13px] font-semibold text-[#1a1b22]">
                {reportFilter.supplier}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls Header */}
        <div className="px-6 md:px-8 py-3.5 border-b border-[#c4c5d5]/30 bg-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-[#444653]">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            <span className="text-[12px] font-bold">
              {reportType === 'inventory' ? 'Filter Data Inventaris' : 'Daftar Barang Keluar (Penjualan)'}
            </span>
          </div>
          {reportType === 'inventory' ? (
            <button
              id="btn-ubah-filter"
              onClick={onOpenFilterModal}
              className="text-[#00288e] hover:text-[#1e40af] text-[12px] font-bold transition-colors cursor-pointer"
            >
              Ubah Filter
            </button>
          ) : (
            <button
              onClick={onOpenSalesExportModal}
              className="text-[#00288e] hover:text-[#1e40af] text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Download Excel & Cetak Dokumen</span>
            </button>
          )}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {reportType === 'inventory' ? (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#eeedf7]/60 border-b border-[#c4c5d5]/50">
                  <th className="py-4 px-6 text-[12px] font-bold text-[#444653] uppercase w-28">
                    Kode
                  </th>
                  <th className="py-4 px-6 text-[12px] font-bold text-[#444653] uppercase">
                    Produk
                  </th>
                  <th className="py-4 px-6 text-[12px] font-bold text-[#444653] uppercase">
                    Supplier
                  </th>
                  <th className="py-4 px-6 text-[12px] font-bold text-[#444653] uppercase text-right w-36">
                    Stok Akhir
                  </th>
                  <th className="py-4 px-6 text-[12px] font-bold text-[#444653] uppercase w-40">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#c4c5d5]/30 bg-white text-[14px] text-[#1a1b22]">
                {currentProducts.length > 0 ? (
                  currentProducts.map((p) => {
                    const summary = getProductStockSummary(p, transactions);
                    const stock = summary.currentStock;
                    const health = summary.health;

                    return (
                      <tr key={p.id} className="hover:bg-[#f4f2fc]/50 transition-colors">
                        <td className="py-4 px-6 font-mono text-[13px] text-[#444653]">
                          {p.code}
                        </td>
                        <td className="py-4 px-6 font-medium text-[#1a1b22]">
                          {p.name}
                        </td>
                        <td className="py-4 px-6 text-[13px] text-[#444653]">
                          {p.supplier}
                        </td>
                        <td
                          className={`py-4 px-6 text-right font-mono text-[13px] font-semibold ${
                            health === 'Habis' ? 'text-[#ba1a1a]' : 'text-[#1a1b22]'
                          }`}
                        >
                          {stock} {p.unit}
                        </td>
                        <td className="py-4 px-6">
                          {health === 'Aman' && (
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#6cf8bb]/20 text-[#00714d] border border-[#6cf8bb]/30">
                              <span className="w-2 h-2 rounded-full bg-[#006c49]" />
                              <span className="text-[11px] font-semibold">Aman</span>
                            </div>
                          )}

                          {health === 'Menipis' && (
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#6b4200]/10 text-[#4c2e00] border border-[#6b4200]/20">
                              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                              <span className="text-[11px] font-semibold">Menipis</span>
                            </div>
                          )}

                          {health === 'Habis' && (
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#ffdad6]/60 text-[#93000a] border border-[#ffdad6]">
                              <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
                              <span className="text-[11px] font-semibold">Habis</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 px-6 text-center text-[#757684]">
                      <span className="material-symbols-outlined text-[36px] text-[#757684] mb-2 block">
                        inventory_2
                      </span>
                      <p className="text-[14px] font-semibold text-[#1a1b22]">
                        Tidak Ada Data Produk
                      </p>
                      <p className="text-[12px] text-[#757684] mt-1 max-w-sm mx-auto">
                        Belum ada data barang yang sesuai dengan filter laporan saat ini.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-[#eeedf7]/60 border-b border-[#c4c5d5]/50">
                  <th className="py-4 px-6 text-[12px] font-bold text-[#444653] uppercase">
                    Tanggal
                  </th>
                  <th className="py-4 px-6 text-[12px] font-bold text-[#444653] uppercase">
                    Kode Transaksi
                  </th>
                  <th className="py-4 px-6 text-[12px] font-bold text-[#444653] uppercase">
                    Produk
                  </th>
                  <th className="py-4 px-6 text-[12px] font-bold text-[#444653] uppercase text-right">
                    Qty Terjual
                  </th>
                  <th className="py-4 px-6 text-[12px] font-bold text-[#444653] uppercase">
                    Tujuan / Outlet
                  </th>
                  <th className="py-4 px-6 text-[12px] font-bold text-[#444653] uppercase">
                    Petugas
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c5d5]/30 bg-white text-[14px] text-[#1a1b22]">
                {outboundTransactions.length > 0 ? (
                  outboundTransactions.slice(0, 10).map((t) => (
                    <tr key={t.id} className="hover:bg-[#f4f2fc]/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-[13px] text-[#444653]">
                        {t.date}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-[#00288e]">
                        {t.code}
                      </td>
                      <td className="py-4 px-6 font-semibold text-[#1a1b22]">
                        {t.productName}
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-[#ba1a1a]">
                        {t.quantity} {t.unit}
                      </td>
                      <td className="py-4 px-6 text-[13px] text-[#444653]">
                        {t.sourceDestination}
                      </td>
                      <td className="py-4 px-6 text-[13px] text-[#757684]">
                        {t.createdBy}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 px-6 text-center text-[#757684]">
                      <span className="material-symbols-outlined text-[36px] text-[#757684] mb-2 block">
                        shopping_bag
                      </span>
                      <p className="text-[14px] font-semibold text-[#1a1b22]">
                        Belum Ada Transaksi Penjualan
                      </p>
                      <p className="text-[12px] text-[#757684] mt-1 max-w-sm mx-auto">
                        Catat pengeluaran barang / penjualan di modul Transaksi untuk melihat rekapitulasi.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Report Footer */}
        <div className="p-4 border-t border-[#c4c5d5]/30 bg-white flex justify-between items-center text-[13px] text-[#444653]">
          <span className="font-semibold text-[#444653]">
            {reportType === 'inventory'
              ? `Menampilkan ${currentProducts.length} dari ${filteredProducts.length} barang`
              : `Menampilkan ${Math.min(10, outboundTransactions.length)} dari total ${outboundTransactions.length} transaksi keluar`}
          </span>

          {reportType === 'inventory' && (
            <div className="flex items-center gap-2 no-print">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-[#eeedf7] disabled:opacity-40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <span className="font-medium text-[#1a1b22]">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-[#eeedf7] disabled:opacity-40 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Pratinjau & Cetak PDF */}
      <ReportPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        products={products}
        suppliers={suppliers}
        transactions={transactions}
        reportFilter={reportFilter}
        currentUser={currentUser}
        initialReportType={reportType}
      />
    </div>
  );
};

