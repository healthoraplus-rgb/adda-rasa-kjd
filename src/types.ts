export type NavigationTab = 
  | 'dashboard' 
  | 'produk' 
  | 'stok' 
  | 'transaksi' 
  | 'supplier' 
  | 'laporan' 
  | 'setting'
  | 'pengaturan';

export interface User {
  id?: string;
  username: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  initials: string;
  password?: string;
  status?: 'Aktif' | 'Nonaktif';
  createdAt?: string;
  lastLogin?: string;
  phone?: string;
}

export type ProductStatus = 'Aktif' | 'Tidak Aktif';
export type StockHealthStatus = 'Aman' | 'Menipis' | 'Habis';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  supplier: string;
  price: number;
  initialStock: number;
  currentStock: number;
  minStock: number;
  status: ProductStatus;
  healthStatus?: StockHealthStatus;
  lastUpdated?: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  productCount: number;
  distributionPercentage: number;
  color?: string;
  status: 'Aktif' | 'Tidak Aktif';
}

export interface Transaction {
  id: string;
  code: string;
  type: 'IN' | 'OUT'; // Barang Masuk vs Barang Keluar
  date: string;
  productId?: string;
  productCode: string;
  productName: string;
  category?: string;
  quantity: number;
  unit: string;
  sourceDestination: string; // Supplier for IN, Customer/Dept for OUT
  notes?: string;
  createdBy: string;
}

export interface ReportFilter {
  startDate: string;
  endDate: string;
  month: string;
  supplier: string;
  category?: string;
  status?: string;
}

export interface CategoryMetric {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface GoogleSheetsSyncState {
  isConnected: boolean;
  isSyncing: boolean;
  spreadsheetId: string;
  spreadsheetTitle?: string;
  spreadsheetUrl?: string;
  lastSyncedAt?: string;
  error?: string | null;
  autoSync: boolean;
  googleUserEmail?: string;
}
