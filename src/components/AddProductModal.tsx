import React, { useState } from 'react';
import { Product, Supplier } from '../types';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  suppliers: Supplier[];
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
  suppliers,
}) => {
  const [code, setCode] = useState('PRD-');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Minuman');
  const [unit, setUnit] = useState('Botol');
  const [supplier, setSupplier] = useState(suppliers[0]?.name || 'PT ABC Food');
  const [price, setPrice] = useState<number>(25000);
  const [initialStock, setInitialStock] = useState<number>(100);
  const [minStock, setMinStock] = useState<number>(15);
  const [status, setStatus] = useState<'Aktif' | 'Tidak Aktif'>('Aktif');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddProduct({
      code: code || `PRD-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      category,
      unit,
      supplier,
      price: Number(price),
      initialStock: Number(initialStock),
      currentStock: Number(initialStock),
      minStock: Number(minStock),
      status,
      healthStatus: initialStock <= 0 ? 'Habis' : initialStock <= minStock ? 'Menipis' : 'Aman',
      lastUpdated: new Date().toISOString().split('T')[0],
    });

    onClose();
  };

  const categories = ['Minuman', 'Bahan Baku', 'Bahan Pokok', 'Frozen Food', 'Packaging'];
  const units = ['Botol', 'Sak', 'Bungkus', 'Pouch', 'Tray', 'Kaleng', 'Slop', 'Rim', 'Pack', 'Pcs', 'Kg'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[24px] max-w-xl w-full p-6 md:p-8 shadow-2xl border border-[#c4c5d5]/40 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-[#c4c5d5]/30">
          <div>
            <h3 className="text-[20px] font-bold text-[#1a1b22]">Tambah Master Produk</h3>
            <p className="text-[12px] text-[#444653]">Daftarkan item produk baru ke dalam katalog inventaris.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#757684] hover:bg-[#e8e7f1] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Kode Produk (SKU)
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Contoh: PRD-004"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] font-mono bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Kategori
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
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#444653] mb-1">
              Nama Produk
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Sirup Rasa Melon 750ml"
              className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Satuan Kemasan
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none cursor-pointer"
              >
                {units.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Mitra Supplier
              </label>
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none cursor-pointer"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Harga (Rp)
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] font-mono bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Stok Awal
              </label>
              <input
                type="number"
                min="0"
                value={initialStock}
                onChange={(e) => setInitialStock(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] font-mono bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Batas Min. Stok
              </label>
              <input
                type="number"
                min="0"
                value={minStock}
                onChange={(e) => setMinStock(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] font-mono bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#444653] mb-1">
              Status Produk
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Aktif"
                  checked={status === 'Aktif'}
                  onChange={() => setStatus('Aktif')}
                  className="accent-[#00288e]"
                />
                <span className="text-[14px] text-[#006c49] font-medium">Aktif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="Tidak Aktif"
                  checked={status === 'Tidak Aktif'}
                  onChange={() => setStatus('Tidak Aktif')}
                  className="accent-[#ba1a1a]"
                />
                <span className="text-[14px] text-[#ba1a1a] font-medium">Tidak Aktif</span>
              </label>
            </div>
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
              Simpan Produk
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
