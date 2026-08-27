import React, { useState, useMemo, useRef } from 'react';
import { Transaction, Product, Supplier, User } from '../types';
import { APP_LOGO_URL } from '../data/initialData';
import { exportSalesReportToXLSX, SalesExportItem } from '../utils/excelParser';
import { printElement } from '../utils/printHelper';

interface SalesExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  products: Product[];
  suppliers: Supplier[];
  currentUser?: User;
}

export const SalesExportModal: React.FC<SalesExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  products,
  suppliers,
  currentUser,
}) => {
  // Filter States
  const [selectedMonth, setSelectedMonth] = useState<string>('Semua Bulan');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('Semua Supplier');
  const [selectedProduct, setSelectedProduct] = useState<string>('Semua Produk');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'pdfPreview'>('table');

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Month list for 2026 / all transactions
  const monthOptions = [
    'Semua Bulan',
    'Januari 2026',
    'Februari 2026',
    'Maret 2026',
    'April 2026',
    'Mei 2026',
    'Juni 2026',
    'Juli 2026',
    'Agustus 2026',
    'September 2026',
    'Oktober 2026',
    'November 2026',
    'Desember 2026',
  ];

  const monthIndexMap: Record<string, string> = {
    'Januari 2026': '-01',
    'Februari 2026': '-02',
    'Maret 2026': '-03',
    'April 2026': '-04',
    'Mei 2026': '-05',
    'Juni 2026': '-06',
    'Juli 2026': '-07',
    'Agustus 2026': '-08',
    'September 2026': '-09',
    'Oktober 2026': '-10',
    'November 2026': '-11',
    'Desember 2026': '-12',
  };

  // Products mapping for fast lookup
  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((p) => {
      if (p.id) map.set(p.id, p);
      if (p.code) map.set(p.code.toLowerCase(), p);
      if (p.name) map.set(p.name.toLowerCase(), p);
    });
    return map;
  }, [products]);

  // Filter and enrich OUT transactions (Sales / Outbound)
  const salesItems: SalesExportItem[] = useMemo(() => {
    // Only OUT transactions count as sales/distribution
    const outboundTransactions = transactions.filter((t) => t.type === 'OUT');

    return outboundTransactions
      .map((t) => {
        // Find matching product to get real price and supplier if not in transaction
        const matchedProduct =
          (t.productId ? productMap.get(t.productId) : undefined) ||
          productMap.get(t.productCode?.toLowerCase()) ||
          productMap.get(t.productName?.toLowerCase());

        const price = matchedProduct?.price || 0;
        const supplier = matchedProduct?.supplier || t.sourceDestination || 'Umum';
        const category = matchedProduct?.category || t.category || 'Bahan Baku';
        const unit = t.unit || matchedProduct?.unit || 'Pcs';
        const totalPrice = t.quantity * price;

        return {
          id: t.id,
          date: t.date || new Date().toISOString().split('T')[0],
          code: t.code,
          productId: t.productId,
          productCode: t.productCode || matchedProduct?.code || '-',
          productName: t.productName || matchedProduct?.name || 'Produk',
          category,
          supplier,
          unit,
          quantity: t.quantity,
          price,
          totalPrice,
          sourceDestination: t.sourceDestination || 'Penjualan / Kitchen',
          notes: t.notes,
          createdBy: t.createdBy || 'Petugas',
        };
      })
      .filter((item) => {
        // Filter by Month
        if (selectedMonth !== 'Semua Bulan') {
          const monthCode = monthIndexMap[selectedMonth];
          if (monthCode && !item.date.includes(monthCode)) {
            return false;
          }
        }

        // Filter by Supplier
        if (selectedSupplier !== 'Semua Supplier' && item.supplier !== selectedSupplier) {
          return false;
        }

        // Filter by Product
        if (
          selectedProduct !== 'Semua Produk' &&
          item.productName !== selectedProduct &&
          item.productCode !== selectedProduct
        ) {
          return false;
        }

        // Filter by custom Date Range
        if (startDate && item.date < startDate) {
          return false;
        }
        if (endDate && item.date > endDate) {
          return false;
        }

        return true;
      });
  }, [
    transactions,
    productMap,
    selectedMonth,
    selectedSupplier,
    selectedProduct,
    startDate,
    endDate,
  ]);

  // Aggregate statistics
  const totalTransactionsCount = salesItems.length;
  const totalQuantitySold = salesItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const totalRevenue = salesItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
  const uniqueSuppliersCount = new Set(salesItems.map((s) => s.supplier)).size;

  const handleDownloadExcel = () => {
    exportSalesReportToXLSX(salesItems, {
      month: selectedMonth,
      supplier: selectedSupplier,
      product: selectedProduct,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      companyName: 'ADDA RASA KJD',
      companyAddress:
        'Jl. Kayu Jati Dukuh No. 12, Rawamangun, Pulo Gadung, Jakarta Timur 13220',
      companyPhone: '+62 812-3456-7890',
      companyEmail: 'addarasakjd@gmail.com',
    });
  };

  const handlePrintDocument = () => {
    setViewMode('pdfPreview');
    const docTitle = `Laporan_Penjualan_ADDA_RASA_${selectedMonth.replace(/\s+/g, '_')}`;
    setTimeout(() => {
      printElement(printAreaRef.current, docTitle);
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#c4c5d5]/40 overflow-hidden">
        {/* Modal Top Header */}
        <div className="p-5 md:p-6 border-b border-[#c4c5d5]/30 bg-[#fbf8ff] flex items-center justify-between no-print">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#00288e]/10 text-[#00288e] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">point_of_sale</span>
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-[#1a1b22]">
                Download & Cetak Laporan Penjualan
              </h3>
              <p className="text-[13px] text-[#444653]">
                Ekspor data penjualan dan distribusi barang keluar dengan kop surat resmi & logo ADDA RASA.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#757684] hover:bg-[#e8e7f1] transition-colors cursor-pointer"
              title="Tutup Modal"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* Filter Bar Controls */}
          <div className="bg-[#f4f2fc] p-4 md:p-5 rounded-2xl border border-[#c4c5d5]/40 space-y-4 no-print">
            <div className="flex items-center justify-between border-b border-[#c4c5d5]/30 pb-2.5">
              <div className="flex items-center gap-2 text-[#00288e] font-bold text-[13px]">
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span>Pilih Parameter Laporan Penjualan</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedMonth('Semua Bulan');
                  setSelectedSupplier('Semua Supplier');
                  setSelectedProduct('Semua Produk');
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-[12px] font-bold text-[#ba1a1a] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                Reset Filter
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filter 1: Pilih Bulan */}
              <div>
                <label className="block text-[12px] font-bold text-[#444653] mb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#00288e]">calendar_month</span>
                  <span>Pilih Bulan:</span>
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c5d5] rounded-xl text-[13px] font-semibold text-[#1a1b22] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none cursor-pointer"
                >
                  {monthOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 2: Pilih Supplier */}
              <div>
                <label className="block text-[12px] font-bold text-[#444653] mb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#00288e]">local_shipping</span>
                  <span>Pilih Supplier Asal:</span>
                </label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c5d5] rounded-xl text-[13px] font-semibold text-[#1a1b22] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none cursor-pointer"
                >
                  <option value="Semua Supplier">Semua Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 3: Pilih Produk */}
              <div>
                <label className="block text-[12px] font-bold text-[#444653] mb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#00288e]">inventory_2</span>
                  <span>Pilih Produk:</span>
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#c4c5d5] rounded-xl text-[13px] font-semibold text-[#1a1b22] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none cursor-pointer"
                >
                  <option value="Semua Produk">Semua Produk</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.code ? `[${p.code}] ` : ''}{p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Specific Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-[#c4c5d5]/30">
              <div>
                <label className="block text-[11px] font-semibold text-[#757684] mb-1">
                  Rentang Tanggal Mulai (Opsional)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#c4c5d5] rounded-xl text-[13px] text-[#1a1b22] outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#757684] mb-1">
                  Rentang Tanggal Akhir (Opsional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#c4c5d5] rounded-xl text-[13px] text-[#1a1b22] outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 no-print">
            <div className="bg-white p-4 rounded-xl border border-[#c4c5d5]/40 shadow-xs">
              <span className="text-[11px] font-bold text-[#757684] uppercase block">
                Total Transaksi
              </span>
              <span className="text-[22px] font-bold text-[#1a1b22] mt-0.5 block">
                {totalTransactionsCount}
              </span>
              <span className="text-[11px] text-[#00288e] font-semibold">Barang Keluar</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#c4c5d5]/40 shadow-xs">
              <span className="text-[11px] font-bold text-[#757684] uppercase block">
                Total Unit Terjual
              </span>
              <span className="text-[22px] font-bold text-[#006c49] mt-0.5 block font-mono">
                {totalQuantitySold.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-[#006c49] font-semibold">Volume Qty</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#c4c5d5]/40 shadow-xs col-span-2 sm:col-span-2 bg-linear-to-br from-white to-[#f4f2fc]">
              <span className="text-[11px] font-bold text-[#00288e] uppercase block">
                Total Omset / Nilai Penjualan
              </span>
              <span className="text-[22px] font-bold text-[#00288e] mt-0.5 block font-mono">
                Rp {totalRevenue.toLocaleString('id-ID')}
              </span>
              <span className="text-[11px] text-[#444653]">
                Dari {uniqueSuppliersCount} supplier terkait
              </span>
            </div>
          </div>

          {/* Switcher Tab between Table Preview & Print Document Preview */}
          <div className="flex items-center justify-between border-b border-[#c4c5d5]/30 pb-2 no-print">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-[#00288e] text-white shadow-xs'
                    : 'bg-[#f4f2fc] text-[#444653] hover:bg-[#eeedf7]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">table_chart</span>
                <span>Tabel Ringkasan</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('pdfPreview')}
                className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'pdfPreview'
                    ? 'bg-[#00288e] text-white shadow-xs'
                    : 'bg-[#f4f2fc] text-[#444653] hover:bg-[#eeedf7]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">description</span>
                <span>Format Dokumen Resmi (Kop Surat & Logo)</span>
              </button>
            </div>

            <span className="text-[12px] text-[#757684]">
              {salesItems.length} baris data terpilih
            </span>
          </div>

          {/* MODE 1: Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-xl border border-[#c4c5d5]/40 overflow-hidden no-print">
              <div className="overflow-x-auto max-h-[380px]">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead className="bg-[#eeedf7] sticky top-0 z-10 text-[11px] font-bold text-[#444653] uppercase">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      <th className="px-4 py-3">Tanggal</th>
                      <th className="px-4 py-3">Kode Transaksi</th>
                      <th className="px-4 py-3">Produk</th>
                      <th className="px-4 py-3">Supplier</th>
                      <th className="px-4 py-3 text-right">Qty</th>
                      <th className="px-4 py-3 text-right">Harga Satuan</th>
                      <th className="px-4 py-3 text-right">Total (Rp)</th>
                      <th className="px-4 py-3">Tujuan / Outlet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c4c5d5]/30 font-medium text-[#1a1b22]">
                    {salesItems.length > 0 ? (
                      salesItems.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-[#f4f2fc]/50">
                          <td className="px-4 py-2.5 text-[#757684] font-mono">{idx + 1}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap font-mono">{item.date}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap font-mono font-bold text-[#00288e]">
                            {item.code}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="font-semibold text-[#1a1b22] block">
                              {item.productName}
                            </span>
                            <span className="text-[11px] text-[#757684] font-mono">
                              {item.productCode} • {item.category}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-[#444653]">
                            {item.supplier}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold text-[#ba1a1a]">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-[#444653]">
                            Rp {item.price.toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono font-bold text-[#00288e]">
                            Rp {item.totalPrice.toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-2.5 text-[#444653]">
                            {item.sourceDestination}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-[#757684]">
                          <span className="material-symbols-outlined text-[36px] text-[#c4c5d5] block mb-1">
                            production_quantity_limits
                          </span>
                          <p className="font-semibold text-[#1a1b22]">Tidak Ada Data Penjualan</p>
                          <p className="text-[12px] text-[#757684]">
                            Tidak ditemukan data barang keluar yang sesuai dengan kombinasi filter di atas.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODE 2: Printable PDF / Official Document Layout */}
          <div
            ref={printAreaRef}
            className={`bg-white rounded-xl border border-[#c4c5d5]/50 p-6 md:p-8 space-y-6 printable-area ${
              viewMode === 'table' ? 'hidden print:block' : 'block'
            }`}
          >
            {/* Kop Surat Header with ADDA RASA Logo, Company Name, Address, Contact */}
            <div className="border-b-2 border-[#00288e] pb-4 flex flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 shrink-0 flex items-center justify-center">
                  <img
                    src={APP_LOGO_URL}
                    alt="Logo ADDA RASA"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h1 className="text-[22px] font-black text-[#00288e] tracking-tight">
                    ADDA RASA KJD
                  </h1>
                  <p className="text-[12px] font-bold text-[#9D852C] uppercase tracking-wider">
                    Bakery, Kitchen & Beverage Inventory Management
                  </p>
                  <p className="text-[11px] text-[#444653] mt-1 leading-tight">
                    Jl. Kayu Jati Dukuh No. 12, Rawamangun, Pulo Gadung, Jakarta Timur 13220
                  </p>
                  <p className="text-[11px] text-[#757684]">
                    Telp/WA: +62 812-3456-7890 | Email: addarasakjd@gmail.com
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 border-l border-[#c4c5d5]/50 pl-6 hidden sm:block">
                <span className="text-[10px] font-bold text-[#757684] uppercase block">
                  Dokumen Resmi
                </span>
                <span className="text-[13px] font-mono font-bold text-[#1a1b22] block">
                  DOC/SLS/{new Date().getFullYear()}/{String(new Date().getMonth() + 1).padStart(2, '0')}
                </span>
                <span className="text-[11px] text-[#444653] block mt-1">
                  Dicetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Document Title & Filter Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-[#f4f2fc]/60 p-3.5 rounded-xl border border-[#c4c5d5]/40 text-[12px]">
              <div>
                <span className="font-bold text-[#00288e] block text-[14px]">
                  LAPORAN REKAPITULASI PENJUALAN
                </span>
                <span className="text-[#444653]">
                  Periode: <strong>{selectedMonth}</strong> {startDate && endDate ? `(${startDate} s/d ${endDate})` : ''}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-white border border-[#c4c5d5]/50 rounded-lg text-[#1a1b22] font-medium">
                  Supplier: <strong>{selectedSupplier}</strong>
                </span>
                <span className="px-2.5 py-1 bg-white border border-[#c4c5d5]/50 rounded-lg text-[#1a1b22] font-medium">
                  Produk: <strong>{selectedProduct}</strong>
                </span>
              </div>
            </div>

            {/* Printable Table */}
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-[#eeedf7] border-y border-[#c4c5d5]">
                  <th className="py-2.5 px-2 font-bold text-[#1a1b22]">No</th>
                  <th className="py-2.5 px-2 font-bold text-[#1a1b22]">Tgl</th>
                  <th className="py-2.5 px-2 font-bold text-[#1a1b22]">No. Transaksi</th>
                  <th className="py-2.5 px-2 font-bold text-[#1a1b22]">Nama Produk</th>
                  <th className="py-2.5 px-2 font-bold text-[#1a1b22]">Supplier</th>
                  <th className="py-2.5 px-2 font-bold text-[#1a1b22] text-right">Qty</th>
                  <th className="py-2.5 px-2 font-bold text-[#1a1b22] text-right">Harga (Rp)</th>
                  <th className="py-2.5 px-2 font-bold text-[#1a1b22] text-right">Total (Rp)</th>
                  <th className="py-2.5 px-2 font-bold text-[#1a1b22]">Tujuan / Outlet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c4c5d5]/40 text-[#1a1b22]">
                {salesItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-2 text-center text-[#757684]">{idx + 1}</td>
                    <td className="py-2 px-2 font-mono whitespace-nowrap">{item.date}</td>
                    <td className="py-2 px-2 font-mono font-semibold">{item.code}</td>
                    <td className="py-2 px-2">
                      <span className="font-semibold block">{item.productName}</span>
                      <span className="text-[10px] text-[#757684] font-mono">{item.productCode}</span>
                    </td>
                    <td className="py-2 px-2 text-[#444653]">{item.supplier}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2 px-2 text-right font-mono">
                      {item.price.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-[#00288e]">
                      {item.totalPrice.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2 px-2 text-[#444653]">{item.sourceDestination}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#1a1b22] font-bold bg-[#f4f2fc]/80 text-[12px]">
                  <td colSpan={5} className="py-2.5 px-2 text-right uppercase">
                    Total Keseluruhan:
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono">
                    {totalQuantitySold.toLocaleString('id-ID')}
                  </td>
                  <td></td>
                  <td className="py-2.5 px-2 text-right font-mono text-[#00288e]">
                    Rp {totalRevenue.toLocaleString('id-ID')}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>

            {/* Official Signatures Section */}
            <div className="pt-6 grid grid-cols-2 gap-12 text-center text-[12px] text-[#1a1b22]">
              <div>
                <p className="text-[#757684]">Dibuat & Dicatat Oleh,</p>
                <div className="h-16 flex items-end justify-center">
                  <span className="font-bold underline text-[#1a1b22]">
                    {currentUser?.name || 'Petugas Administrasi'}
                  </span>
                </div>
                <p className="text-[11px] text-[#757684]">Staff Inventaris & Kasir</p>
              </div>

              <div>
                <p className="text-[#757684]">Diperiksa & Disetujui Oleh,</p>
                <div className="h-16 flex items-end justify-center">
                  <span className="font-bold underline text-[#1a1b22]">
                    ( .................................................. )
                  </span>
                </div>
                <p className="text-[11px] text-[#757684]">Manager Operasional / Pemilik</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="p-4 md:p-5 border-t border-[#c4c5d5]/30 bg-[#fbf8ff] flex flex-col sm:flex-row justify-between items-center gap-3 no-print">
          <div className="text-[12px] text-[#757684]">
            Format file menyertakan Logo, Alamat, Kontak, dan Rekapitulasi per Supplier.
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 border border-[#c4c5d5] rounded-xl text-[13px] font-bold text-[#444653] hover:bg-[#f4f2fc] transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              id="btn-print-sales-pdf"
              type="button"
              onClick={handlePrintDocument}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 border border-[#00288e]/30 bg-[#dde1ff]/40 text-[#00288e] hover:bg-[#dde1ff]/80 rounded-xl text-[13px] font-bold transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              id="btn-download-sales-xlsx"
              type="button"
              onClick={handleDownloadExcel}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 bg-[#00288e] text-white hover:bg-[#1e40af] rounded-xl text-[13px] font-bold shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Download Excel (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
