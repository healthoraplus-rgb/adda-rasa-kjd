import { Product, Supplier, Transaction } from '../types';

export const DEFAULT_SPREADSHEET_ID = '1hKkT_Tr_MYd2Puy9KCrxdDOvlDwShth5Un7G5P7MHMg';

export interface SpreadsheetInfo {
  id: string;
  title: string;
  url: string;
  sheets: string[];
}

export interface SyncResult {
  success: boolean;
  message: string;
  productsCount?: number;
  suppliersCount?: number;
  transactionsCount?: number;
  timestamp: string;
}

const PRODUCT_HEADERS = [
  'ID',
  'Kode Produk',
  'Nama Produk',
  'Kategori',
  'Satuan',
  'Supplier',
  'Harga Satuan (Rp)',
  'Stok Awal',
  'Stok Saat Ini',
  'Batas Min Stok',
  'Status',
  'Status Kesehatan',
  'Terakhir Diperbarui',
];

const SUPPLIER_HEADERS = [
  'ID',
  'Kode Supplier',
  'Nama Perusahaan',
  'Kontak Person',
  'No Telepon',
  'Email',
  'Alamat',
  'Status',
];

const TRANSACTION_HEADERS = [
  'ID',
  'Kode Transaksi',
  'Tipe Mutasi',
  'Waktu Transaksi',
  'Kode Produk',
  'Nama Produk',
  'Kategori',
  'Jumlah',
  'Satuan',
  'Asal / Tujuan',
  'Catatan',
  'Petugas',
];

/**
 * Checks if spreadsheet exists and gets its metadata
 */
export async function getSpreadsheetDetails(
  token: string,
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<SpreadsheetInfo> {
  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gagal mengakses Google Spreadsheet (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const sheets = (data.sheets || []).map((s: any) => s.properties?.title as string);

  return {
    id: spreadsheetId,
    title: data.properties?.title || 'Spreadsheet Tanpa Judul',
    url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    sheets,
  };
}

/**
 * Ensures that Produk, Supplier, and Transaksi sheets and headers exist
 */
export async function ensureSpreadsheetStructure(
  token: string,
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<void> {
  const details = await getSpreadsheetDetails(token, spreadsheetId);
  const existingSheets = details.sheets;

  const requiredSheets = ['Produk', 'Supplier', 'Transaksi'];
  const missingSheets = requiredSheets.filter((s) => !existingSheets.includes(s));

  if (missingSheets.length > 0) {
    const requests = missingSheets.map((title) => ({
      addSheet: {
        properties: {
          title,
          gridProperties: {
            frozenRowCount: 1,
          },
        },
      },
    }));

    const updateRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requests }),
      }
    );

    if (!updateRes.ok) {
      console.warn('Batch update sheets warning:', await updateRes.text());
    }
  }

  // Check and write headers for each sheet
  const headerUpdates = [
    { range: 'Produk!A1:M1', values: [PRODUCT_HEADERS] },
    { range: 'Supplier!A1:H1', values: [SUPPLIER_HEADERS] },
    { range: 'Transaksi!A1:L1', values: [TRANSACTION_HEADERS] },
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: headerUpdates,
      }),
    }
  );
}

/**
 * Convert products to sheet rows
 */
function productToRow(p: Product): (string | number)[] {
  return [
    p.id || '',
    p.code || '',
    p.name || '',
    p.category || '',
    p.unit || '',
    p.supplier || '',
    p.price || 0,
    p.initialStock || 0,
    p.currentStock ?? p.initialStock ?? 0,
    p.minStock || 0,
    p.status || 'Aktif',
    p.healthStatus || 'Aman',
    p.lastUpdated || new Date().toISOString().split('T')[0],
  ];
}

/**
 * Convert suppliers to sheet rows
 */
function supplierToRow(s: Supplier): (string | number)[] {
  return [
    s.id || '',
    s.code || '',
    s.name || '',
    s.contactPerson || '',
    s.phone || '',
    s.email || '',
    s.address || '',
    s.status || 'Aktif',
  ];
}

/**
 * Convert transactions to sheet rows
 */
function transactionToRow(t: Transaction): (string | number)[] {
  return [
    t.id || '',
    t.code || '',
    t.type || 'IN',
    t.date || '',
    t.productCode || '',
    t.productName || '',
    t.category || '',
    t.quantity || 0,
    t.unit || '',
    t.sourceDestination || '',
    t.notes || '',
    t.createdBy || '',
  ];
}

/**
 * Row to Product converter
 */
function rowToProduct(row: any[]): Product {
  const price = Number(row[6]) || 0;
  const initialStock = Number(row[7]) || 0;
  const currentStock = row[8] !== undefined && row[8] !== '' ? Number(row[8]) : initialStock;
  const minStock = Number(row[9]) || 0;

  return {
    id: String(row[0] || `prd-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`),
    code: String(row[1] || ''),
    name: String(row[2] || ''),
    category: String(row[3] || 'Umum'),
    unit: String(row[4] || 'Pcs'),
    supplier: String(row[5] || ''),
    price,
    initialStock,
    currentStock,
    minStock,
    status: (row[10] === 'Tidak Aktif' ? 'Tidak Aktif' : 'Aktif'),
    healthStatus: (row[11] as any) || (currentStock <= 0 ? 'Habis' : currentStock <= minStock ? 'Menipis' : 'Aman'),
    lastUpdated: String(row[12] || new Date().toISOString().split('T')[0]),
  };
}

/**
 * Row to Supplier converter
 */
function rowToSupplier(row: any[]): Supplier {
  return {
    id: String(row[0] || `sup-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`),
    code: String(row[1] || ''),
    name: String(row[2] || ''),
    contactPerson: String(row[3] || ''),
    phone: String(row[4] || ''),
    email: String(row[5] || ''),
    address: String(row[6] || ''),
    productCount: 0,
    distributionPercentage: 0,
    status: (row[7] === 'Tidak Aktif' ? 'Tidak Aktif' : 'Aktif'),
  };
}

/**
 * Row to Transaction converter
 */
function rowToTransaction(row: any[]): Transaction {
  return {
    id: String(row[0] || `trx-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`),
    code: String(row[1] || ''),
    type: row[2] === 'OUT' ? 'OUT' : 'IN',
    date: String(row[3] || new Date().toLocaleString('id-ID')),
    productCode: String(row[4] || ''),
    productName: String(row[5] || ''),
    category: String(row[6] || ''),
    quantity: Number(row[7]) || 0,
    unit: String(row[8] || 'Pcs'),
    sourceDestination: String(row[9] || ''),
    notes: String(row[10] || ''),
    createdBy: String(row[11] || 'Sistem'),
  };
}

/**
 * Fetch all data from the spreadsheet into the application
 */
export async function fetchAllFromSpreadsheet(
  token: string,
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<{ products: Product[]; suppliers: Supplier[]; transactions: Transaction[] }> {
  await ensureSpreadsheetStructure(token, spreadsheetId);

  const ranges = ['Produk!A2:M', 'Supplier!A2:H', 'Transaksi!A2:L'];
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${ranges.join('&ranges=')}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Gagal mengambil data spreadsheet (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  const valueRanges = data.valueRanges || [];

  const productRows = valueRanges[0]?.values || [];
  const supplierRows = valueRanges[1]?.values || [];
  const transactionRows = valueRanges[2]?.values || [];

  const products = productRows
    .filter((r: any[]) => r && r.length > 1 && (r[1] || r[2]))
    .map(rowToProduct);

  const suppliers = supplierRows
    .filter((r: any[]) => r && r.length > 1 && (r[1] || r[2]))
    .map(rowToSupplier);

  const transactions = transactionRows
    .filter((r: any[]) => r && r.length > 1 && (r[1] || r[4]))
    .map(rowToTransaction);

  return { products, suppliers, transactions };
}

/**
 * Sync entire products list to Google Sheets
 */
export async function syncProductsToSheet(
  token: string,
  products: Product[],
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<void> {
  await ensureSpreadsheetStructure(token, spreadsheetId);

  // Clear existing product data (A2:M)
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Produk!A2:M:clear`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (products.length > 0) {
    const rows = products.map(productToRow);
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Produk!A2?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: rows }),
      }
    );
  }
}

/**
 * Sync entire suppliers list to Google Sheets
 */
export async function syncSuppliersToSheet(
  token: string,
  suppliers: Supplier[],
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<void> {
  await ensureSpreadsheetStructure(token, spreadsheetId);

  // Clear existing supplier data (A2:H)
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Supplier!A2:H:clear`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (suppliers.length > 0) {
    const rows = suppliers.map(supplierToRow);
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Supplier!A2?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: rows }),
      }
    );
  }
}

/**
 * Sync entire transactions list to Google Sheets
 */
export async function syncTransactionsToSheet(
  token: string,
  transactions: Transaction[],
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<void> {
  await ensureSpreadsheetStructure(token, spreadsheetId);

  // Clear existing transaction data (A2:L)
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Transaksi!A2:L:clear`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (transactions.length > 0) {
    const rows = transactions.map(transactionToRow);
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Transaksi!A2?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: rows }),
      }
    );
  }
}

/**
 * Real-time append a new single product to Google Sheets
 */
export async function appendProductToSheet(
  token: string,
  product: Product,
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<void> {
  await ensureSpreadsheetStructure(token, spreadsheetId);
  const row = productToRow(product);

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Produk!A:M:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [row] }),
    }
  );
}

/**
 * Real-time append a new single supplier to Google Sheets
 */
export async function appendSupplierToSheet(
  token: string,
  supplier: Supplier,
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<void> {
  await ensureSpreadsheetStructure(token, spreadsheetId);
  const row = supplierToRow(supplier);

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Supplier!A:H:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [row] }),
    }
  );
}

/**
 * Real-time append a new single transaction to Google Sheets
 */
export async function appendTransactionToSheet(
  token: string,
  transaction: Transaction,
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<void> {
  await ensureSpreadsheetStructure(token, spreadsheetId);
  const row = transactionToRow(transaction);

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Transaksi!A:L:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [row] }),
    }
  );
}

/**
 * Full bidirectional sync
 */
export async function syncAllToSpreadsheet(
  token: string,
  products: Product[],
  suppliers: Supplier[],
  transactions: Transaction[],
  spreadsheetId: string = DEFAULT_SPREADSHEET_ID
): Promise<SyncResult> {
  await ensureSpreadsheetStructure(token, spreadsheetId);

  await Promise.all([
    syncProductsToSheet(token, products, spreadsheetId),
    syncSuppliersToSheet(token, suppliers, spreadsheetId),
    syncTransactionsToSheet(token, transactions, spreadsheetId),
  ]);

  return {
    success: true,
    message: 'Semua data inventaris berhasil disinkronkan ke Google Spreadsheet!',
    productsCount: products.length,
    suppliersCount: suppliers.length,
    transactionsCount: transactions.length,
    timestamp: new Date().toLocaleTimeString('id-ID'),
  };
}
