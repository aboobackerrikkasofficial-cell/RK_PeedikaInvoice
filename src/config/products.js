// ============================================
// PRODUCT CONFIGURATION
// Reference structure for products.
// Products are managed dynamically via LocalStorage.
// Each product needs:
//   - name: display name
//   - details: flexible multiline details / specifications / about product
//   - codPrice: Cash on Delivery price (₹)
//   - prepaidPrice: GPay / Prepaid price (₹)
// ============================================

const products = [
  {
    id: "cutting-board-41x31",
    name: "Stainless Steel Cutting Board",
    details: "41 cm (L) × 31 cm (W) | 304 Grade Stainless Steel",
    codPrice: 430,
    prepaidPrice: 400,
  },
  {
    id: "kitchen-cleaner-500ml",
    name: "Kitchen Cleaner",
    details: "500 ml | Powerful grease and kitchen cleaning solution",
    codPrice: 289,
    prepaidPrice: 250,
  },
  {
    id: "foam-cleaner-500ml",
    name: "Multi-Purpose Foam Cleaner",
    details: "500 ml | Suitable for multiple household cleaning applications",
    codPrice: 299,
    prepaidPrice: 269,
  },
  {
    id: "oil-bottle-2in1",
    name: "2-in-1 Oil Bottle",
    details: "500 ml | Easy-pour kitchen oil dispenser",
    codPrice: 250,
    prepaidPrice: 220,
  },
];

export default products;
