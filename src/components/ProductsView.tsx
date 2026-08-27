import React, { useState, useMemo } from 'react';
import { Product, Supplier } from '../types';
import { ResetProductsModal } from './ResetProductsModal';
import { downloadProductExcelTemplate } from '../utils/excelParser';

interface ProductsViewProps {
  products: Product[];
  suppliers: Supplier[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onOpenImportModal: () => void;
  onExportExcel: () => void;
  onClearAllProducts?: () => void;
  onResetDefaultProducts?: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  suppliers,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteProduct,
  onOpenImportModal,
  onExportExcel,
  onClearAllProducts,
  onResetDefaultProducts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [selectedSupplier, setSelectedSupplier] = useState('Semua Supplier');
  const [currentPage, setCurrentPage] = useState(1);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);
  const itemsPerPage = 6;

  const showNotification = (message: string, type: 'success' | 'danger' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.supplier.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'Semua Kategori' || p.category === selectedCategory;

      const matchesSupplier =
        selectedSupplier === 'Semua Supplier' || p.supplier === selectedSupplier;

      return matchesSearch && matchesCategory && matchesSupplier;
    });
  }, [products, searchQuery, selectedCategory, selectedSupplier]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const formatRupiah = (val: number) => {
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const categories = [
    'Semua Kategori',
    'Minuman',
    'Bahan Baku',
    'Bahan Pokok',
    'Frozen Food',
    'Packaging',
  ];

  const handleResetFiltersOnly = () => {
    onSearchChange('');
    setSelectedCategory('Semua Kategori');
    setSelectedSupplier('Semua Supplier');
    setCurrentPage(1);
    showNotification('Filter pencarian berhasil dibersihkan.');
  };

  const handleClearAll = () => {
    if (onClearAllProducts) {
      onClearAllProducts();
      showNotification('Semua data produk berhasil dihapus/dikosongkan.', 'danger');
    }
  };

  const handleResetDefault = () => {
    if (onResetDefaultProducts) {
      onResetDefaultProducts();
      showNotification('Katalog produk berhasil di-reset ke data default awal.');
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[28px] font-semibold text-[#1a1b22] tracking-tight">
            Master Data Produk
          </h2>
          <p className="text-[14px] text-[#444653] mt-0.5">
            Kelola katalog inventaris, stok produk, import/export, dan konfigurasi master data.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Reset / Hapus Semua Produk Button */}
          <button
            id="btn-reset-produk"
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-[#ba1a1a]/40 bg-[#fff8f7] text-[#ba1a1a] hover:bg-[#ffdad6] rounded-xl transition-colors text-[12px] font-bold cursor-pointer"
            title="Reset atau Hapus Semua Data Produk"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            <span>Reset / Hapus Produk</span>
          </button>

          <button
            id="btn-download-template-excel"
            type="button"
            onClick={() => {
              downloadProductExcelTemplate();
              showNotification('Template Excel produk berhasil diunduh.');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-[#00288e]/30 bg-[#dde1ff]/30 text-[#00288e] hover:bg-[#dde1ff]/60 rounded-xl transition-colors text-[12px] font-bold cursor-pointer"
            title="Download Template Excel untuk Import Produk"
          >
            <span className="material-symbols-outlined text-[18px]">table_chart</span>
            <span>Download Template</span>
          </button>

          <button
            id="btn-import-excel"
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-[#c4c5d5] bg-white text-[#1a1b22] rounded-xl hover:bg-[#f4f2fc] transition-colors text-[12px] font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">upload</span>
            <span>Import Excel</span>
          </button>

          <button
            id="btn-export-excel"
            onClick={onExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-[#c4c5d5] bg-white text-[#1a1b22] rounded-xl hover:bg-[#f4f2fc] transition-colors text-[12px] font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>Export Excel</span>
          </button>

          <button
            id="btn-tambah-produk"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#00288e] text-white rounded-xl hover:bg-[#1e40af] active:ring-2 active:ring-[#00288e]/50 transition-all text-[12px] font-semibold shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-[13px] font-medium animate-in fade-in ${
            notification.type === 'danger'
              ? 'bg-[#ffdad6]/60 border-[#ba1a1a]/30 text-[#93000a]'
              : 'bg-[#6cf8bb]/20 border-[#006c49]/30 text-[#006c49]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">
              {notification.type === 'danger' ? 'delete_sweep' : 'check_circle'}
            </span>
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:opacity-75 rounded cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Filters & Search Bar Card */}
      <div className="bg-white rounded-[24px] ambient-shadow p-4 md:p-6 border border-[#c4c5d5]/30 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-[12px] font-semibold text-[#444653] mb-1.5">
            Pencarian Produk
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#757684]">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              id="search-filter-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari nama, kode, atau supplier produk..."
              className="block w-full pl-10 pr-3 py-2.5 border border-[#c4c5d5] rounded-xl bg-[#fbf8ff] text-[#1a1b22] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] text-[14px]"
            />
          </div>
        </div>

        <div className="w-full md:w-52">
          <label className="block text-[12px] font-semibold text-[#444653] mb-1.5">
            Kategori
          </label>
          <select
            id="filter-category"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full px-3 py-2.5 border border-[#c4c5d5] rounded-xl bg-[#fbf8ff] text-[#1a1b22] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] text-[14px] cursor-pointer font-medium"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-56">
          <label className="block text-[12px] font-semibold text-[#444653] mb-1.5">
            Supplier
          </label>
          <select
            id="filter-supplier"
            value={selectedSupplier}
            onChange={(e) => {
              setSelectedSupplier(e.target.value);
              setCurrentPage(1);
            }}
            className="block w-full px-3 py-2.5 border border-[#c4c5d5] rounded-xl bg-[#fbf8ff] text-[#1a1b22] focus:outline-none focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] text-[14px] cursor-pointer font-medium"
          >
            <option value="Semua Supplier">Semua Supplier</option>
            {suppliers.map((sup) => (
              <option key={sup.id} value={sup.name}>
                {sup.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button (Opens Reset Modal or Resets Filters) */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            id="btn-reset-filters"
            type="button"
            onClick={handleResetFiltersOnly}
            className="px-3.5 py-2.5 border border-[#c4c5d5] bg-white text-[#1a1b22] rounded-xl hover:bg-[#f4f2fc] transition-colors flex items-center justify-center gap-1.5 text-[13px] font-semibold w-full md:w-auto cursor-pointer"
            title="Bersihkan filter dan pencarian"
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
            <span>Reset Filter</span>
          </button>

          <button
            id="btn-reset-all-menu"
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="px-3.5 py-2.5 bg-[#ba1a1a]/10 text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white rounded-xl transition-all flex items-center justify-center gap-1.5 text-[13px] font-bold cursor-pointer"
            title="Opsi Reset & Hapus Data Produk"
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-white rounded-[24px] ambient-shadow border border-[#c4c5d5]/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#c4c5d5]/40">
            <thead className="bg-[#eeedf7]/50">
              <tr>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#444653] uppercase tracking-wider">
                  Kode Produk
                </th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#444653] uppercase tracking-wider">
                  Nama Produk
                </th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#444653] uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#444653] uppercase tracking-wider">
                  Satuan
                </th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#444653] uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-4 text-right text-[12px] font-semibold text-[#444653] uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-4 text-right text-[12px] font-semibold text-[#444653] uppercase tracking-wider">
                  Stok Awal
                </th>
                <th className="px-6 py-4 text-center text-[12px] font-semibold text-[#444653] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-[12px] font-semibold text-[#444653] uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#c4c5d5]/30 bg-white text-[14px] text-[#1a1b22]">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-[#757684]">
                    <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
                      <div className="w-16 h-16 rounded-full bg-[#eeedf7] flex items-center justify-center text-[#757684]">
                        <span className="material-symbols-outlined text-[36px]">inventory_2</span>
                      </div>
                      <h4 className="font-bold text-[16px] text-[#1a1b22]">
                        Katalog Produk Kosong
                      </h4>
                      <p className="text-[13px] text-[#444653]">
                        Belum ada data produk atau semua produk telah di-reset. Anda dapat menambahkan produk baru atau memuat data sampel awal.
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          type="button"
                          onClick={onOpenAddModal}
                          className="px-4 py-2 bg-[#00288e] text-white rounded-xl text-[12px] font-semibold hover:bg-[#1e40af] transition-colors cursor-pointer"
                        >
                          + Tambah Produk Baru
                        </button>
                        {onResetDefaultProducts && (
                          <button
                            type="button"
                            onClick={handleResetDefault}
                            className="px-4 py-2 border border-[#00288e] text-[#00288e] bg-white rounded-xl text-[12px] font-semibold hover:bg-[#f0effa] transition-colors cursor-pointer"
                          >
                            Muat Data Default Pabrik
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : currentProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-[#757684]">
                    <div className="flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-[36px] text-[#c4c5d5]">
                        search_off
                      </span>
                      <p className="font-medium">Tidak ada data produk yang sesuai filter pencarian</p>
                      <button
                        type="button"
                        onClick={handleResetFiltersOnly}
                        className="text-[12px] font-semibold text-[#00288e] hover:underline cursor-pointer"
                      >
                        Reset Filter Pencarian
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                currentProducts.map((p) => {
                  const isActive = p.status === 'Aktif';
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-[#f4f2fc]/60 transition-colors group ${
                        !isActive ? 'bg-[#eeedf7]/20 opacity-80' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-[13px] text-[#00288e] font-medium">
                        {p.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-[#1a1b22]">
                        {p.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#444653]">
                        {p.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#444653]">
                        {p.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[#444653]">
                        {p.supplier}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-mono text-[#1a1b22]">
                        {formatRupiah(p.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold text-[#1a1b22]">
                        {p.initialStock ?? p.currentStock ?? 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                            isActive
                              ? 'bg-[#6cf8bb]/20 text-[#00714d] border-[#6cf8bb]/30'
                              : 'bg-[#ffdad6]/40 text-[#ba1a1a] border-[#ffdad6]'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenEditModal(p)}
                            title="Edit Produk"
                            className="p-1.5 text-[#00288e] hover:bg-[#00288e]/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button
                            onClick={() => onDeleteProduct(p)}
                            title="Hapus Produk"
                            className="p-1.5 text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded-lg transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Card Footer */}
        {products.length > 0 && (
          <div className="bg-white px-6 py-3.5 border-t border-[#c4c5d5]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-[13px] text-[#444653]">
                Menampilkan{' '}
                <span className="font-medium text-[#1a1b22]">
                  {filteredProducts.length === 0 ? 0 : startIndex + 1}
                </span>{' '}
                s/d{' '}
                <span className="font-medium text-[#1a1b22]">
                  {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
                </span>{' '}
                dari{' '}
                <span className="font-medium text-[#1a1b22]">{filteredProducts.length}</span>{' '}
                hasil (total {products.length} master)
              </p>
            </div>

            <div>
              <nav aria-label="Pagination" className="inline-flex rounded-md shadow-xs -space-x-px">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#c4c5d5] bg-white text-sm font-medium text-[#444653] hover:bg-[#f4f2fc] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? 'z-10 bg-[#1e40af]/10 border-[#00288e] text-[#00288e] font-bold'
                        : 'bg-white border-[#c4c5d5] text-[#444653] hover:bg-[#f4f2fc]'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#c4c5d5] bg-white text-sm font-medium text-[#444653] hover:bg-[#f4f2fc] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Reset Products Modal */}
      <ResetProductsModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        productCount={products.length}
        onClearAll={handleClearAll}
        onResetDefault={handleResetDefault}
        onResetFiltersOnly={handleResetFiltersOnly}
      />
    </div>
  );
};
