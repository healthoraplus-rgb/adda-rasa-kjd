import * as XLSX from 'xlsx';
import { Product } from '../types';

export interface ParseResult {
  products: Omit<Product, 'id'>[];
  totalRows: number;
  validRows: number;
  skippedRows: number;
  sheetName: string;
  errors: string[];
  headersFound: string[];
}

/**
 * Normalizes header string to find matching fields
 */
function normalizeHeader(h: string): string {
  return String(h || '')
    .toLowerCase()
    .trim()
    .replace(/[_\-\s]+/g, ' ');
}

/**
 * Clean currency and numbers (handles "Rp 25.000", "25,000.50", "25.000,00", etc.)
 */
function parseNumberValue(val: any, fallback = 0): number {
  if (val === null || val === undefined || val === '') return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;

  let str = String(val).trim().replace(/^(rp|idr|\$)\s*/i, '');
  // Remove spaces
  str = str.replace(/\s+/g, '');

  // If format is Indonesian like "25.000,00" or "25.000"
  if (/\.\d{3},\d+$/.test(str)) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (/\.\d{3}$/.test(str)) {
    str = str.replace(/\./g, '');
  } else if (/,\d{3}$/.test(str)) {
    str = str.replace(/,/g, '');
  } else if (/,\d+$/.test(str) && !/\./.test(str)) {
    str = str.replace(',', '.');
  } else {
    str = str.replace(/,/g, '');
  }

  const num = parseFloat(str);
  return isNaN(num) ? fallback : num;
}

/**
 * Parses an Excel (.xlsx, .xls) or CSV file into Product objects
 */
export async function parseExcelOrCsvFile(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('File Excel tidak memiliki lembar kerja (worksheet).');
  }

  // Look for a sheet named 'Produk', 'Master Produk', 'Products', or default to first sheet
  let targetSheetName = workbook.SheetNames[0];
  const preferredSheet = workbook.SheetNames.find((name) =>
    /^(produk|product|master|barang|katalog)/i.test(name.trim())
  );
  if (preferredSheet) {
    targetSheetName = preferredSheet;
  }

  const worksheet = workbook.Sheets[targetSheetName];
  // Convert sheet to raw 2D array of rows
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    raw: false,
    blankrows: false,
  });

  if (!rawRows || rawRows.length === 0) {
    throw new Error('Lembar kerja Excel kosong atau tidak memiliki data.');
  }

  // Find header row index by scanning first 15 rows for keywords
  let headerRowIndex = -1;
  let headerMap: { [key: string]: number } = {};
  const errors: string[] = [];

  for (let r = 0; r < Math.min(rawRows.length, 15); r++) {
    const row = rawRows[r];
    if (!Array.isArray(row)) continue;

    let matchCount = 0;
    const currentMap: { [key: string]: number } = {};

    row.forEach((cell, colIdx) => {
      const normalized = normalizeHeader(cell);
      if (!normalized) return;

      // Identify SKU / Code
      if (
        /^(kode|code|sku|barcode|id produk|kd produk|kd barang|kode barang|kd)/.test(normalized) &&
        currentMap.code === undefined
      ) {
        currentMap.code = colIdx;
        matchCount++;
      }
      // Identify Product Name
      else if (
        /^(nama|name|nama produk|nama barang|item|item name|product name|deskripsi)/.test(
          normalized
        ) &&
        currentMap.name === undefined
      ) {
        currentMap.name = colIdx;
        matchCount++;
      }
      // Identify Category
      else if (
        /^(kategori|category|golongan|jenis|kelompok)/.test(normalized) &&
        currentMap.category === undefined
      ) {
        currentMap.category = colIdx;
        matchCount++;
      }
      // Identify Unit / Satuan
      else if (
        /^(satuan|unit|kemasan|uom)/.test(normalized) &&
        currentMap.unit === undefined
      ) {
        currentMap.unit = colIdx;
        matchCount++;
      }
      // Identify Supplier
      else if (
        /^(supplier|pemasok|vendor|rekanan|distributor)/.test(normalized) &&
        currentMap.supplier === undefined
      ) {
        currentMap.supplier = colIdx;
        matchCount++;
      }
      // Identify Price
      else if (
        /^(harga|price|harga satuan|harga jual|hpp|harga beli|tarif|price unit)/.test(
          normalized
        ) &&
        currentMap.price === undefined
      ) {
        currentMap.price = colIdx;
        matchCount++;
      }
      // Identify Stock / Initial Stock / Current Stock
      else if (
        /^(stok saat ini|current stock|stok akhir|sisa stok)/.test(normalized) &&
        currentMap.currentStock === undefined
      ) {
        currentMap.currentStock = colIdx;
        matchCount++;
      } else if (
        /^(stok awal|initial stock|stok|stock|jumlah|qty|kuantitas|saldo)/.test(
          normalized
        ) &&
        currentMap.initialStock === undefined
      ) {
        currentMap.initialStock = colIdx;
        matchCount++;
      }
      // Identify Minimum Stock
      else if (
        /^(batas min|min stok|minimum stok|min stock|minimum|safety stock|ambang)/.test(
          normalized
        ) &&
        currentMap.minStock === undefined
      ) {
        currentMap.minStock = colIdx;
        matchCount++;
      }
      // Identify Status
      else if (/^(status|kondisi)/.test(normalized) && currentMap.status === undefined) {
        currentMap.status = colIdx;
        matchCount++;
      }
    });

    // If at least 'name' or 'code' or at least 2 key columns match, this is our header row
    if (
      currentMap.name !== undefined ||
      currentMap.code !== undefined ||
      matchCount >= 2
    ) {
      headerRowIndex = r;
      headerMap = currentMap;
      break;
    }
  }

  // Fallback: If no recognized header found, assume row 0 is header and map positional columns
  if (headerRowIndex === -1) {
    headerRowIndex = 0;
    // Map standard column sequence: [Kode Produk, Nama Produk, Kategori, Satuan, Supplier, Harga, Stok Awal, Status]
    headerMap = {
      code: 0,
      name: 1,
      category: 2,
      unit: 3,
      supplier: 4,
      price: 5,
      initialStock: 6,
      status: 7,
    };
  }

  const rawHeaders = (rawRows[headerRowIndex] || []).map((h) => String(h || '').trim());
  const dataRows = rawRows.slice(headerRowIndex + 1);

  const products: Omit<Product, 'id'>[] = [];
  let skippedRows = 0;

  dataRows.forEach((row, idx) => {
    if (!row || row.every((c) => c === '' || c === null || c === undefined)) {
      skippedRows++;
      return;
    }

    const rowNum = headerRowIndex + 2 + idx;

    // Extract fields
    const getVal = (colIndex?: number) =>
      colIndex !== undefined && colIndex >= 0 && colIndex < row.length ? row[colIndex] : '';

    const rawName = String(getVal(headerMap.name) || '').trim();
    let rawCode = String(getVal(headerMap.code) || '').trim();

    // If both name and code are completely empty, skip row
    if (!rawName && !rawCode) {
      skippedRows++;
      return;
    }

    // Auto-generate code if missing
    if (!rawCode) {
      rawCode = `PRD-${String(products.length + 1).padStart(3, '0')}`;
    }

    const name = rawName || `Produk ${rawCode}`;
    const category = String(getVal(headerMap.category) || '').trim() || 'Bahan Baku';
    const unit = String(getVal(headerMap.unit) || '').trim() || 'Pcs';
    const supplier = String(getVal(headerMap.supplier) || '').trim() || 'Umum';

    const price = parseNumberValue(getVal(headerMap.price), 0);
    const initialStock = parseNumberValue(getVal(headerMap.initialStock), 0);
    const currentStock =
      headerMap.currentStock !== undefined
        ? parseNumberValue(getVal(headerMap.currentStock), initialStock)
        : initialStock;
    const minStock = parseNumberValue(getVal(headerMap.minStock), 10);

    const rawStatus = String(getVal(headerMap.status) || '').trim().toLowerCase();
    const status: 'Aktif' | 'Tidak Aktif' =
      rawStatus === 'tidak aktif' || rawStatus === 'nonaktif' || rawStatus === 'inactive'
        ? 'Tidak Aktif'
        : 'Aktif';

    // Calculate Health Status
    const healthStatus: 'Aman' | 'Menipis' | 'Habis' =
      currentStock <= 0 ? 'Habis' : currentStock <= minStock ? 'Menipis' : 'Aman';

    const todayStr = new Date().toISOString().split('T')[0];

    products.push({
      code: rawCode,
      name,
      category,
      unit,
      supplier,
      price,
      initialStock,
      currentStock,
      minStock,
      status,
      healthStatus,
      lastUpdated: todayStr,
    });
  });

  if (products.length === 0) {
    throw new Error(
      'Tidak ada data produk yang berhasil dibaca. Pastikan format kolom menyertakan Nama Produk dan Kode Produk.'
    );
  }

  return {
    products,
    totalRows: dataRows.length,
    validRows: products.length,
    skippedRows,
    sheetName: targetSheetName,
    errors,
    headersFound: rawHeaders.filter(Boolean),
  };
}

/**
 * Generates and downloads a clean Excel template file (.xlsx)
 * Structure requested: Kode Produk, Nama Produk, Kategori, Satuan, Supplier, Harga, Stok Awal, Status
 */
export function downloadProductExcelTemplate() {
  const headers = [
    'Kode Produk',
    'Nama Produk',
    'Kategori',
    'Satuan',
    'Supplier',
    'Harga',
    'Stok Awal',
    'Status',
  ];

  const sampleData = [
    [
      'PRD-001',
      'Sirup Rasa Leci 750ml',
      'Minuman',
      'Botol',
      'PT ABC Food',
      45000,
      120,
      'Aktif',
    ],
    [
      'PRD-002',
      'Bubuk Cokelat Premium 1kg',
      'Bahan Baku',
      'Pack',
      'CV Makmur Jaya',
      78000,
      50,
      'Aktif',
    ],
    [
      'PRD-003',
      'Gula Pasir Kristal Putih 1kg',
      'Bahan Pokok',
      'Kg',
      'PT Sumber Manis',
      17500,
      200,
      'Aktif',
    ],
    [
      'PRD-004',
      'Cup Plastik Sablon 16oz',
      'Packaging',
      'Slop',
      'UD Berkah Mandiri',
      32000,
      80,
      'Aktif',
    ],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 }, // Kode Produk
    { wch: 32 }, // Nama Produk
    { wch: 20 }, // Kategori
    { wch: 12 }, // Satuan
    { wch: 24 }, // Supplier
    { wch: 16 }, // Harga
    { wch: 14 }, // Stok Awal
    { wch: 14 }, // Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Produk');

  XLSX.writeFile(workbook, 'Template_Import_Master_Produk_ADDA_RASA.xlsx');
}

/**
 * Exports real Products list to an Excel (.xlsx) file
 */
export function exportProductsToXLSX(products: Product[]) {
  const headers = [
    'Kode Produk',
    'Nama Produk',
    'Kategori',
    'Satuan',
    'Supplier',
    'Harga',
    'Stok Awal',
    'Status',
  ];

  const rows = products.map((p) => [
    p.code,
    p.name,
    p.category,
    p.unit,
    p.supplier,
    p.price,
    p.initialStock ?? p.currentStock ?? 0,
    p.status,
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  worksheet['!cols'] = [
    { wch: 15 },
    { wch: 35 },
    { wch: 20 },
    { wch: 12 },
    { wch: 25 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Produk');

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Master_Produk_ADDA_RASA_${dateStr}.xlsx`);
}

export interface SalesExportItem {
  id: string;
  date: string;
  code: string;
  productId?: string;
  productCode: string;
  productName: string;
  category: string;
  supplier: string;
  unit: string;
  quantity: number;
  price: number;
  totalPrice: number;
  sourceDestination: string;
  notes?: string;
  createdBy: string;
}

export interface SalesExportOptions {
  month?: string;
  supplier?: string;
  product?: string;
  startDate?: string;
  endDate?: string;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
}

/**
 * Generates and downloads a highly professional Excel Sales Report
 * Complete with official company header, address, print date, filters, detailed table, and supplier summary.
 */
export function exportSalesReportToXLSX(
  items: SalesExportItem[],
  options: SalesExportOptions = {}
) {
  const companyName = options.companyName || 'ADDA RASA KJD';
  const companyAddress =
    options.companyAddress ||
    'Jl. Kayu Jati Dukuh No. 12, Rawamangun, Pulo Gadung, Jakarta Timur 13220';
  const companyPhone = options.companyPhone || '+62 812-3456-7890';
  const companyEmail = options.companyEmail || 'addarasakjd@gmail.com';
  
  const today = new Date();
  const printDateStr = today.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const printTimeStr = today.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const filterMonth = options.month || 'Semua Bulan';
  const filterSupplier = options.supplier || 'Semua Supplier';
  const filterProduct = options.product || 'Semua Produk';
  const filterPeriod =
    options.startDate && options.endDate
      ? `${options.startDate} s/d ${options.endDate}`
      : filterMonth;

  // Header and Metadata Rows
  const sheetData: any[][] = [
    [companyName.toUpperCase()],
    ['INVENTORY & SALES MANAGEMENT SYSTEM'],
    [`Alamat: ${companyAddress}`],
    [`Kontak: ${companyPhone} | Email: ${companyEmail}`],
    [],
    ['LAPORAN PENJUALAN & PENGELUARAN BARANG'],
    [
      `Periode: ${filterPeriod}`,
      '',
      `Filter Supplier: ${filterSupplier}`,
      '',
      `Filter Produk: ${filterProduct}`,
      '',
      `Tanggal Cetak: ${printDateStr} ${printTimeStr} WIB`,
    ],
    [],
    // Table Column Headers
    [
      'No',
      'Tanggal',
      'No Transaksi',
      'Kode Produk',
      'Nama Produk',
      'Kategori',
      'Supplier',
      'Satuan',
      'Qty Terjual',
      'Harga Satuan (Rp)',
      'Total Penjualan (Rp)',
      'Tujuan / Outlet / Customer',
      'Petugas',
      'Keterangan',
    ],
  ];

  let totalQty = 0;
  let totalAmount = 0;

  // Data rows
  items.forEach((item, index) => {
    totalQty += item.quantity;
    totalAmount += item.totalPrice;

    sheetData.push([
      index + 1,
      item.date,
      item.code,
      item.productCode,
      item.productName,
      item.category,
      item.supplier,
      item.unit,
      item.quantity,
      item.price,
      item.totalPrice,
      item.sourceDestination,
      item.createdBy,
      item.notes || '-',
    ]);
  });

  // Summary Row
  sheetData.push([]);
  sheetData.push([
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'TOTAL KESELURUHAN',
    totalQty,
    '',
    totalAmount,
    '',
    '',
    '',
  ]);
  sheetData.push([]);
  sheetData.push([
    '',
    'Dibuat Oleh,',
    '',
    '',
    '',
    '',
    '',
    '',
    'Disetujui Oleh,',
  ]);
  sheetData.push([]);
  sheetData.push([]);
  sheetData.push([
    '',
    '( Petugas Administrasi / Kasir )',
    '',
    '',
    '',
    '',
    '',
    '',
    '( Manager Operasional / Owner )',
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Set column widths for optimal reading
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 14 }, // Tanggal
    { wch: 18 }, // No Transaksi
    { wch: 15 }, // Kode Produk
    { wch: 32 }, // Nama Produk
    { wch: 18 }, // Kategori
    { wch: 24 }, // Supplier
    { wch: 10 }, // Satuan
    { wch: 14 }, // Qty Terjual
    { wch: 18 }, // Harga Satuan
    { wch: 22 }, // Total Penjualan
    { wch: 26 }, // Tujuan/Outlet
    { wch: 18 }, // Petugas
    { wch: 25 }, // Keterangan
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Penjualan');

  // Sheet 2: Rekapitulasi per Supplier
  const supplierSummaryMap: Record<
    string,
    { count: number; totalQty: number; totalAmount: number }
  > = {};

  items.forEach((it) => {
    const sName = it.supplier || 'Tanpa Supplier';
    if (!supplierSummaryMap[sName]) {
      supplierSummaryMap[sName] = { count: 0, totalQty: 0, totalAmount: 0 };
    }
    supplierSummaryMap[sName].count += 1;
    supplierSummaryMap[sName].totalQty += it.quantity;
    supplierSummaryMap[sName].totalAmount += it.totalPrice;
  });

  const supplierSheetData: any[][] = [
    [companyName.toUpperCase()],
    ['REKAPITULASI PENJUALAN PER SUPPLIER'],
    [`Periode: ${filterPeriod} | Tanggal Cetak: ${printDateStr}`],
    [],
    [
      'No',
      'Nama Supplier',
      'Jumlah Transaksi',
      'Total Unit Terjual',
      'Total Nilai Penjualan (Rp)',
      'Kontribusi Omset (%)',
    ],
  ];

  let sIdx = 1;
  Object.entries(supplierSummaryMap).forEach(([sName, data]) => {
    const percentage =
      totalAmount > 0 ? ((data.totalAmount / totalAmount) * 100).toFixed(1) + '%' : '0%';
    supplierSheetData.push([
      sIdx++,
      sName,
      data.count,
      data.totalQty,
      data.totalAmount,
      percentage,
    ]);
  });

  supplierSheetData.push([
    '',
    'TOTAL',
    items.length,
    totalQty,
    totalAmount,
    '100%',
  ]);

  const supplierWorksheet = XLSX.utils.aoa_to_sheet(supplierSheetData);
  supplierWorksheet['!cols'] = [
    { wch: 6 },
    { wch: 28 },
    { wch: 18 },
    { wch: 20 },
    { wch: 26 },
    { wch: 22 },
  ];

  XLSX.utils.book_append_sheet(workbook, supplierWorksheet, 'Rekap Supplier');

  const cleanMonthName = filterMonth.replace(/[^a-zA-Z0-9]/g, '_');
  const cleanSupplierName = filterSupplier.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Laporan_Penjualan_${companyName.replace(/\s+/g, '_')}_${cleanMonthName}_${cleanSupplierName}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
