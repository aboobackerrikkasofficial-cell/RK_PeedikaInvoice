import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "rkp_products";

// Default product — seeded only when localStorage is empty
const DEFAULT_PRODUCTS = [
  {
    id: "cutting-board-41x31",
    name: "Stainless Steel Cutting Board",
    size: "41 cm (L) × 31 cm (W)",
    material: "304 Grade Stainless Steel",
    description: "Premium 304 Grade Stainless Steel Cutting Board",
    codPrice: 430,
    prepaidPrice: 400,
  },
];

function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // corrupted data — fall through
  }
  // First open or empty — seed defaults
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
  return [...DEFAULT_PRODUCTS];
}

function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // storage full — silently fail
  }
}

/**
 * Custom hook for managing products in localStorage.
 * Returns: { products, addProduct, updateProduct, deleteProduct, exportProducts, importProducts }
 */
export default function useProducts() {
  const [products, setProducts] = useState(loadProducts);

  // Persist whenever products change
  useEffect(() => {
    saveProducts(products);
  }, [products]);

  const addProduct = useCallback((product) => {
    const newProduct = {
      ...product,
      id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      codPrice: Number(product.codPrice) || 0,
      prepaidPrice: Number(product.prepaidPrice) || 0,
    };
    setProducts((prev) => [...prev, newProduct]);
    return newProduct;
  }, []);

  const updateProduct = useCallback((id, updates) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updates,
              codPrice: Number(updates.codPrice) || 0,
              prepaidPrice: Number(updates.prepaidPrice) || 0,
            }
          : p
      )
    );
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const exportProducts = useCallback(() => {
    const json = JSON.stringify(products, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rkp-products-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [products]);

  const importProducts = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!Array.isArray(parsed)) {
            reject(new Error("Invalid file: expected an array of products"));
            return;
          }
          // Validate and ensure each product has an id
          const validated = parsed.map((p, i) => ({
            id: p.id || `imported-${Date.now()}-${i}`,
            name: p.name || "Unnamed Product",
            size: p.size || "",
            material: p.material || "",
            description: p.description || "",
            codPrice: Number(p.codPrice) || 0,
            prepaidPrice: Number(p.prepaidPrice) || 0,
          }));
          setProducts(validated);
          resolve(validated.length);
        } catch {
          reject(new Error("Invalid JSON file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }, []);

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    exportProducts,
    importProducts,
  };
}
