import React, { useState } from 'react';
import { NavigationTab, Product, Transaction } from '../types';
import { CATEGORY_METRICS } from '../data/initialData';
import {
  calculateInventoryMetrics,
  getProductStockSummary,
  getRealStock as getRealStockUtil,
} from '../utils/stockCalculator';

interface DashboardViewProps {
  products: Product[];
  transactions: Transaction[];
  onNavigate: (tab: NavigationTab) => void;
  onQuickAddProduct: () => void;
  onQuickAddTransaction: () => void;
  onOpenCriticalMessageModal?: (supplierName?: string) => void;
}

export const getRealStock = (p: Product, transactions: Transaction[] = []): number => {
  return getRealStockUtil(p, transactions);
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  products,
  transactions,
  onNavigate,
  onQuickAddProduct,
  onQuickAddTransaction,
  onOpenCriticalMessageModal,
}) => {
  const [hoveredSupplier, setHoveredSupplier] = useState<string | null>(null);

  // Use the single source of truth for all inventory calculations
  const {
    totalProducts,
    totalStock,
    criticalProducts,
    totalIn: itemsIn,
    totalOutUnits: itemsOut,
  } = calculateInventoryMetrics(products, transactions);

  // Dynamic Supplier Distribution based on actual real product stock
  const supplierCounts: Record<string, number> = {};
  products.forEach((p) => {
    const supName = p.supplier || 'Tanpa Supplier';
    const realQty = getRealStockUtil(p, transactions);
    supplierCounts[supName] = (supplierCounts[supName] || 0) + realQty;
  });

  const supplierColors = ['#00288e', '#1e40af', '#3755c3', '#a8b8ff', '#757684', '#c4c5d5'];
  const computedSuppliers = Object.entries(supplierCounts).map(([name, count], index) => {
    const percentage = totalStock > 0 ? Math.round((count / totalStock) * 100) : 0;
    return {
      name,
      count: `${count.toLocaleString('id-ID')} unit`,
      percentage,
      color: supplierColors[index % supplierColors.length],
    };
  });

  // Compute conic gradient background for donut chart
  let gradientAccumulator = 0;
  const gradientStops = computedSuppliers.map((s) => {
    const start = gradientAccumulator;
    gradientAccumulator += s.percentage;
    return `${s.color} ${start}% ${gradientAccumulator}%`;
  });
  const conicGradient =
    computedSuppliers.length > 0 && totalStock > 0
      ? `conic-gradient(${gradientStops.join(', ')})`
      : '#e3e1eb';

  // Dynamic Category Distribution based on actual real product stock
  const categoryCounts: Record<string, number> = {};
  products.forEach((p) => {
    const cat = p.category || 'Lainnya';
    const realQty = getRealStockUtil(p, transactions);
    categoryCounts[cat] = (categoryCounts[cat] || 0) + realQty;
  });

  const categoryEntries = Object.entries(categoryCounts);
  const maxCategoryCount = Math.max(...categoryEntries.map(([, count]) => count), 1);
  const categoryMetrics = categoryEntries.map(([name, count], index) => ({
    name,
    count: `${count.toLocaleString('id-ID')} unit`,
    rawCount: count,
    percentage: Math.round((count / maxCategoryCount) * 100),
    color: supplierColors[index % supplierColors.length],
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric Card 1: Total SKU / Produk */}
        <div
          id="metric-total-produk"
          onClick={() => onNavigate('produk')}
          className="bg-white rounded-[24px] p-6 ambient-shadow hover:-translate-y-1 transition-all duration-200 border border-[#c4c5d5]/30 flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[12px] font-semibold text-[#444653] uppercase tracking-wider">
              Total Produk (SKU)
            </span>
            <div className="w-8 h-8 rounded-full bg-[#1e40af]/10 flex items-center justify-center text-[#00288e] group-hover:bg-[#00288e] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
          </div>
          <div>
            <div className="text-[36px] font-bold text-[#1a1b22] mb-1 tracking-tight">
              {totalProducts.toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-1 text-[12px] font-semibold text-[#006c49]">
              <span className="material-symbols-outlined text-[14px]">
                {totalProducts > 0 ? 'check_circle' : 'info'}
              </span>
              <span>{totalProducts > 0 ? `${totalProducts} SKU terdaftar di master` : 'Belum ada produk'}</span>
            </div>
          </div>
        </div>

        {/* Metric Card 2: Total Stok Fisik (Real Stock from Menu Stok) */}
        <div
          id="metric-total-stok"
          onClick={() => onNavigate('stok')}
          className="bg-white rounded-[24px] p-6 ambient-shadow hover:-translate-y-1 transition-all duration-200 border border-[#c4c5d5]/30 flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[12px] font-semibold text-[#444653] uppercase tracking-wider">
              Total Stok Fisik
            </span>
            <div className="w-8 h-8 rounded-full bg-[#00288e]/10 flex items-center justify-center text-[#00288e] group-hover:bg-[#00288e] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">inventory</span>
            </div>
          </div>
          <div>
            <div className="text-[36px] font-bold text-[#1a1b22] mb-1 tracking-tight">
              {totalStock.toLocaleString('id-ID')} <span className="text-[18px] font-semibold text-[#757684]">Unit</span>
            </div>
            <div className="flex items-center gap-1 text-[12px] font-semibold text-[#006c49]">
              <span className="material-symbols-outlined text-[14px]">
                {criticalProducts.length === 0 ? 'check_circle' : 'warning'}
              </span>
              <span className={criticalProducts.length > 0 ? 'text-[#ba1a1a]' : 'text-[#006c49]'}>
                {criticalProducts.length > 0
                  ? `${criticalProducts.length} SKU stok kritis di Menu Stok`
                  : totalStock > 0
                  ? `Real stok sinkron (${totalProducts} SKU)`
                  : 'Stok kosong (0 unit)'}
              </span>
            </div>
          </div>
        </div>

        {/* Metric Card 3: Barang Masuk */}
        <div
          id="metric-barang-masuk"
          onClick={() => onNavigate('transaksi')}
          className="bg-white rounded-[24px] p-6 ambient-shadow hover:-translate-y-1 transition-all duration-200 border border-[#c4c5d5]/30 flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[12px] font-semibold text-[#444653] uppercase tracking-wider">
              Barang Masuk
            </span>
            <div className="w-8 h-8 rounded-full bg-[#006c49]/10 flex items-center justify-center text-[#006c49] group-hover:bg-[#006c49] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
            </div>
          </div>
          <div>
            <div className="text-[36px] font-bold text-[#1a1b22] mb-1 tracking-tight">
              {itemsIn.toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-1 text-[12px] font-medium text-[#444653]">
              <span>Total mutasi unit masuk</span>
            </div>
          </div>
        </div>

        {/* Metric Card 4: Barang Keluar */}
        <div
          id="metric-barang-keluar"
          onClick={() => onNavigate('transaksi')}
          className="bg-white rounded-[24px] p-6 ambient-shadow hover:-translate-y-1 transition-all duration-200 border border-[#c4c5d5]/30 flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <span className="text-[12px] font-semibold text-[#444653] uppercase tracking-wider">
              Barang Keluar
            </span>
            <div className="w-8 h-8 rounded-full bg-[#ba1a1a]/10 flex items-center justify-center text-[#ba1a1a] group-hover:bg-[#ba1a1a] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
            </div>
          </div>
          <div>
            <div className="text-[36px] font-bold text-[#1a1b22] mb-1 tracking-tight">
              {itemsOut.toLocaleString('id-ID')}
            </div>
            <div className="flex items-center gap-1 text-[12px] font-medium text-[#444653]">
              <span>Total mutasi unit keluar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier Distribution (Donut Chart representation) */}
        <div
          id="card-supplier-distribution"
          className="lg:col-span-1 bg-white rounded-[24px] p-6 ambient-shadow border border-[#c4c5d5]/30 flex flex-col justify-between"
        >
          <div className="border-b border-[#c4c5d5]/40 pb-4 mb-4 flex justify-between items-center">
            <h3 className="text-[20px] font-semibold text-[#1a1b22]">
              Distribusi Supplier
            </h3>
            <button
              onClick={() => onNavigate('supplier')}
              className="text-[#00288e] text-[12px] font-semibold hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center py-2 min-h-[260px]">
            {computedSuppliers.length > 0 && totalStock > 0 ? (
              <>
                {/* CSS Conic Gradient Donut */}
                <div
                  className="relative w-44 h-44 rounded-full flex items-center justify-center mb-6 shadow-xs transition-transform hover:scale-105 duration-300 cursor-pointer"
                  style={{
                    background: conicGradient,
                  }}
                  title="Distribusi Supplier"
                >
                  <div className="w-28 h-28 bg-white rounded-full absolute flex flex-col items-center justify-center shadow-inner">
                    <span className="text-[10px] font-semibold text-[#757684] uppercase tracking-wider text-center px-2 truncate max-w-[100px]">
                      {hoveredSupplier || 'Distribusi'}
                    </span>
                    <span className="text-[22px] font-bold text-[#00288e]">
                      {hoveredSupplier
                        ? computedSuppliers.find((s) => s.name === hoveredSupplier)?.percentage + '%'
                        : computedSuppliers[0]?.percentage + '%'}
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="w-full space-y-2 text-[13px] max-h-40 overflow-y-auto">
                  {computedSuppliers.map((item) => (
                    <div
                      key={item.name}
                      onMouseEnter={() => setHoveredSupplier(item.name)}
                      onMouseLeave={() => setHoveredSupplier(null)}
                      className="flex justify-between items-center p-1.5 rounded-lg hover:bg-[#f4f2fc] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-[#1a1b22] font-medium truncate">{item.name}</span>
                      </div>
                      <span className="font-semibold text-[#1a1b22] shrink-0 ml-2">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 text-[#757684]">
                <div className="w-14 h-14 rounded-full bg-[#f4f2fc] flex items-center justify-center mb-3 text-[#00288e]">
                  <span className="material-symbols-outlined text-[28px]">pie_chart</span>
                </div>
                <p className="text-[14px] font-semibold text-[#1a1b22]">Belum Ada Data Supplier</p>
                <p className="text-[12px] text-[#757684] mt-1 max-w-[200px]">
                  Tambahkan produk dan data supplier untuk melihat grafik proporsi pasokan.
                </p>
                <button
                  onClick={onQuickAddProduct}
                  className="mt-4 px-3 py-1.5 bg-[#00288e] text-white text-[12px] font-semibold rounded-lg hover:bg-[#1e40af] transition-colors cursor-pointer"
                >
                  + Tambah Produk
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Produk Berdasarkan Kategori (Bar Chart representation) */}
        <div
          id="card-category-distribution"
          className="lg:col-span-2 bg-white rounded-[24px] p-6 ambient-shadow border border-[#c4c5d5]/30 flex flex-col justify-between"
        >
          <div className="border-b border-[#c4c5d5]/40 pb-4 mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-[20px] font-semibold text-[#1a1b22]">
                Produk Berdasarkan Kategori
              </h3>
              <p className="text-[12px] text-[#444653]">
                Jumlah unit produk aktif per kelompok kategori
              </p>
            </div>
            <button
              id="btn-view-report"
              onClick={() => onNavigate('laporan')}
              className="text-[#00288e] hover:text-[#1e40af] text-[12px] font-semibold uppercase flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-[#1e40af]/5 cursor-pointer"
            >
              <span>View Report</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          <div className="flex-1 py-4 flex flex-col justify-center min-h-[260px]">
            {categoryMetrics.length > 0 ? (
              <div className="space-y-4">
                {categoryMetrics.map((cat) => (
                  <div key={cat.name} className="group">
                    <div className="flex justify-between text-[13px] mb-1.5">
                      <span className="text-[#1a1b22] font-medium group-hover:text-[#00288e] transition-colors">
                        {cat.name}
                      </span>
                      <span className="font-semibold text-[#1a1b22]">{cat.count}</span>
                    </div>
                    <div className="w-full h-3.5 bg-[#e8e7f1] rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out shadow-xs"
                        style={{
                          width: `${Math.max(6, cat.percentage)}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8 text-[#757684]">
                <div className="w-14 h-14 rounded-full bg-[#f4f2fc] flex items-center justify-center mb-3 text-[#00288e]">
                  <span className="material-symbols-outlined text-[28px]">bar_chart</span>
                </div>
                <p className="text-[14px] font-semibold text-[#1a1b22]">Belum Ada Kategori Produk</p>
                <p className="text-[12px] text-[#757684] mt-1 max-w-[280px]">
                  Kategori akan otomatis terhitung saat Anda memasukkan data produk baru.
                </p>
                <button
                  onClick={onQuickAddProduct}
                  className="mt-4 px-4 py-2 bg-[#00288e] text-white text-[12px] font-semibold rounded-xl hover:bg-[#1e40af] transition-colors cursor-pointer"
                >
                  + Tambah Produk Baru
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Notification on Dashboard */}
      {criticalProducts.length > 0 && onOpenCriticalMessageModal && (
        <div className="bg-[#fff8f7] rounded-[24px] p-5 border border-[#ffdad6] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#ba1a1a] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">notification_important</span>
            </div>
            <div>
              <h4 className="font-bold text-[15px] text-[#ba1a1a] flex items-center gap-2">
                <span>Perhatian: {criticalProducts.length} Produk Mengalami Stok Kritis!</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#ba1a1a] text-white font-bold">
                  Batas Min
                </span>
              </h4>
              <p className="text-[12px] text-[#444653] mt-0.5">
                Segera kirimkan surat pesanan darurat otomatis ke vendor supplier untuk menghindari kekosongan stok.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
            <button
              onClick={() => onNavigate('stok')}
              className="px-3.5 py-2 rounded-xl border border-[#c4c5d5] bg-white text-[#444653] hover:bg-[#f4f2fc] text-[12px] font-semibold transition-colors cursor-pointer"
            >
              Lihat Stok
            </button>
            <button
              onClick={() => onOpenCriticalMessageModal()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white rounded-xl text-[12px] font-bold shadow-xs transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
              <span>Kirim Pesan ke Supplier</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Action bar */}
      <div className="bg-white rounded-[24px] p-5 ambient-shadow border border-[#c4c5d5]/30 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#00288e]/10 flex items-center justify-center text-[#00288e]">
            <span className="material-symbols-outlined">bolt</span>
          </div>
          <div>
            <h4 className="font-semibold text-[15px] text-[#1a1b22]">Aksi Cepat Inventaris</h4>
            <p className="text-[12px] text-[#444653]">
              Kelola stok baru atau catat transaksi barang masuk/keluar hari ini
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onQuickAddProduct}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-[#c4c5d5] bg-white text-[#1a1b22] rounded-lg hover:bg-[#f4f2fc] text-[12px] font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add_box</span>
            <span>+ Tambah Produk</span>
          </button>
          <button
            onClick={onQuickAddTransaction}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#00288e] text-white rounded-lg hover:bg-[#1e40af] text-[12px] font-semibold transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">sync_alt</span>
            <span>+ Catat Transaksi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
