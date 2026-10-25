# RK PEEDIKA SHOP — Invoice PNG Generator

A lightweight, client-side invoice generator web application designed specifically for **RK PEEDIKA SHOP**. Built with React, Vite, and Tailwind CSS.

Generates high-resolution (3× scale) A4 portrait invoice PNGs directly in your browser.

---

## 🌟 Key Features

- **Pixel-Accurate Visual Template**: Exactly matches the official RK PEEDIKA SHOP invoice layout (Dark blue `#1b3a5c` accents, structured BILL TO / SHIP TO and ORDER DETAILS panels, product table, GRAND TOTAL bar, Cash on Delivery orange panel, GPay green panel, delivery window, and footer).
- **Client-Side Only**: 100% browser-based. Zero backend, zero database, zero external tracking, and zero paid APIs.
- **Product Management via LocalStorage**:
  - Add, edit, and delete products directly from the interface without modifying source code.
  - Automatically seeds default product (*Stainless Steel Cutting Board*) on initial launch.
  - Export product catalog as JSON backup or import to another device/browser.
- **Dynamic Pricing & Calculations**:
  - Automatic pricing switch based on selected Payment Mode (COD vs GPay / Prepaid).
  - Instant subtotal, optional discount deduction, and final grand total calculation.
  - Single source of truth for all pricing figures across the interface and generated invoice.
- **Single Component Architecture**: The exact same `InvoiceTemplate` component powers both the on-screen preview and the exported high-resolution PNG (`html-to-image`).
- **Defensive Layout**: Strict A4 proportions (794×1123px) with fixed-table constraints, word-wrapping, and overflow protection for long names, addresses, landmarks, and descriptions.
- **Auto-Sequenced Invoice IDs**: Generates standard `RKP-YYYYMMDD-XXX` numbering saved locally.
- **Mobile Responsive**: Clean, mobile-friendly input form with quick product selection and large buttons.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler / Dev Server**: [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Image Generation**: [html-to-image](https://github.com/bubkoo/html-to-image)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### Installation

```bash
# Clone the repository
git clone https://github.com/aboobackerrikkasofficial-cell/RK_PeedikaInvoice.git
cd RK_PeedikaInvoice

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
```

Production static assets will be output to the `dist/` directory.

---

## 🌐 Deploy to Vercel

This repository is ready for 1-click deployment on [Vercel](https://vercel.com/):

1. Log in to [Vercel](https://vercel.com/).
2. Click **"Add New..."** > **"Project"**.
3. Import your GitHub repository: `aboobackerrikkasofficial-cell/RK_PeedikaInvoice`.
4. Vercel automatically detects **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **"Deploy"**.

---

## 📄 License

Private & proprietary to RK PEEDIKA SHOP.
