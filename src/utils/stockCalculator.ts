import { Product, Transaction, StockHealthStatus } from '../types';

export interface ProductStockSummary {
  productId: string;
  code: string;
  name: string;
  initialStock: number;
  totalIn: number;
  totalOut: number;
  currentStock: number;
  minStock: number;
  health: StockHealthStatus;
}

/**
 * Calculates the accurate real physical stock for a single product.
 * Formula:
 * - If product has transaction history: currentStock = Math.max(0, initialStock + sum(IN) - sum(OUT))
 * - If no transactions exist: currentStock = p.currentStock !== undefined ? p.currentStock : (p.initialStock || 0)
 */
export function getProductStockSummary(
  product: Product,
  transactions: Transaction[] = []
): ProductStockSummary {
  const initialStock = Number(product.initialStock) || 0;
  const minStock = Number(product.minStock) || 0;

  // Match transactions by productId, productCode, or productName
  const prodCode = (product.code || '').trim().toLowerCase();
  const prodName = (product.name || '').trim().toLowerCase();
  const prodId = product.id;

  let totalIn = 0;
  let totalOut = 0;
  let hasTransactions = false;

  if (Array.isArray(transactions) && transactions.length > 0) {
    for (const t of transactions) {
      const matchId = t.productId && t.productId === prodId;
      const matchCode = prodCode && t.productCode && t.productCode.trim().toLowerCase() === prodCode;
      const matchName = prodName && t.productName && t.productName.trim().toLowerCase() === prodName;

      if (matchId || matchCode || matchName) {
        hasTransactions = true;
        const qty = Number(t.quantity) || 0;
        if (t.type === 'IN') {
          totalIn += qty;
        } else if (t.type === 'OUT') {
          totalOut += qty;
        }
      }
    }
  }

  let currentStock: number;
  if (hasTransactions) {
    currentStock = Math.max(0, initialStock + totalIn - totalOut);
  } else if (typeof product.currentStock === 'number' && !isNaN(product.currentStock)) {
    currentStock = product.currentStock;
  } else {
    currentStock = initialStock;
  }

  let health: StockHealthStatus = 'Aman';
  if (currentStock <= 0) {
    health = 'Habis';
  } else if (currentStock <= minStock) {
    health = 'Menipis';
  }

  return {
    productId: product.id,
    code: product.code,
    name: product.name,
    initialStock,
    totalIn,
    totalOut,
    currentStock,
    minStock,
    health,
  };
}

/**
 * Gets just the current real physical stock number
 */
export function getRealStock(product: Product, transactions: Transaction[] = []): number {
  return getProductStockSummary(product, transactions).currentStock;
}

/**
 * Gets health status of the product based on real physical stock
 */
export function getProductStockHealth(
  product: Product,
  transactions: Transaction[] = []
): StockHealthStatus {
  return getProductStockSummary(product, transactions).health;
}

/**
 * Calculates global inventory metrics across all products and transactions
 */
export function calculateInventoryMetrics(
  products: Product[],
  transactions: Transaction[] = []
) {
  let totalStock = 0;
  let totalHealthy = 0;
  let totalLow = 0;
  let totalOut = 0;
  const criticalProducts: Product[] = [];

  const summaries = (products || []).map((p) => {
    const summary = getProductStockSummary(p, transactions);
    totalStock += summary.currentStock;

    if (summary.health === 'Habis') {
      totalOut++;
      criticalProducts.push(p);
    } else if (summary.health === 'Menipis') {
      totalLow++;
      criticalProducts.push(p);
    } else {
      totalHealthy++;
    }

    return summary;
  });

  const totalIn = (transactions || [])
    .filter((t) => t.type === 'IN')
    .reduce((acc, t) => acc + (Number(t.quantity) || 0), 0);

  const totalOutUnits = (transactions || [])
    .filter((t) => t.type === 'OUT')
    .reduce((acc, t) => acc + (Number(t.quantity) || 0), 0);

  return {
    totalProducts: products.length,
    totalStock,
    totalHealthy,
    totalLow,
    totalOut,
    criticalProducts,
    totalIn,
    totalOutUnits,
    summaries,
  };
}
