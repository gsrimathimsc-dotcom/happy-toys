# Happy Toys – E-commerce Demo Prototype

A modern online toy store built with **Next.js, TypeScript and Tailwind CSS**.
It is a **demo prototype**: there is **no database** and **no real payment**. Products come
from a JSON file and orders are kept in the server's memory.

The full shopping journey works:

**Home → Browse Products → Product Details → Add to Cart → Checkout → Order Confirmation**

---

## 1. How the project works (architecture)

```
 ┌──────────────────────── Browser ────────────────────────┐
 │  Pages (src/app/...)  +  Components (src/components)    │
 │  Shared state (src/context): Cart, Wishlist, Auth, Toast│
 │  Cart / wishlist / demo login saved in localStorage     │
 └───────────────┬─────────────────────────────────────────┘
                 │  fetch("/api/...")  (JSON)
 ┌───────────────▼──────── Next.js server ─────────────────┐
 │  API Route Handlers (src/app/api/...)                   │
 │        │                                                │
 │  Services (src/lib/productService.ts, orderStore.ts)    │
 │        │                                                │
 │  Mock data (src/data/products.json, categories.json)    │
 │  Orders → in-memory Map (lost when server restarts)     │
 └─────────────────────────────────────────────────────────┘
```

* **Frontend and backend live in one Next.js project.** Pages are in `src/app`, and the
  backend endpoints are in `src/app/api`.
* **The API routes never touch the JSON directly** – they call the *service* functions in
  `src/lib`. If you add a real database later, you only change the service files.
* **The cart is a React Context.** "Add to Cart" first asks `POST /api/cart` to check that
  the product exists and has stock, then saves the item in the browser.
* **Checkout** sends the cart to `POST /api/orders`. The server **re-calculates every
  price** from its own data (so nobody can change prices in the browser), creates an order
  number, and saves the order in memory.

## 2. Technology stack

| Part | Technology | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Pages + API in one project |
| Language | **TypeScript** | Catches mistakes before you run the code |
| Styling | **Tailwind CSS v4** | Fast, consistent styling with utility classes |
| Icons | **Lucide React** | Clean, professional icon set |
| State | **React Context API** | Cart, wishlist, login and notifications shared across pages |
| Data | **JSON files + in-memory storage** | No database needed for a demo |
| Font | Plus Jakarta Sans (via `next/font`) | Modern, readable typography |

## 3. Folder structure

```
happy-toys/
├── public/
│   └── images/products/        ← 24 toy illustrations (p1.svg … p24.svg)
├── src/
│   ├── app/                    ← PAGES (each folder = a URL)
│   │   ├── page.tsx            → /            Home
│   │   ├── products/page.tsx   → /products    Product listing + filters
│   │   ├── products/[id]/      → /products/p1 Product details
│   │   ├── cart/               → /cart
│   │   ├── checkout/           → /checkout
│   │   ├── order-confirmation/[orderId]/ → /order-confirmation/HT-...
│   │   ├── login/  register/  wishlist/
│   │   ├── not-found.tsx  error.tsx  loading.tsx
│   │   ├── layout.tsx          ← Navbar + Footer around every page
│   │   ├── globals.css         ← Tailwind + brand colours
│   │   └── api/                ← BACKEND (Route Handlers)
│   │       ├── products/route.ts           GET  /api/products
│   │       ├── products/[id]/route.ts      GET  /api/products/:id
│   │       ├── categories/route.ts         GET  /api/categories
│   │       ├── cart/route.ts               POST /api/cart
│   │       ├── orders/route.ts             POST /api/orders
│   │       └── orders/[orderId]/route.ts   GET  /api/orders/:orderId
│   ├── components/             ← REUSABLE UI
│   │   ├── layout/   Navbar, Footer, Logo, SearchBar, AuthCard
│   │   ├── home/     HeroBanner, CategoriesSection, ProductSection, OfferBanner, Testimonials, Newsletter
│   │   ├── products/ ProductCard, ProductGrid, ProductFilters, ProductsView, ProductDetailsView, CategoryCard
│   │   ├── cart/     CartItemRow, OrderSummary
│   │   └── ui/       Button, StarRating, PriceTag, QuantitySelector, Spinner, EmptyState, FormField, ...
│   ├── context/                ← STATE: CartContext, WishlistContext, AuthContext, ToastContext, Providers
│   ├── data/                   ← MOCK DATA: products.json, categories.json, testimonials.ts
│   ├── lib/                    ← HELPERS: productService, orderStore, utils, api, storage
│   └── types/index.ts          ← TypeScript interfaces (Product, CartItem, Order, ...)
├── package.json  tsconfig.json  next.config.ts  postcss.config.mjs
└── README.md
```

## 4. Install and run on Windows 11 (step by step)

### Step 1 – Install Node.js (one time only)
1. Go to <https://nodejs.org> and download the **LTS** version (v20 or newer).
2. Run the installer and keep the default options.
3. Open **PowerShell** (or the terminal in VS Code: *Terminal → New Terminal*) and check:

```powershell
node -v
npm -v
```

You should see two version numbers, for example `v22.x.x` and `10.x.x`.

### Step 2 – Unzip the project
Unzip `happy-toys.zip` into a simple folder, for example `C:\Projects\happy-toys`.

### Step 3 – Open the folder in VS Code
*File → Open Folder…* → choose `C:\Projects\happy-toys`. Open a terminal (*Ctrl + `*).

### Step 4 – Install the packages

```powershell
npm install
```

This downloads Next.js, React, Tailwind CSS, Lucide and TypeScript into a `node_modules`
folder. It takes 1–3 minutes the first time.

> **If PowerShell says "running scripts is disabled on this system"**, run this once and
> then try again:
> `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`

### Step 5 – Start the app

```powershell
npm run dev
```

Open <http://localhost:3000> in your browser. 🎉
To stop the server, press **Ctrl + C** in the terminal.

### Other useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server with live reload |
| `npm run build` | Creates an optimised production build (also finds errors) |
| `npm start` | Runs the production build (after `npm run build`) |
| `npm run typecheck` | Checks all TypeScript types without running the app |

## 5. API reference (try these in your browser while `npm run dev` is running)

| Method | URL | Description |
|---|---|---|
| GET | `/api/products` | All products. Optional: `category`, `q`, `minPrice`, `maxPrice`, `sort` (`popularity`, `newest`, `price-asc`, `price-desc`), `limit` |
| GET | `/api/products/p1` | One product + related products |
| GET | `/api/categories` | All 8 categories with product counts |
| POST | `/api/cart` | Body `{ "productId": "p1", "quantity": 2 }` – validates stock |
| POST | `/api/orders` | Body `{ customer, paymentMethod, items }` – creates a demo order |
| GET | `/api/orders/HT-...` | Order details |

Example: <http://localhost:3000/api/products?category=soft-toys&sort=price-asc>

Every response has the same shape:
`{ "success": true, "data": ... }` or `{ "success": false, "error": "message" }`

## 6. Important limitations (because there is no database)

* **Orders are stored in memory.** When you stop or restart the server (`Ctrl + C`, then
  `npm run dev`), all orders are deleted. The confirmation page also keeps a copy of your
  *latest* order in the browser so it still shows after a restart.
* **Stock does not go down** after an order – the JSON file is never changed.
* **Login / Register is demo only.** Accounts are saved in the browser's localStorage and
  passwords are **not** secure. Any valid email + 6-character password logs you in.
* **Payments are not real.** No payment gateway is connected.
* Cart and wishlist are saved per browser (clearing browser data empties them).

## 7. Manual test checklist

1. **Home** – hero, categories, featured, best sellers, new arrivals, offers, testimonials,
   newsletter (try an invalid email, then a valid one) all show.
2. **Search** – type `teddy` in the top search bar and press Enter.
3. **Listing** – click *Shop by Category → Soft Toys*; try price filters and every sort option;
   click *Clear all*. On mobile, use the *Filters* button.
4. **Wishlist** – click a heart icon; the heart counter in the navbar increases; open the wishlist page.
5. **Product details** – open any product; change quantity; *Add to Cart*; check related products.
6. **Out of stock** – open *Rock Crawler 4x4 Off-Road Truck*: buttons are disabled.
7. **Stock limit** – the *SkyHawk Mini Drone* has only 9 in stock; try to add more.
8. **Cart** – change quantities, remove an item, check subtotal / discount / delivery / total.
   Orders under ₹999 pay ₹49 delivery.
9. **Checkout** – click *Place Order* with empty fields to see validation, then fill in
   valid details (10-digit mobile starting 6–9, 6-digit PIN code) and place the order.
10. **Confirmation** – note the order number, check the summary, click *Continue Shopping*.
11. **Login / Register** – create an account; your name appears in the navbar; log out.
12. **404** – visit <http://localhost:3000/products/abc> to see the not-found page.

## 8. Customising

* **Products:** edit `src/data/products.json` (keep the same fields).
* **Images:** put a photo (e.g. `p1.jpg`) in `public/images/products/` and change the
  product's `"image"` value to `"/images/products/p1.jpg"`. Use only images you have the
  rights to use.
* **Brand colours:** change the values in the `@theme` block of `src/app/globals.css`.

## 9. Troubleshooting

| Problem | Fix |
|---|---|
| `'next' is not recognized` | You skipped `npm install`. Run it inside the project folder. |
| Port 3000 already in use | Run `npm run dev -- -p 3001` and open <http://localhost:3001>. |
| Font download error when offline | `next/font` needs internet the first time. Connect and restart `npm run dev`. |
| Page shows old data/styles | Stop the server, delete the `.next` folder, run `npm run dev` again. |
#   h a p p y - t o y s  
 