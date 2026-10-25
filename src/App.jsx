import { useState, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import InvoiceTemplate from "./components/InvoiceTemplate";
import ResponsiveInvoicePreview from "./components/ResponsiveInvoicePreview";
import ProductManager from "./components/ProductManager";
import useProducts from "./hooks/useProducts";
import shopConfig from "./config/shop";
import {
  calculateInvoice,
  formatCurrency,
  formatDate,
  getEstimatedDelivery,
  generateInvoiceNumber,
  getFilename,
} from "./utils/calculations";

function getTodayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function App() {
  // --- Products from localStorage ---
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    exportProducts,
    importProducts,
  } = useProducts();

  // --- Customer form ---
  const [customer, setCustomer] = useState({
    name: "",
    houseName: "",
    place: "",
    landmark: "",
    pincode: "",
    mobile: "",
  });

  // --- Order ---
  const [paymentMode, setPaymentMode] = useState("COD");
  const [selectedProductId, setSelectedProductId] = useState(
    products[0]?.id || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [orderDateStr, setOrderDateStr] = useState(getTodayString());

  // --- Dedicated ref for unscaled high-resolution PNG export ---
  const exportRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  // --- Invoice number ---
  const [invoiceNumber, setInvoiceNumber] = useState(() =>
    generateInvoiceNumber(shopConfig.invoicePrefix, new Date())
  );

  // --- Derived values ---
  const selectedProduct =
    products.find((p) => p.id === selectedProductId) || products[0];

  const effectiveProductId = selectedProduct?.id || "";

  const orderDate = new Date(orderDateStr + "T00:00:00");
  const estimatedDelivery = getEstimatedDelivery(
    orderDate,
    shopConfig.deliveryDaysToAdd
  );

  const pricing = selectedProduct
    ? calculateInvoice(selectedProduct, paymentMode, quantity, discount)
    : { unitPrice: 0, subtotal: 0, discount: 0, grandTotal: 0 };

  // --- Handlers ---
  const handleCustomerChange = (field) => (e) => {
    setCustomer((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setQuantity(isNaN(val) || val < 1 ? 1 : val);
  };

  const handleDiscountChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setDiscount(isNaN(val) || val < 0 ? 0 : val);
  };

  const handleProductChange = (e) => {
    setSelectedProductId(e.target.value);
  };

  // --- Download High-Resolution A4 PNG ---
  // Export happens from the dedicated unscaled template at 1654 × 2339 px (200 DPI A4)
  // Completely independent of the mobile preview scale.
  const handleDownload = useCallback(async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      // Small pause to guarantee all browser paints & fonts are settled
      await new Promise((resolve) => setTimeout(resolve, 80));

      const targetWidth = 1654;
      const pixelRatio = targetWidth / 794; // ≈ 2.0831234 -> produces exact 1654 × 2339 px PNG

      const dataUrl = await toPng(exportRef.current, {
        width: 794,
        height: 1123,
        pixelRatio: pixelRatio,
        backgroundColor: "#ffffff",
        cacheBust: true,
        style: {
          transform: "none",
          margin: "0",
          position: "static",
        },
      });

      const link = document.createElement("a");
      link.download = getFilename(invoiceNumber, customer.name);
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("PNG export failed:", err);
      alert("PNG download failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }, [invoiceNumber, customer.name]);

  // --- Print ---
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // --- New Invoice ---
  const handleNewInvoice = () => {
    setCustomer({
      name: "",
      houseName: "",
      place: "",
      landmark: "",
      pincode: "",
      mobile: "",
    });
    setPaymentMode("COD");
    setSelectedProductId(products[0]?.id || "");
    setQuantity(1);
    setDiscount(0);
    setOrderDateStr(getTodayString());
    setInvoiceNumber(
      generateInvoiceNumber(shopConfig.invoicePrefix, new Date())
    );
  };

  const invoiceProduct = selectedProduct
    ? {
        name: selectedProduct.name,
        size: selectedProduct.size || "",
        material: selectedProduct.material || "",
        description: selectedProduct.description || "",
      }
    : {
        name: "No product selected",
        size: "",
        material: "",
        description: "",
      };

  const invoiceProps = {
    shop: shopConfig,
    customer,
    product: invoiceProduct,
    paymentMode,
    quantity,
    pricing,
    invoiceNumber,
    orderDate,
    deliveryPeriod: shopConfig.deliveryPeriod,
    estimatedDelivery,
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ===== FORM SECTION (hidden during print) ===== */}
      <div className="print:hidden max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1b3a5c]">
            RK PEEDIKA INVOICE GENERATOR
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Generate and download professional A4 invoices
          </p>
        </div>

        {/* ---- Product Manager ---- */}
        <ProductManager
          products={products}
          onAdd={addProduct}
          onUpdate={updateProduct}
          onDelete={deleteProduct}
          onExport={exportProducts}
          onImport={importProducts}
        />

        {/* ---- Customer Details ---- */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="text-lg font-bold text-[#1b3a5c] border-b pb-2">
            Customer Details
          </h2>
          <div className="space-y-3">
            <FormField
              label="Customer Name"
              value={customer.name}
              onChange={handleCustomerChange("name")}
              placeholder="Pramod S"
              required
            />
            <FormField
              label="House Name"
              value={customer.houseName}
              onChange={handleCustomerChange("houseName")}
              placeholder="Kichupillaseri House"
            />
            <FormField
              label="Place"
              value={customer.place}
              onChange={handleCustomerChange("place")}
              placeholder="Chennithala"
            />
            <FormField
              label="Landmark"
              value={customer.landmark}
              onChange={handleCustomerChange("landmark")}
              placeholder="Chennithala P.O., Mavelikkara"
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Pincode"
                value={customer.pincode}
                onChange={handleCustomerChange("pincode")}
                placeholder="690105"
                type="tel"
              />
              <FormField
                label="Mobile Number"
                value={customer.mobile}
                onChange={handleCustomerChange("mobile")}
                placeholder="9876543210"
                type="tel"
              />
            </div>
          </div>
        </div>

        {/* ---- Order Section ---- */}
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <h2 className="text-lg font-bold text-[#1b3a5c] border-b pb-2">
            Order
          </h2>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Payment Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMode("COD")}
                className={`py-3 rounded-lg text-sm font-bold border-2 transition-all cursor-pointer ${
                  paymentMode === "COD"
                    ? "border-orange-500 bg-orange-50 text-orange-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                💵 COD
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode("GPay")}
                className={`py-3 rounded-lg text-sm font-bold border-2 transition-all cursor-pointer ${
                  paymentMode === "GPay"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                📱 GPay / Prepaid
              </button>
            </div>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Product
            </label>
            {products.length === 0 ? (
              <p className="text-sm text-red-500 p-3 bg-red-50 rounded-lg">
                No products available. Add a product above first.
              </p>
            ) : (
              <select
                value={effectiveProductId}
                onChange={handleProductChange}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3a5c] bg-white cursor-pointer"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — COD {formatCurrency(p.codPrice)} / Prepaid{" "}
                    {formatCurrency(p.prepaidPrice)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected product info chip */}
          {selectedProduct && (
            <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 space-y-0.5 border border-gray-200">
              <div>
                <span className="font-semibold text-gray-700">Product:</span>{" "}
                {selectedProduct.name}
              </div>
              {selectedProduct.size && (
                <div>
                  <span className="font-semibold text-gray-700">Size:</span>{" "}
                  {selectedProduct.size}
                </div>
              )}
              {selectedProduct.material && (
                <div>
                  <span className="font-semibold text-gray-700">Material:</span>{" "}
                  {selectedProduct.material}
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-700">
                  Price ({paymentMode}):
                </span>{" "}
                <span className="text-[#1b3a5c] font-bold">
                  {formatCurrency(pricing.unitPrice)}
                </span>
              </div>
            </div>
          )}

          {/* Quantity & Discount */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Quantity"
              value={quantity}
              onChange={handleQuantityChange}
              type="number"
              min="1"
            />
            <FormField
              label="Additional Discount ₹"
              value={discount}
              onChange={handleDiscountChange}
              type="number"
              min="0"
            />
          </div>

          {/* Date */}
          <FormField
            label="Order Date"
            value={orderDateStr}
            onChange={(e) => setOrderDateStr(e.target.value)}
            type="date"
          />
        </div>

        {/* ---- Price Summary ---- */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-[#1b3a5c] border-b pb-2 mb-3">
            Total
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">
                Unit Price ({paymentMode})
              </span>
              <span className="font-semibold">
                {formatCurrency(pricing.unitPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity</span>
              <span className="font-semibold">× {quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">
                {formatCurrency(pricing.subtotal)}
              </span>
            </div>
            {pricing.discount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount</span>
                <span className="font-semibold">
                  −{formatCurrency(pricing.discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200 text-lg">
              <span className="font-bold text-[#1b3a5c]">Grand Total</span>
              <span className="font-bold text-[#1b3a5c]">
                {formatCurrency(pricing.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* ---- Invoice Preview Label ---- */}
        <div className="text-center pt-2">
          <h2 className="text-lg font-bold text-[#1b3a5c]">
            A4 Invoice Preview
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Complete A4 portrait preview. Fits screen automatically without scrolling.
          </p>
        </div>
      </div>

      {/* ===== RESPONSIVE INVOICE PREVIEW ===== */}
      {/* On desktop: 100% scale (794x1123). On mobile: scaled down to fit screen width exactly. */}
      <div className="max-w-4xl mx-auto px-2 pb-6 print:hidden">
        <ResponsiveInvoicePreview {...invoiceProps} />
      </div>

      {/* ===== ACTION BUTTONS (hidden during print) ===== */}
      <div className="print:hidden max-w-2xl mx-auto px-4 pb-12 space-y-3">
        <button
          onClick={handleDownload}
          disabled={exporting || !selectedProduct}
          className="w-full py-4 rounded-xl bg-[#1b3a5c] text-white font-bold text-base hover:bg-[#15304d] active:bg-[#0f2540] transition-colors disabled:opacity-50 cursor-pointer shadow-md flex items-center justify-center gap-2"
        >
          {exporting ? "⏳ Generating High-Resolution A4 PNG..." : "📥 DOWNLOAD PNG (High Res A4)"}
        </button>
        <button
          onClick={handlePrint}
          className="w-full py-3.5 rounded-xl bg-white border-2 border-[#1b3a5c] text-[#1b3a5c] font-bold text-base hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
        >
          🖨️ PRINT / SAVE AS PDF
        </button>
        <button
          onClick={handleNewInvoice}
          className="w-full py-3 rounded-xl bg-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-300 transition-colors cursor-pointer"
        >
          🔄 New Invoice
        </button>
      </div>

      {/* ===== DEDICATED OFF-SCREEN CANVAS FOR HIGH-RES PNG EXPORT ===== */}
      {/* Kept at standard unscaled 794x1123 coordinates with zero CSS transform so exported PNG is always pristine */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: "-9999px",
          width: "794px",
          height: "1123px",
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: -9999,
        }}
      >
        <div
          ref={exportRef}
          style={{
            width: "794px",
            height: "1123px",
            backgroundColor: "#ffffff",
          }}
        >
          <InvoiceTemplate {...invoiceProps} />
        </div>
      </div>

      {/* ===== PRINT-ONLY CLEAN UNTOUCHED A4 CONTAINER ===== */}
      <div className="hidden print:block print:m-0 print:p-0">
        <InvoiceTemplate {...invoiceProps} />
      </div>
    </div>
  );
}

// --- Reusable Form Field ---
function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  min,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3a5c] placeholder:text-gray-400"
      />
    </div>
  );
}
