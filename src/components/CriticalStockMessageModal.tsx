import React, { useState, useEffect } from 'react';
import { Product, Supplier, Transaction } from '../types';
import { getProductStockSummary } from '../utils/stockCalculator';

interface CriticalStockMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  suppliers: Supplier[];
  transactions?: Transaction[];
  initialSupplierName?: string;
  initialProductCode?: string;
  onLogMessageSent?: (log: {
    supplierName: string;
    productCodes: string[];
    channel: 'WhatsApp' | 'Email' | 'Manual';
    date: string;
  }) => void;
}

export const CriticalStockMessageModal: React.FC<CriticalStockMessageModalProps> = ({
  isOpen,
  onClose,
  products,
  suppliers,
  transactions = [],
  initialSupplierName,
  initialProductCode,
  onLogMessageSent,
}) => {
  // Find all critical products (health === 'Habis' || health === 'Menipis')
  const criticalProducts = products.filter((p) => {
    const summary = getProductStockSummary(p, transactions);
    return summary.health === 'Habis' || summary.health === 'Menipis';
  });

  // Group critical products by supplier name
  const suppliersWithCriticalItems = Array.from(
    new Set(criticalProducts.map((p) => p.supplier))
  ).filter(Boolean);

  const [selectedSupplierName, setSelectedSupplierName] = useState<string>('');
  const [orderQuantities, setOrderQuantities] = useState<Record<string, number>>({});
  const [customNotes, setCustomNotes] = useState<string>('');
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<string | null>(null);

  // Initialize selected supplier
  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      setSentSuccess(null);

      if (initialSupplierName && suppliers.some((s) => s.name === initialSupplierName)) {
        setSelectedSupplierName(initialSupplierName);
      } else if (suppliersWithCriticalItems.length > 0) {
        setSelectedSupplierName(suppliersWithCriticalItems[0]);
      } else if (suppliers.length > 0) {
        setSelectedSupplierName(suppliers[0].name);
      }
    }
  }, [isOpen, initialSupplierName, suppliers]);

  // Current active supplier object
  const activeSupplier = suppliers.find((s) => s.name === selectedSupplierName);

  // Products belonging to selected supplier that are critical (or all for that supplier if none critical)
  const supplierCriticalProducts = criticalProducts.filter(
    (p) => p.supplier === selectedSupplierName
  );
  
  // Fallback to all products under supplier if none is critical
  const displayedProducts =
    supplierCriticalProducts.length > 0
      ? supplierCriticalProducts
      : products.filter((p) => p.supplier === selectedSupplierName);

  // Initialize order quantities for items
  useEffect(() => {
    const initialQtys: Record<string, number> = {};
    displayedProducts.forEach((p) => {
      const summary = getProductStockSummary(p, transactions);
      const stock = summary.currentStock;
      const deficit = Math.max(0, p.minStock * 2 - stock);
      initialQtys[p.id] = deficit > 0 ? deficit : p.minStock;
    });
    setOrderQuantities(initialQtys);
  }, [selectedSupplierName, products, transactions]);

  // Generate message template whenever items, quantities, or notes change
  useEffect(() => {
    if (!activeSupplier) {
      setGeneratedMessage('');
      return;
    }

    const todayStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    let itemsListText = '';
    displayedProducts.forEach((p, index) => {
      const summary = getProductStockSummary(p, transactions);
      const stock = summary.currentStock;
      const orderQty = orderQuantities[p.id] || p.minStock;
      const isCritical = summary.health === 'Habis' || summary.health === 'Menipis';
      itemsListText += `${index + 1}. *${p.name}* (${p.code})\n` +
        `   • Sisa Stok Saat Ini: ${stock} ${p.unit} ${isCritical ? '⚠️ [KRITIS]' : ''}\n` +
        `   • Batas Min. Stok: ${p.minStock} ${p.unit}\n` +
        `   • Rekomendasi Pesanan Restock: *${orderQty} ${p.unit}*\n\n`;
    });

    const msg = 
`*SURAT PERMINTAAN RESTOCK INVENTARIS*
*ADDA RASA KJD INVENTORY SYSTEM*
Tanggal: ${todayStr}

Kepada Yth.
*${activeSupplier.name}*
UP: ${activeSupplier.contactPerson || 'Tim Penjualan / Dispatch'}

Dengan hormat,
Melalui pesan otomatis sistem inventaris ADDA RASA KJD, kami ingin memberitahukan bahwa ketersediaan stok fisik untuk produk rekanan Anda telah mencapai *batas minimum / kritis*. 

Berikut adalah rincian permintaan pesanan restock darurat:

${itemsListText.trim()}

${customNotes ? `*Catatan Khusus Pengiriman:* \n${customNotes}\n\n` : ''}Mohon konfirmasi ketersediaan barang, estimasi jadwal pengiriman ke gudang kami, serta faktur/surat jalan terkait.

Terima kasih atas kerja samanya.

Hormat kami,
*Purchasing & Inventory Team*
*ADDA RASA KJD*
Email: purchasing@addarasakjd.com
Telp: +62 21 555-0199`;

    setGeneratedMessage(msg);
  }, [activeSupplier, displayedProducts, orderQuantities, customNotes]);

  if (!isOpen) return null;

  // Format clean phone number for WhatsApp wa.me
  const getCleanWhatsappNumber = (phoneStr: string) => {
    let cleaned = phoneStr.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    }
    return cleaned;
  };

  const handleSendWhatsApp = () => {
    if (!activeSupplier || !activeSupplier.phone) return;
    const cleanPhone = getCleanWhatsappNumber(activeSupplier.phone);
    const encodedText = encodeURIComponent(generatedMessage);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    
    if (onLogMessageSent) {
      onLogMessageSent({
        supplierName: activeSupplier.name,
        productCodes: displayedProducts.map((p) => p.code),
        channel: 'WhatsApp',
        date: new Date().toISOString(),
      });
    }

    setSentSuccess(`Pesan restock berhasil disiapkan & dibuka via WhatsApp untuk ${activeSupplier.name}!`);
    setTimeout(() => setSentSuccess(null), 5000);
  };

  const handleSendEmail = () => {
    if (!activeSupplier || !activeSupplier.email) return;
    const subject = encodeURIComponent(`[URGENT RESTOCK] Permintaan Pasokan Stok Kritis - ADDA RASA KJD (${activeSupplier.name})`);
    const body = encodeURIComponent(generatedMessage);
    const mailtoUrl = `mailto:${activeSupplier.email}?subject=${subject}&body=${body}`;
    
    window.location.href = mailtoUrl;

    if (onLogMessageSent) {
      onLogMessageSent({
        supplierName: activeSupplier.name,
        productCodes: displayedProducts.map((p) => p.code),
        channel: 'Email',
        date: new Date().toISOString(),
      });
    }

    setSentSuccess(`Pesan email berhasil dialihkan ke aplikasi Email resmi Anda untuk ${activeSupplier.name}!`);
    setTimeout(() => setSentSuccess(null), 5000);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[24px] max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-[#c4c5d5]/40 max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-[#c4c5d5]/30">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#ba1a1a]/10 text-[#ba1a1a] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[26px]">forward_to_inbox</span>
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-[#1a1b22] flex items-center gap-2">
                <span>Pesan Otomatis Restock ke Supplier</span>
                {criticalProducts.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffdad6] text-[#ba1a1a]">
                    {criticalProducts.length} Stok Kritis
                  </span>
                )}
              </h3>
              <p className="text-[12px] text-[#444653]">
                Kirimkan surat pesanan darurat otomatis ke vendor rekanan saat stok mencapai batas minimum.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#757684] hover:bg-[#e8e7f1] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {sentSuccess && (
          <div className="mt-4 p-3 bg-[#6cf8bb]/20 border border-[#006c49]/30 rounded-xl text-[#006c49] text-[13px] font-medium flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{sentSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-5">
          {/* Left Column: Supplier & Items selection (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Supplier Selector */}
            <div>
              <label className="block text-[12px] font-bold text-[#444653] uppercase tracking-wider mb-1.5">
                Pilih Mitra Supplier Tujuan
              </label>
              <select
                value={selectedSupplierName}
                onChange={(e) => setSelectedSupplierName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-[#c4c5d5] rounded-xl text-[14px] font-semibold bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
              >
                {suppliers.map((s) => {
                  const critCount = criticalProducts.filter((p) => p.supplier === s.name).length;
                  return (
                    <option key={s.id} value={s.name}>
                      {s.name} {critCount > 0 ? `⚠️ (${critCount} Kritis)` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Supplier Contact Card */}
            {activeSupplier && (
              <div className="p-3.5 bg-[#f4f2fc] rounded-2xl border border-[#c4c5d5]/40 text-[12px] space-y-1.5">
                <div className="flex justify-between items-center font-semibold text-[#1a1b22]">
                  <span>PIC: {activeSupplier.contactPerson}</span>
                  <span className="text-[#00288e] font-mono text-[11px] bg-[#dde1ff] px-1.5 py-0.5 rounded">
                    {activeSupplier.code}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#444653]">
                  <span className="material-symbols-outlined text-[15px] text-[#006c49]">call</span>
                  <span className="font-mono">{activeSupplier.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[#444653]">
                  <span className="material-symbols-outlined text-[15px] text-[#00288e]">mail</span>
                  <span className="truncate">{activeSupplier.email}</span>
                </div>
                <div className="flex items-start gap-2 text-[#757684] pt-1">
                  <span className="material-symbols-outlined text-[15px] shrink-0">location_on</span>
                  <span className="line-clamp-1">{activeSupplier.address}</span>
                </div>
              </div>
            )}

            {/* Items requiring restock list */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[12px] font-bold text-[#444653] uppercase tracking-wider">
                  Daftar Produk & Kuantitas Pesanan
                </label>
                <span className="text-[11px] text-[#757684]">
                  {displayedProducts.length} Produk
                </span>
              </div>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {displayedProducts.length === 0 ? (
                  <div className="p-4 text-center bg-[#fbf8ff] rounded-xl border border-dashed border-[#c4c5d5] text-[12px] text-[#757684]">
                    Tidak ada produk terkait untuk supplier ini.
                  </div>
                ) : (
                  displayedProducts.map((p) => {
                    const summary = getProductStockSummary(p, transactions);
                    const stock = summary.currentStock;
                    const isCritical = summary.health === 'Habis' || summary.health === 'Menipis';
                    return (
                      <div
                        key={p.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isCritical
                            ? 'bg-[#fff8f7] border-[#ffdad6]'
                            : 'bg-white border-[#c4c5d5]/40'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono text-[10px] text-[#00288e] font-semibold">
                              {p.code}
                            </span>
                            <h4 className="text-[13px] font-bold text-[#1a1b22] leading-tight">
                              {p.name}
                            </h4>
                          </div>
                          {isCritical && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#ba1a1a] text-white">
                              Kritis
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#c4c5d5]/30 text-[11px]">
                          <span className="text-[#444653]">
                            Sisa: <strong className={isCritical ? 'text-[#ba1a1a]' : 'text-[#1a1b22]'}>{stock}</strong> / Min: {p.minStock} {p.unit}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-[#00288e]">Order:</span>
                            <input
                              type="number"
                              min="1"
                              value={orderQuantities[p.id] || p.minStock}
                              onChange={(e) =>
                                setOrderQuantities({
                                  ...orderQuantities,
                                  [p.id]: Number(e.target.value),
                                })
                              }
                              className="w-16 px-1.5 py-0.5 border border-[#c4c5d5] rounded text-right font-mono font-bold text-[12px] bg-white"
                            />
                            <span className="text-[#757684] text-[10px]">{p.unit}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Catatan Tambahan / Instruksi Pengiriman
              </label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="Contoh: Mohon kirim via kurir instan sebelum pkl 14:00 WIB"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-xl text-[12px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
              />
            </div>
          </div>

          {/* Right Column: Generated Message Preview & Instant Dispatch (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[12px] font-bold text-[#444653] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#00288e]">description</span>
                  <span>Pratinjau Teks Surat Pesanan (Dapat Diedit)</span>
                </label>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#00288e] hover:underline cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {copied ? 'done' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Tersalin!' : 'Salin Pesan'}</span>
                </button>
              </div>

              <textarea
                rows={12}
                value={generatedMessage}
                onChange={(e) => setGeneratedMessage(e.target.value)}
                className="w-full p-3.5 border border-[#c4c5d5] rounded-2xl text-[12px] font-mono leading-relaxed bg-[#fbf8ff] text-[#1a1b22] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none resize-none shadow-inner"
              />
            </div>

            {/* Quick Dispatch Channels */}
            <div className="bg-[#f0effa] p-4 rounded-2xl border border-[#c4c5d5]/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#1a1b22] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-[#006c49]">send</span>
                  <span>Kirim Pesan Otomatis Langsung:</span>
                </span>
                <span className="text-[11px] text-[#757684]">Pilih channel pengiriman</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* WhatsApp Button */}
                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl font-bold text-[13px] shadow-sm transition-all cursor-pointer transform active:scale-98"
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  <span>Kirim via WhatsApp</span>
                </button>

                {/* Email Button */}
                <button
                  type="button"
                  onClick={handleSendEmail}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-[#00288e] hover:bg-[#1e40af] text-white rounded-xl font-bold text-[13px] shadow-sm transition-all cursor-pointer transform active:scale-98"
                >
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                  <span>Kirim via Email Resmi</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#444653] pt-1">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#006c49]">lock</span>
                  Format pesan terenkripsi & langsung terhubung ke kontak resmi vendor.
                </span>
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="text-[#00288e] font-semibold hover:underline cursor-pointer"
                >
                  Salin Teks Saja
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-[#c4c5d5] rounded-xl text-[13px] font-semibold text-[#444653] hover:bg-[#f4f2fc] transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
