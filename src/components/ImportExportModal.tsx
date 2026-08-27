import React, { useState, useRef } from 'react';
import { Product } from '../types';
import {
  parseExcelOrCsvFile,
  downloadProductExcelTemplate,
  ParseResult,
} from '../utils/excelParser';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProducts: (newProducts: Omit<Product, 'id'>[]) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onImportProducts,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [previewItems, setPreviewItems] = useState<Omit<Product, 'id'>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setFileName(file.name);
    setFileSize(
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`
    );
    setIsProcessing(true);
    setErrorMessage(null);
    setParseResult(null);
    setPreviewItems([]);

    try {
      const result = await parseExcelOrCsvFile(file);
      setParseResult(result);
      setPreviewItems(result.products);
    } catch (err: any) {
      console.error('Gagal membaca file Excel:', err);
      setErrorMessage(
        err?.message ||
          'Gagal membaca file Excel/CSV. Pastikan format file tidak rusak dan berisi kolom Nama Produk.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleResetFile = () => {
    setFileName(null);
    setFileSize(null);
    setParseResult(null);
    setPreviewItems([]);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    if (previewItems.length > 0) {
      onImportProducts(previewItems);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-[24px] max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-[#c4c5d5]/40 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-4 border-b border-[#c4c5d5]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00288e]/10 text-[#00288e] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">upload_file</span>
            </div>
            <div>
              <h3 className="text-[20px] font-bold text-[#1a1b22]">Import Master Data Produk</h3>
              <p className="text-[12px] text-[#444653]">
                Unggah file Excel (.xlsx / .xls) atau CSV katalog inventaris Anda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#757684] hover:bg-[#e8e7f1] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="mt-4 space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Drag and Drop Zone */}
          {!previewItems.length && !isProcessing && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-[#00288e] bg-[#1e40af]/10 scale-[1.01]'
                  : 'border-[#c4c5d5] bg-[#fbf8ff] hover:bg-[#f4f2fc]'
              }`}
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-[#00288e]/10 text-[#00288e] flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
              </div>
              <h4 className="font-bold text-[16px] text-[#1a1b22]">
                Tarik & Lepaskan file Excel (.xlsx / .csv) di sini
              </h4>
              <p className="text-[13px] text-[#757684] mt-1">
                Sistem membaca kolom secara otomatis (Kode Produk, Nama Produk, Kategori, Satuan, Supplier, Harga, Stok Awal, Status)
              </p>

              <label className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#00288e] text-white rounded-xl text-[13px] font-bold hover:bg-[#1e40af] cursor-pointer shadow-xs transition-all">
                <span className="material-symbols-outlined text-[18px]">folder_open</span>
                <span>Pilih File dari Komputer</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Download Template Guide */}
          <div className="p-3.5 bg-[#f4f2fc] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[13px] border border-[#c4c5d5]/40">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[#00288e] text-[22px]">
                table_chart
              </span>
              <div>
                <span className="font-semibold text-[#1a1b22] block">Format Template Excel</span>
                <span className="text-[#757684] text-[12px]">
                  Struktur: Kode Produk, Nama Produk, Kategori, Satuan, Supplier, Harga, Stok Awal, Status.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={downloadProductExcelTemplate}
                className="px-3.5 py-1.5 bg-white border border-[#00288e]/30 text-[#00288e] rounded-xl font-bold hover:bg-[#eeedf7] transition-all flex items-center gap-1.5 cursor-pointer text-[12px] shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Unduh Template (.xlsx)</span>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-4 bg-[#ffdad6]/60 border border-[#ba1a1a]/30 rounded-2xl flex items-start gap-3 text-[13px] text-[#93000a]">
              <span className="material-symbols-outlined text-[22px] shrink-0 text-[#ba1a1a]">
                error
              </span>
              <div className="flex-1">
                <span className="font-bold block">Gagal Membaca File</span>
                <p className="mt-0.5">{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleResetFile}
                  className="mt-2 text-[12px] font-bold text-[#ba1a1a] underline hover:no-underline"
                >
                  Coba file lain
                </button>
              </div>
            </div>
          )}

          {/* Loading Processing State */}
          {isProcessing && (
            <div className="py-12 text-center text-[#00288e]">
              <span className="material-symbols-outlined animate-spin text-[40px]">sync</span>
              <p className="text-[14px] mt-3 font-bold text-[#1a1b22]">
                Membaca dan memvalidasi file Excel...
              </p>
              <p className="text-[12px] text-[#757684]">
                Mendeteksi kolom, mencocokkan kode barang, dan membersihkan data angka.
              </p>
            </div>
          )}

          {/* Parsed Result Preview */}
          {previewItems.length > 0 && !isProcessing && (
            <div className="space-y-3">
              {/* File Info Bar */}
              <div className="p-3.5 bg-[#f4f2fc] rounded-2xl border border-[#c4c5d5]/40 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#34A853]/10 text-[#34A853] flex items-center justify-center border border-[#34A853]/20">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[13px] text-[#1a1b22]">{fileName}</span>
                      {fileSize && (
                        <span className="text-[11px] font-mono text-[#757684]">({fileSize})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-[#444653] mt-0.5">
                      <span>Sheet: <strong className="text-[#00288e]">{parseResult?.sheetName}</strong></span>
                      <span>•</span>
                      <span>{previewItems.length} produk siap diimpor</span>
                      {parseResult && parseResult.skippedRows > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-[#757684]">({parseResult.skippedRows} baris kosong diabaikan)</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetFile}
                  className="text-[12px] font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 px-3 py-1.5 rounded-xl border border-[#ba1a1a]/30 transition-colors cursor-pointer"
                >
                  Ganti File
                </button>
              </div>

              {/* Table Preview */}
              <div>
                <div className="text-[13px] font-bold text-[#1a1b22] mb-1.5 flex items-center justify-between">
                  <span>Tampilan Data Yang Akan Diimpor ({previewItems.length} baris):</span>
                  <span className="text-[#00714d] text-[12px] font-bold bg-[#6cf8bb]/20 px-2.5 py-0.5 rounded-full border border-[#6cf8bb]/40">
                    Format Valid
                  </span>
                </div>

                <div className="border border-[#c4c5d5]/40 rounded-2xl overflow-hidden max-h-64 overflow-y-auto ambient-shadow">
                  <table className="min-w-full divide-y divide-[#c4c5d5]/30 text-[12px]">
                    <thead className="bg-[#eeedf7] sticky top-0 z-10">
                      <tr>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#444653]">No</th>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#444653]">Kode Produk</th>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#444653]">Nama Produk</th>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#444653]">Kategori</th>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#444653]">Satuan</th>
                        <th className="px-3.5 py-2.5 text-left font-bold text-[#444653]">Supplier</th>
                        <th className="px-3.5 py-2.5 text-right font-bold text-[#444653]">Harga</th>
                        <th className="px-3.5 py-2.5 text-right font-bold text-[#444653]">Stok Awal</th>
                        <th className="px-3.5 py-2.5 text-center font-bold text-[#444653]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c4c5d5]/20 bg-white">
                      {previewItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#f4f2fc]/50 transition-colors">
                          <td className="px-3.5 py-2 text-[#757684] font-mono text-[11px]">{idx + 1}</td>
                          <td className="px-3.5 py-2 font-mono font-bold text-[#00288e] whitespace-nowrap">
                            {item.code}
                          </td>
                          <td className="px-3.5 py-2 font-bold text-[#1a1b22] min-w-[180px]">
                            {item.name}
                          </td>
                          <td className="px-3.5 py-2 text-[#444653] whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-md bg-[#f4f2fc] text-[11px] font-medium border border-[#c4c5d5]/40">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-3.5 py-2 text-[#444653] whitespace-nowrap">{item.unit}</td>
                          <td className="px-3.5 py-2 text-[#444653] whitespace-nowrap">{item.supplier}</td>
                          <td className="px-3.5 py-2 text-right font-mono text-[#1a1b22] whitespace-nowrap font-medium">
                            Rp {item.price.toLocaleString('id-ID')}
                          </td>
                          <td className="px-3.5 py-2 text-right font-mono font-bold text-[#1a1b22] whitespace-nowrap">
                            {item.initialStock ?? item.currentStock ?? 0}
                          </td>
                          <td className="px-3.5 py-2 text-center whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.status === 'Aktif'
                                  ? 'bg-[#6cf8bb]/30 text-[#00714d]'
                                  : 'bg-[#ffdad6] text-[#93000a]'
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#c4c5d5]/30 shrink-0 mt-2">
          <div className="text-[12px] text-[#757684]">
            {previewItems.length > 0 && (
              <span>Total <strong>{previewItems.length}</strong> produk akan ditambahkan ke katalog master.</span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#c4c5d5] rounded-xl text-[13px] font-bold text-[#444653] hover:bg-[#f4f2fc] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={previewItems.length === 0}
              className="px-5 py-2 bg-[#00288e] text-white rounded-xl text-[13px] font-bold hover:bg-[#1e40af] transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">file_download_done</span>
              <span>Impor ({previewItems.length}) Produk Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

