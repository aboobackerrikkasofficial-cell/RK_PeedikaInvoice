import { useState, useRef } from "react";
import { formatCurrency } from "../utils/calculations";

const EMPTY_FORM = {
  name: "",
  details: "",
  codPrice: "",
  prepaidPrice: "",
};

/**
 * ProductManager — Add / Edit / Delete / Export / Import products.
 * Uses a single flexible "Product Details / About Product" multiline field.
 * All data persists in browser LocalStorage.
 */
export default function ProductManager({
  products,
  onAdd,
  onUpdate,
  onDelete,
  onExport,
  onImport,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const fileInputRef = useRef(null);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;

    if (editingId) {
      onUpdate(editingId, form);
    } else {
      onAdd(form);
    }
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name || "",
      details: product.details || "",
      codPrice: product.codPrice ? product.codPrice.toString() : "",
      prepaidPrice: product.prepaidPrice ? product.prepaidPrice.toString() : "",
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"?`)) {
      onDelete(id);
      if (editingId === id) {
        setForm({ ...EMPTY_FORM });
        setEditingId(null);
        setShowForm(false);
      }
    }
  };

  const handleCancel = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await onImport(file);
      alert(`Imported ${count} product(s) successfully.`);
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    }
    e.target.value = "";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h2 className="text-lg font-bold text-[#1b3a5c]">Products</h2>
        <button
          type="button"
          onClick={() => {
            setForm({ ...EMPTY_FORM });
            setEditingId(null);
            setShowForm(!showForm);
          }}
          className="text-sm font-semibold text-[#1b3a5c] border border-[#1b3a5c] rounded-lg px-3 py-1.5 hover:bg-[#1b3a5c] hover:text-white transition-colors cursor-pointer"
        >
          {showForm && !editingId ? "✕ Close" : "+ Add Product"}
        </button>
      </div>

      {/* ---- Add / Edit Product Form ---- */}
      {showForm && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
          <p className="text-sm font-semibold text-gray-700">
            {editingId ? "Edit Product" : "Add New Product"}
          </p>

          {/* Product Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              placeholder="e.g. Stainless Steel Cutting Board / Kitchen Cleaner / Foam Cleaner"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3a5c] bg-white placeholder:text-gray-400"
            />
          </div>

          {/* Product Details / About Product (flexible multiline textarea) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Product Details / About Product
            </label>
            <textarea
              rows={3}
              value={form.details}
              onChange={handleChange("details")}
              placeholder="e.g. 41 cm × 31 cm | 304 Grade Stainless Steel&#10;or 500 ml | Powerful grease and kitchen cleaning solution"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3a5c] bg-white placeholder:text-gray-400 font-sans resize-y"
            />
            <p className="text-[11px] text-gray-400 mt-0.5">
              Enter any specifications, dimensions, volume, material, or description. Supports multiple lines.
            </p>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                COD Price ₹
              </label>
              <input
                type="number"
                min="0"
                value={form.codPrice}
                onChange={handleChange("codPrice")}
                placeholder="430"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3a5c] bg-white placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                GPay / Prepaid Price ₹
              </label>
              <input
                type="number"
                min="0"
                value={form.prepaidPrice}
                onChange={handleChange("prepaidPrice")}
                placeholder="400"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3a5c] bg-white placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={!form.name.trim()}
              className="flex-1 py-2.5 rounded-lg bg-[#1b3a5c] text-white font-bold text-sm hover:bg-[#15304d] transition-colors disabled:opacity-40 cursor-pointer"
            >
              {editingId ? "✓ UPDATE PRODUCT" : "✓ SAVE PRODUCT"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ---- Product List ---- */}
      {products.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">
          No products yet. Add your first product above.
        </p>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex items-start justify-between border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="min-w-0 flex-1 pr-2">
                <div className="font-semibold text-sm text-gray-800">
                  {p.name}
                </div>
                {p.details && (
                  <div className="text-xs text-gray-500 line-clamp-2 whitespace-pre-line mt-0.5">
                    {p.details}
                  </div>
                )}
                <div className="text-xs text-gray-600 mt-1 font-medium">
                  COD {formatCurrency(p.codPrice)} · GPay{" "}
                  {formatCurrency(p.prepaidPrice)}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleEdit(p)}
                  className="text-xs font-semibold text-[#1b3a5c] border border-[#1b3a5c] rounded px-2.5 py-1 hover:bg-[#1b3a5c] hover:text-white transition-colors cursor-pointer"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.name)}
                  className="text-xs font-semibold text-red-600 border border-red-300 rounded px-2.5 py-1 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- Export / Import ---- */}
      <div className="flex gap-2 pt-1 border-t border-gray-100">
        <button
          type="button"
          onClick={onExport}
          disabled={products.length === 0}
          className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold text-xs hover:bg-gray-200 transition-colors disabled:opacity-40 cursor-pointer"
        >
          📤 Export Products
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold text-xs hover:bg-gray-200 transition-colors cursor-pointer"
        >
          📥 Import Products
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
