import React, { useState, useEffect } from 'react';
import { Product, Supplier } from '../types';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateProduct: (product: Product) => void;
  product: Product | null;
  suppliers: Supplier[];
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  onUpdateProduct,
  product,
  suppliers,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [supplier, setSupplier] = useState('');
  const [price, setPrice] = useState<number | string>(0);
  const [stock, setStock] = useState<number | string>(0);
  const [minStock, setMinStock] = useState<number | string>(10);
  const [status, setStatus] = useState<'Aktif' | 'Tidak Aktif'>('Aktif');

  useEffect(() => {
    if (product) {
      setCode(product.code || '');
      setName(product.name || '');
      setCategory(product.category || 'Bahan Baku');
      setUnit(product.unit || 'Pcs');
      setSupplier(product.supplier || (suppliers[0]?.name ?? 'Umum'));
      setPrice(product.price ?? 0);
      setStock(product.currentStock ?? product.initialStock ?? 0);
      setMinStock(product.minStock ?? 10);
      setStatus(product.status || 'Aktif');
    }
  }, [product, suppliers]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numPrice = Number(price) >= 0 ? Number(price) : 0;
    const numStock = Number(stock) >= 0 ? Number(stock) : 0;
    const numMinStock = Number(minStock) >= 0 ? Number(minStock) : 10;

    const updatedProduct: Product = {
      ...product,
      id: product.id,
      code: code.trim() || product.code,
      name: name.trim(),
      category: category || product.category || 'Bahan Baku',
      unit: unit || product.unit || 'Pcs',
      supplier: supplier || product.supplier || 'Umum',
      price: numPrice,
      initialStock: numStock,
      currentStock: numStock,
      minStock: numMinStock,
      status,
      healthStatus: numStock <= 0 ? 'Habis' : numStock <= numMinStock ? 'Menipis' : 'Aman',
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    onUpdateProduct(updatedProduct);
    onClose();
  };

  const categories = ['Minuman', 'Bahan Baku', 'Bahan Pokok', 'Frozen Food', 'Packaging'];
  const units = ['Botol', 'Sak', 'Bungkus', 'Pouch', 'Tray', 'Kaleng', 'Slop', 'Rim', 'Pack', 'Pcs', 'Kg', 'Dus'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[24px] max-w-xl w-full p-6 md:p-8 shadow-2xl border border-[#c4c5d5]/40 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-[#c4c5d5]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00288e]/10 text-[#00288e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">edit_note</span>
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-[#1a1b22]">Edit Data Produk</h3>
              <p className="text-[12px] text-[#444653]">Perbarui parameter dan informasi katalog master produk.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#757684] hover:bg-[#e8e7f1] transition-colors cursor-pointer"
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
                className="w-full px-3.5 py-2.5 border border-[#c4c5d5] rounded-xl text-[14px] font-mono bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
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
                className="w-full px-3.5 py-2.5 border border-[#c4c5d5] rounded-xl text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none cursor-pointer"
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
              className="w-full px-3.5 py-2.5 border border-[#c4c5d5] rounded-xl text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none font-medium"
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
                className="w-full px-3.5 py-2.5 border border-[#c4c5d5] rounded-xl text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none cursor-pointer"
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
                className="w-full px-3.5 py-2.5 border border-[#c4c5d5] rounded-xl text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none cursor-pointer"
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
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-[#c4c5d5] rounded-xl text-[14px] font-mono bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Stok Awal / Stok
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-[#c4c5d5] rounded-xl text-[14px] font-mono bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none font-bold text-[#00288e]"
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
                onChange={(e) => setMinStock(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-[#c4c5d5] rounded-xl text-[14px] font-mono bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#444653] mb-1.5">
              Status Produk
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="edit-status"
                  value="Aktif"
                  checked={status === 'Aktif'}
                  onChange={() => setStatus('Aktif')}
                  className="accent-[#00288e] w-4 h-4 cursor-pointer"
                />
                <span className="text-[14px] text-[#006c49] font-bold">Aktif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="edit-status"
                  value="Tidak Aktif"
                  checked={status === 'Tidak Aktif'}
                  onChange={() => setStatus('Tidak Aktif')}
                  className="accent-[#ba1a1a] w-4 h-4 cursor-pointer"
                />
                <span className="text-[14px] text-[#ba1a1a] font-bold">Tidak Aktif</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#c4c5d5]/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-[#c4c5d5] rounded-xl text-[13px] font-bold text-[#444653] hover:bg-[#f4f2fc] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#00288e] text-white rounded-xl text-[13px] font-bold hover:bg-[#1e40af] transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
