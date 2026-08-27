import React, { useState } from 'react';
import { Product, Transaction } from '../types';
import { getProductStockSummary, getRealStock } from '../utils/stockCalculator';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (trx: Omit<Transaction, 'id'>) => void;
  products: Product[];
  transactions?: Transaction[];
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  products,
  transactions = [],
}) => {
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState(10);
  const [sourceDestination, setSourceDestination] = useState('PT ABC Food');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const selectedProd = products.find((p) => p.id === productId) || products[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProd) return;

    onAddTransaction({
      code: `TRX-${Date.now().toString().slice(-6)}`,
      type,
      productId: selectedProd.id,
      productCode: selectedProd.code,
      productName: selectedProd.name,
      quantity: Number(quantity),
      unit: selectedProd.unit,
      sourceDestination,
      date: new Date().toISOString().split('T')[0],
      notes,
      createdBy: 'Admin',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 md:p-8 shadow-2xl border border-[#c4c5d5]/40">
        <div className="flex justify-between items-center pb-4 border-b border-[#c4c5d5]/30">
          <div>
            <h3 className="text-[20px] font-bold text-[#1a1b22]">Catat Mutasi Stok</h3>
            <p className="text-[12px] text-[#444653]">Entri penerimaan barang masuk atau pengeluaran outlet.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#757684] hover:bg-[#e8e7f1] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div>
            <label className="block text-[12px] font-semibold text-[#444653] mb-1.5">
              Jenis Transaksi
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType('IN');
                  setSourceDestination(selectedProd?.supplier || 'Supplier Pusat');
                }}
                className={`py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-semibold text-[13px] transition-all cursor-pointer ${
                  type === 'IN'
                    ? 'bg-[#006c49] text-white border-[#006c49] shadow-xs'
                    : 'bg-white text-[#444653] border-[#c4c5d5] hover:bg-[#f4f2fc]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">arrow_downward</span>
                <span>Barang Masuk (IN)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('OUT');
                  setSourceDestination('Outlet Cabang Sudirman');
                }}
                className={`py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 font-semibold text-[13px] transition-all cursor-pointer ${
                  type === 'OUT'
                    ? 'bg-[#ba1a1a] text-white border-[#ba1a1a] shadow-xs'
                    : 'bg-white text-[#444653] border-[#c4c5d5] hover:bg-[#f4f2fc]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                <span>Barang Keluar (OUT)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#444653] mb-1">
              Pilih Produk
            </label>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                const p = products.find((x) => x.id === e.target.value);
                if (p && type === 'IN') {
                  setSourceDestination(p.supplier);
                }
              }}
              className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none cursor-pointer"
            >
              {products.map((p) => {
                const realStock = getRealStock(p, transactions);
                return (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name} (Stok: {realStock} {p.unit})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Kuantitas ({selectedProd?.unit || 'Item'})
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] font-mono bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                {type === 'IN' ? 'Pemasok / Supplier' : 'Tujuan Distribusi / Outlet'}
              </label>
              <input
                type="text"
                value={sourceDestination}
                onChange={(e) => setSourceDestination(e.target.value)}
                placeholder={type === 'IN' ? 'Nama Supplier' : 'Outlet Sudirman'}
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#444653] mb-1">
              Catatan Transaksi / Nomor Surat Jalan
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Surat Jalan No. SJ-2026/08/99"
              className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
            />
          </div>

          {/* Projected Stock Warning for OUT transactions */}
          {selectedProd && type === 'OUT' && (
            (() => {
              const current = getRealStock(selectedProd, transactions);
              const projected = current - Number(quantity);
              const willBeCritical = projected <= selectedProd.minStock;
              return (
                <div
                  className={`p-3 rounded-xl border text-[12px] flex items-center justify-between ${
                    willBeCritical
                      ? 'bg-[#fff8f7] border-[#ffdad6] text-[#ba1a1a]'
                      : 'bg-[#f4f2fc] border-[#c4c5d5]/40 text-[#444653]'
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[16px]">
                      {willBeCritical ? 'warning' : 'inventory'}
                    </span>
                    <span>
                      Estimasi sisa stok setelah transaksi:{' '}
                      <strong className="font-mono font-bold">{Math.max(0, projected)} {selectedProd.unit}</strong>
                    </span>
                  </span>
                  {willBeCritical && (
                    <span className="font-bold px-2 py-0.5 rounded bg-[#ba1a1a] text-white text-[10px]">
                      ⚠️ Stok Menipis / Kritis
                    </span>
                  )}
                </div>
              );
            })()
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#c4c5d5]/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#c4c5d5] rounded-lg text-[13px] font-semibold text-[#444653] hover:bg-[#f4f2fc] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00288e] text-white rounded-lg text-[13px] font-semibold hover:bg-[#1e40af] transition-all shadow-xs cursor-pointer"
            >
              Simpan Transaksi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
