# Happy Toys Frontend

The Happy Toys store, built with React, TypeScript, Vite, React Router, Tailwind CSS, Axios,
React Hook Form and Zod.

## Run it

You need [Node.js](https://nodejs.org) 20 or newer, and the API running (see `../backend/README.md`).

```powershell
# Terminal 1: the API, from the backend folder
dotnet run --project HappyToys.API --launch-profile http

# Terminal 2: the website, from the frontend folder
npm install
npm run dev
```

Open <http://localhost:5173>. Calls to `/api` are forwarded to the API on port 5254.

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server with live reload |
| `npm run build` | Checks all types and creates the production build in `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run typecheck` | Checks all types without building |

## Configuration

Copy `.env.example` to `.env` to change settings. `VITE_API_URL` is the API's address. Leave it empty
in development. Set it when the site is deployed.

## How it is organised

| Folder | Purpose |
|---|---|
| `src/pages` | One component per URL. `src/router.tsx` lists them all. |
| `src/components` | Reusable UI, grouped by area. |
| `src/context` | Shared state: cart, wishlist, login and notifications. |
| `src/services` | Every API call. `apiClient.ts` is the one Axios client. |
| `src/validation` | Form rules (Zod). They match the API's own checks. |
| `src/hooks` | Small reusable hooks. |
| `src/lib` | Helpers: formatting, totals, localStorage. |
| `src/types` | Types that match the API's JSON. |

The cart and wishlist are saved in the browser's localStorage. The API checks the cart against current
prices and stock when the site loads and when checkout opens, and it recalculates every price when an
order is placed.
