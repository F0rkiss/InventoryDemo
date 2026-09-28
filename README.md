# InventMain

InventMain is a React, Framework7, and Vite inventory demo for managing internal procurement at Media Indonesia. The demo focuses on the full request lifecycle: Material Request, Purchase Request, Purchase Order, Laporan Penerimaan Barang (LPB), stock records, memo approvals, and supporting master data.

The current demo can run fully in the browser with seeded data, so reviewers can explore the app without connecting to a backend.

## Demo Login

Use these credentials when demo data mode is enabled:

```text
Employee Code: 1001
Password: Demo@12345
```

Demo data is stored in browser `localStorage` under `mi_inventory_demo_store_v3`. The navbar includes a reset action in demo mode to restore the original seeded data.

## Main Demo Areas

- Dashboard summary for Material Requests, Purchase Requests, Purchase Orders, LPB, memos, items, and billing.
- Request workflow for creating and tracking Material Requests, Purchase Requests, Purchase Orders, and LPB.
- Stock and item management for asset stock, non-asset stock, and barang records.
- Memo management for admin and personal memo flows.
- Approval setup for MR, PR/PO, LPB, and memo approvals.
- Master data management for users, roles, suppliers, categories, item types, item sources, statuses, payment methods, currency, PPN, billing, and navigation access.
- Information pages for notifications, mutation history, and activity logs.

## Typical Demo Flow

1. Sign in with the demo credentials.
2. Review the dashboard counts and recent memo cards.
3. Open `Request` to create or inspect a Material Request.
4. Convert an approved Material Request into a Purchase Request.
5. Create a Purchase Order from an open Purchase Request.
6. Create an LPB from a Purchase Order when goods are received.
7. Use the `Barang`, `Memo`, `Approval Step`, and `Information` menus to review the supporting modules.

## Tech Stack

- React 18
- Framework7 React
- Vite
- Tailwind CSS
- Axios
- Browser-based demo API adapter

## Requirements

- Node.js 20.x, tested with Node.js `v20.16.0`
- npm

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will print the local URL in the terminal, usually `http://localhost:5173`.

## Environment

Copy `.env.example` to `.env` before running the app. Without a `.env`, demo mode is off and API calls go to `undefined/api`.

All `VITE_*` values are bundled into the browser build, so never put real secrets in them.

For the browser-only demo, keep demo mode enabled:

```env
VITE_USE_DEMO_DATA=true
VITE_URL=http://localhost:5173
```

For a backend-connected environment, disable demo mode and point `VITE_URL` to the API host:

```env
VITE_USE_DEMO_DATA=false
VITE_URL=https://your-api-host.example
```

## Scripts

```bash
npm run dev      # Start the Vite development server
npm run start    # Alias for npm run dev
npm run build    # Build the production web app into www/
npm run preview  # Preview the production build locally
```

## Project Structure

```text
src/
  api/          Demo adapter, seeded demo data, and Axios setup
  auth/         Login, auth context, and protected route handling
  components/   App screens, CRUD modules, dashboard, layout, and shared UI
  css/          Global styles, Framework7 styles, and app-specific CSS
  excel/        Export helpers
  helper/       Date, price, encryption, device, and utility helpers
  js/           App store, menu definitions, and routing helpers
public/         Static public assets
www/            Production build output
```

## Notes

- The demo adapter is enabled by `VITE_USE_DEMO_DATA=true` and handles API calls in the browser.
- Demo changes are persisted locally until the demo store is reset.
- The production build output is written to `www/` as configured in `vite.config.js`.
