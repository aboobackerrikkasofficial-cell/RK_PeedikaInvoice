// ============================================
// SINGLE SOURCE OF TRUTH FOR ALL CALCULATIONS
// Every displayed amount must use these values.
// ============================================

/**
 * Calculate all invoice amounts.
 * @param {object} product - Product from config
 * @param {"COD"|"GPay"} paymentMode - Payment mode
 * @param {number} quantity - Quantity ordered
 * @param {number} discount - Discount amount in ₹
 * @returns {object} { unitPrice, subtotal, discount, grandTotal }
 */
export function calculateInvoice(product, paymentMode, quantity, discount) {
  const unitPrice =
    paymentMode === "COD" ? product.codPrice : product.prepaidPrice;
  const subtotal = unitPrice * quantity;
  const appliedDiscount = Math.min(discount, subtotal); // never negative total
  const grandTotal = subtotal - appliedDiscount;

  return {
    unitPrice,
    subtotal,
    discount: appliedDiscount,
    grandTotal,
  };
}

/**
 * Format a number as Indian Rupee string.
 * @param {number} amount
 * @returns {string} e.g. "₹1,430"
 */
export function formatCurrency(amount) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Format a date as "25 Oct 2026".
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const d = date.getDate().toString().padStart(2, "0");
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}

/**
 * Calculate the estimated delivery date.
 * @param {Date} orderDate
 * @param {number} daysToAdd
 * @returns {Date}
 */
export function getEstimatedDelivery(orderDate, daysToAdd) {
  const delivery = new Date(orderDate);
  delivery.setDate(delivery.getDate() + daysToAdd);
  return delivery;
}

/**
 * Generate an invoice number: RKP-YYYYMMDD-XXX
 * Uses localStorage to track the daily counter.
 * @param {string} prefix - e.g. "RKP"
 * @param {Date} date
 * @returns {string}
 */
export function generateInvoiceNumber(prefix, date) {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const dateStr = `${y}${m}${d}`;

  const storageKey = `invoice_counter_${dateStr}`;
  let counter = 1;

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      counter = parseInt(stored, 10) + 1;
    }
    localStorage.setItem(storageKey, counter.toString());
  } catch {
    // localStorage unavailable – fallback
  }

  const seq = counter.toString().padStart(3, "0");
  return `${prefix}-${dateStr}-${seq}`;
}

/**
 * Generate the PNG filename.
 * @param {string} invoiceNumber
 * @param {string} customerName
 * @returns {string}
 */
export function getFilename(invoiceNumber, customerName) {
  const sanitized = customerName
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-]/g, "");
  return `${invoiceNumber}-${sanitized || "Invoice"}.png`;
}
