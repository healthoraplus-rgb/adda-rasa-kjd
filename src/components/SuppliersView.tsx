import React, { useState } from 'react';
import { Supplier } from '../types';

interface SuppliersViewProps {
  suppliers: Supplier[];
  onOpenAddSupplierModal: () => void;
  onEditSupplier?: (supplier: Supplier) => void;
  onDeleteSupplier?: (id: string) => void;
  onToggleStatus?: (supplier: Supplier) => void;
  onOpenCriticalMessageModal?: (supplierName?: string) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  onOpenAddSupplierModal,
  onEditSupplier,
  onDeleteSupplier,
  onToggleStatus,
  onOpenCriticalMessageModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Aktif' | 'Tidak Aktif'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredSuppliers = suppliers.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'Aktif' && s.status === 'Aktif') ||
      (statusFilter === 'Tidak Aktif' && s.status === 'Tidak Aktif');

    return matchesSearch && matchesStatus;
  });

  const totalActive = suppliers.filter((s) => s.status === 'Aktif').length;
  const totalSupplyPercentage = suppliers.reduce(
    (acc, s) => acc + (s.distributionPercentage || 0),
    0
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-[26px] md:text-[28px] font-bold text-[#1a1b22] tracking-tight">
            Master Mitra Supplier
          </h2>
          <p className="text-[14px] text-[#444653] mt-0.5">
            Daftar distributor rekanan resmi, kontak PIC, dan sistem otomatisasi pesan restock pasokan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenCriticalMessageModal && (
            <button
              onClick={() => onOpenCriticalMessageModal()}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#ba1a1a] text-white rounded-xl hover:bg-[#93000a] text-[13px] font-semibold transition-all shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
              <span>Kirim Pesan Restock Kritis</span>
            </button>
          )}

          <button
            onClick={onOpenAddSupplierModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#00288e] text-white rounded-xl hover:bg-[#1e40af] text-[13px] font-semibold transition-all shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add_business</span>
            <span>+ Tambah Supplier Baru</span>
          </button>
        </div>
      </div>

      {/* Metric summary badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-[20px] p-4.5 border border-[#c4c5d5]/30 ambient-shadow flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#00288e]/10 text-[#00288e] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">storefront</span>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#757684]">Total Mitra Rekanan</p>
            <p className="text-[22px] font-bold text-[#1a1b22]">{suppliers.length} Vendor</p>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-4.5 border border-[#c4c5d5]/30 ambient-shadow flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#00714d]/10 text-[#00714d] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">verified</span>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#757684]">Supplier Aktif</p>
            <p className="text-[22px] font-bold text-[#00714d]">{totalActive} Aktif</p>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-4.5 border border-[#c4c5d5]/30 ambient-shadow flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#595992]/10 text-[#595992] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[26px]">pie_chart</span>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[#757684]">Total Alokasi Pasokan</p>
            <p className="text-[22px] font-bold text-[#1a1b22]">{totalSupplyPercentage}%</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-[20px] p-4 border border-[#c4c5d5]/30 ambient-shadow flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#757684]">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kode, nama vendor, PIC, atau alamat..."
            className="w-full pl-9 pr-3 py-2 border border-[#c4c5d5] rounded-xl text-[13px] bg-[#fbf8ff] focus:ring-2 focus:ring-[#00288e]/20 focus:border-[#00288e] outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-[#f0effa] p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-[#00288e] shadow-xs'
                : 'text-[#444653] hover:text-[#1a1b22]'
            }`}
          >
            Semua ({suppliers.length})
          </button>
          <button
            onClick={() => setStatusFilter('Aktif')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
              statusFilter === 'Aktif'
                ? 'bg-white text-[#00714d] shadow-xs'
                : 'text-[#444653] hover:text-[#1a1b22]'
            }`}
          >
            Aktif ({totalActive})
          </button>
          <button
            onClick={() => setStatusFilter('Tidak Aktif')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all cursor-pointer ${
              statusFilter === 'Tidak Aktif'
                ? 'bg-white text-[#ba1a1a] shadow-xs'
                : 'text-[#444653] hover:text-[#1a1b22]'
            }`}
          >
            Non-Aktif ({suppliers.length - totalActive})
          </button>
        </div>
      </div>

      {/* Grid of Supplier Cards */}
      {filteredSuppliers.length === 0 ? (
        <div className="bg-white rounded-[24px] p-12 text-center border border-[#c4c5d5]/30">
          <span className="material-symbols-outlined text-[48px] text-[#757684] mb-2">
            storefront
          </span>
          <h3 className="text-[16px] font-bold text-[#1a1b22]">Tidak Ada Supplier Ditemukan</h3>
          <p className="text-[13px] text-[#757684] mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau daftarkan distributor rekanan baru.
          </p>
          <button
            onClick={onOpenAddSupplierModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#00288e] text-white rounded-xl text-[13px] font-semibold hover:bg-[#1e40af] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_business</span>
            <span>+ Tambah Supplier Baru</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((s) => {
            const isDeleting = deleteConfirmId === s.id;
            return (
              <div
                key={s.id}
                className="bg-white rounded-[24px] p-6 ambient-shadow border border-[#c4c5d5]/30 flex flex-col justify-between hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-mono text-[11px] text-[#00288e] font-semibold bg-[#dde1ff]/70 px-2 py-0.5 rounded-md">
                        {s.code}
                      </span>
                      <h3 className="text-[17px] font-bold text-[#1a1b22] mt-1.5 line-clamp-1">
                        {s.name}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        s.status === 'Aktif'
                          ? 'bg-[#6cf8bb]/20 text-[#00714d] border-[#6cf8bb]/30'
                          : 'bg-[#ffdad6]/40 text-[#ba1a1a] border-[#ffdad6]'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-[13px] text-[#444653] mt-4 border-t border-[#c4c5d5]/20 pt-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-[#757684] shrink-0">
                        person
                      </span>
                      <span className="font-medium text-[#1a1b22] truncate">{s.contactPerson}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-[#25D366] shrink-0">
                        chat
                      </span>
                      <span className="font-mono text-[12px]">{s.phone}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-[#00288e] shrink-0">
                        mail
                      </span>
                      <span className="truncate text-[12px]">{s.email}</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[18px] text-[#757684] mt-0.5 shrink-0">
                        location_on
                      </span>
                      <span className="text-[12px] text-[#757684] line-clamp-2">{s.address}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#c4c5d5]/20 space-y-3">
                  <div className="flex justify-between items-center text-[12px]">
                    <div>
                      <span className="text-[#757684]">Katalog:</span>
                      <span className="font-bold text-[#1a1b22] ml-1">{s.productCount} Produk</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-[#00288e]">
                      <span>Pangsa: {s.distributionPercentage}%</span>
                    </div>
                  </div>

                  {/* Restock Message Button */}
                  {onOpenCriticalMessageModal && (
                    <button
                      onClick={() => onOpenCriticalMessageModal(s.name)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#25D366]/10 text-[#00714d] hover:bg-[#25D366] hover:text-white text-[12px] font-bold transition-all cursor-pointer border border-[#25D366]/30"
                    >
                      <span className="material-symbols-outlined text-[16px]">forward_to_inbox</span>
                      <span>Kirim Pesan / Order Restock</span>
                    </button>
                  )}

                  {/* Actions: Edit, Toggle Status & Delete */}
                  {isDeleting ? (
                    <div className="p-2.5 bg-[#fff8f7] border border-[#ffdad6] rounded-xl flex items-center justify-between gap-2 animate-in fade-in">
                      <span className="text-[11px] font-medium text-[#ba1a1a]">Hapus vendor ini?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 text-[11px] font-semibold text-[#444653] hover:bg-gray-200 rounded cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => {
                            if (onDeleteSupplier) onDeleteSupplier(s.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#ba1a1a] hover:bg-[#93000a] rounded cursor-pointer"
                        >
                          Ya, Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      {onEditSupplier && (
                        <button
                          onClick={() => onEditSupplier(s)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#f0effa] hover:bg-[#00288e]/10 text-[#00288e] text-[12px] font-semibold transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          <span>Edit</span>
                        </button>
                      )}

                      {onToggleStatus && (
                        <button
                          onClick={() => onToggleStatus(s)}
                          title={s.status === 'Aktif' ? 'Non-aktifkan vendor' : 'Aktifkan vendor'}
                          className="p-1.5 rounded-lg border border-[#c4c5d5]/60 hover:bg-[#f4f2fc] text-[#444653] transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {s.status === 'Aktif' ? 'toggle_on' : 'toggle_off'}
                          </span>
                        </button>
                      )}

                      {onDeleteSupplier && (
                        <button
                          onClick={() => setDeleteConfirmId(s.id)}
                          title="Hapus Supplier"
                          className="p-1.5 rounded-lg border border-[#ffdad6] text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
