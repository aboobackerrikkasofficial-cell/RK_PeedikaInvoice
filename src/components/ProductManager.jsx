import { useState, useRef } from "react";
import { formatCurrency } from "../utils/calculations";

const EMPTY_FORM = {
  name: "",
  size: "",
  material: "",
  description: "",
  codPrice: "",
  prepaidPrice: "",
};

/**
 * ProductManager — Add / Edit / Delete / Export / Import products.
 * All data lives in localStorage via the useProducts hook.
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
      name: product.name,
      size: product.size || "",
      material: product.material || "",
      description: product.description || "",
      codPrice: product.codPrice.toString(),
      prepaidPrice: product.prepaidPrice.toString(),
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"?`)) {
      onDelete(id);
      // If we were editing this product, close the form
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
    // Reset file input so the same file can be re-imported
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
          className="text-sm font-semibold text-[#1b3a5c] border border-[#1b3a5c] rounded-lg px-3 py-1.5 hover:bg-[#1b3a5c] hover:text-white transition-colors"
        >
          {showForm && !editingId ? "✕ Close" : "+ Add Product"}
        </button>
      </div>

      {/* ---- Add / Edit Form ---- */}
      {showForm && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
          <p className="text-sm font-semibold text-gray-600">
            {editingId ? "Edit Product" : "New Product"}
          </p>
          <FormInput
            label="Product Name"
            value={form.name}
            onChange={handleChange("name")}
            placeholder="Stainless Steel Cutting Board"
            required
          />
          <FormInput
            label="Size"
            value={form.size}
            onChange={handleChange("size")}
            placeholder="41 cm (L) × 31 cm (W)"
          />
          <FormInput
            label="Material"
            value={form.material}
            onChange={handleChange("material")}
            placeholder="304 Grade Stainless Steel"
          />
          <FormInput
            label="Description"
            value={form.description}
            onChange={handleChange("description")}
            placeholder="Premium stainless steel cutting board"
          />
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="COD Price ₹"
              value={form.codPrice}
              onChange={handleChange("codPrice")}
              placeholder="430"
              type="number"
              min="0"
            />
            <FormInput
              label="GPay / Prepaid Price ₹"
              value={form.prepaidPrice}
              onChange={handleChange("prepaidPrice")}
              placeholder="400"
              type="number"
              min="0"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={!form.name.trim()}
              className="flex-1 py-2.5 rounded-lg bg-[#1b3a5c] text-white font-bold text-sm hover:bg-[#15304d] transition-colors disabled:opacity-40"
            >
              {editingId ? "✓ UPDATE PRODUCT" : "✓ SAVE PRODUCT"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-300 transition-colors"
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
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm text-gray-800 truncate">
                  {p.name}
                </div>
                {p.size && (
                  <div className="text-xs text-gray-500 truncate">{p.size}</div>
                )}
                <div className="text-xs text-gray-500 mt-0.5">
                  COD {formatCurrency(p.codPrice)} · GPay{" "}
                  {formatCurrency(p.prepaidPrice)}
                </div>
              </div>
              <div className="flex gap-1.5 ml-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleEdit(p)}
                  className="text-xs font-semibold text-[#1b3a5c] border border-[#1b3a5c] rounded px-2.5 py-1 hover:bg-[#1b3a5c] hover:text-white transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id, p.name)}
                  className="text-xs font-semibold text-red-600 border border-red-300 rounded px-2.5 py-1 hover:bg-red-600 hover:text-white transition-colors"
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
          className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold text-xs hover:bg-gray-200 transition-colors disabled:opacity-40"
        >
          📤 Export Products
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold text-xs hover:bg-gray-200 transition-colors"
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

// --- Small form input ---
function FormInput({
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
      <label className="block text-xs font-semibold text-gray-600 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3a5c] placeholder:text-gray-400"
      />
    </div>
  );
}
