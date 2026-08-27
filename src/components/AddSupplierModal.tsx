import React, { useState, useEffect } from 'react';
import { Supplier } from '../types';

interface AddSupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  existingCount?: number;
}

export const AddSupplierModal: React.FC<AddSupplierModalProps> = ({
  isOpen,
  onClose,
  onAddSupplier,
  existingCount = 5,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('+62 ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [productCount, setProductCount] = useState(0);
  const [distributionPercentage, setDistributionPercentage] = useState(10);
  const [status, setStatus] = useState<'Aktif' | 'Non-Aktif'>('Aktif');

  useEffect(() => {
    if (isOpen) {
      const nextNum = String(existingCount + 1).padStart(3, '0');
      setCode(`SUP-${nextNum}`);
      setName('');
      setContactPerson('');
      setPhone('+62 ');
      setEmail('');
      setAddress('');
      setProductCount(0);
      setDistributionPercentage(10);
      setStatus('Aktif');
    }
  }, [isOpen, existingCount]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddSupplier({
      code: code.trim() || `SUP-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      contactPerson: contactPerson.trim() || 'PIC Purchasing',
      phone: phone.trim() || '+62 21 555-0100',
      email: email.trim() || 'contact@supplier.com',
      address: address.trim() || 'Kawasan Industri Jakarta',
      productCount: Number(productCount),
      distributionPercentage: Number(distributionPercentage),
      status,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[24px] max-w-lg w-full p-6 md:p-8 shadow-2xl border border-[#c4c5d5]/40 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-[#c4c5d5]/30">
          <div>
            <h3 className="text-[20px] font-bold text-[#1a1b22]">Tambah Mitra Supplier Baru</h3>
            <p className="text-[12px] text-[#444653]">Daftarkan vendor distributor rekanan pasokan inventaris.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#757684] hover:bg-[#e8e7f1] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Kode Supplier
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="SUP-005"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] font-mono bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Status Awal
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Non-Aktif')}
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
              >
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#444653] mb-1">
              Nama Perusahaan / Supplier
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: PT. Pangan Segar Sejahtera"
              className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Nama Kontak (PIC)
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Contoh: Bpk. Bambang"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Pangsa Pasokan (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={distributionPercentage}
                onChange={(e) => setDistributionPercentage(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] font-mono bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Nomor Telepon / WA
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+62 812 3456 7890"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] font-mono bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-[#444653] mb-1">
                Email Resmi
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sales@pangansegar.com"
                className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#444653] mb-1">
              Alamat Gudang / Kantor
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Kawasan Industri Pulogadung Blok B-12, Jakarta Timur"
              className="w-full px-3 py-2 border border-[#c4c5d5] rounded-lg text-[14px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none resize-none"
              required
            />
          </div>

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
              Simpan Supplier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
