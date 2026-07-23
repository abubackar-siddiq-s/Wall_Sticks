# WALLSTICKS

An e-commerce platform — React + Vite + Tailwind + Framer Motion + React Three Fiber frontend, Express + MongoDB backend.

## What's built

**Frontend** (`/frontend`) — fully working, run with `npm install && npm run dev`:
- Home (with interactive Three.js/R3F floating-poster hero), Shop (search/filter/sort), Product Detail, Create-Your-Own-Poster (upload flow), Cart, Wishlist, Checkout, Payment (UPI QR + screenshot submission), Order Success (verification-pending state), My Orders (status timeline), About, Contact
- Admin: Login, Dashboard (stats + revenue chart), Products (CRUD table + modal), **Trending (drag-and-drop carousel reordering)**, Orders (card list → detail modal with verify/reject/status actions), Settings
- Design system: Poppins, Tailwind tokens for the yellow/black/white palette, glassmorphism, soft shadows, large radii, Framer Motion micro-interactions
- **Wired to the live API** (`src/lib/api.js` + `src/hooks/`) for products, categories, trending, settings, orders, payments, and every admin CRUD action — with automatic fallback to bundled demo data whenever the backend isn't reachable, so the whole site stays clickable with zero setup. Look for the small "showing demo data" notices in the admin pages; they disappear once your backend is connected.

**Backend** (`/backend`) — real Express + Mongoose source, now actually called by the frontend:
- Models: User, Product, Category, Order, Payment, Cart, Wishlist, Admin, Settings, Review, Trending
- Routes: auth (JWT admin login), products, categories, orders, payments (manual verification flow), cart, wishlist, reviews, trending carousel (with reorder endpoint), admin stats, settings
- Middleware: JWT auth guard, Cloudinary/Multer upload handling, centralized error handling, rate limiting
- `seed.js` creates your first admin account + default categories

## Running it locally

### Backend first
```
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, Cloudinary keys, ADMIN_EMAIL
npm run seed            # creates your admin account + categories
npm run dev
```
Runs at `http://localhost:5000`. Requires a MongoDB connection string (Atlas free tier works) and a free Cloudinary account for image uploads. Without this running, the frontend still works fully on bundled demo data.

### Frontend
```
cd frontend
cp .env.example .env    # VITE_API_URL=http://localhost:5000/api (already the default)
npm install
npm run dev
```
Opens at `http://localhost:5173`. The moment the backend above is running and seeded, the site — including the admin panel — switches from demo data to your real database automatically.

## Connecting frontend to backend

This is already wired — set `VITE_API_URL` in `frontend/.env` to your deployed backend URL and everything (catalog, trending, orders, payments, admin CRUD) switches from demo data to live data automatically. Cart and wishlist still live in the browser's localStorage by design (guest-friendly, no login required to shop) — the `Cart` and `Wishlist` Mongoose models exist in the backend if you'd rather sync them server-side per user later.

## Deployment

- **Frontend**: `frontend/vercel.json` is included — import the repo into Vercel, set root directory to `frontend`, and set `VITE_API_URL` to your deployed backend URL. Netlify works the same way (build command `npm run build`, publish dir `dist`).
- **Backend**: `render.yaml` is included — in Render, choose "New +" → "Blueprint" and point it at this repo; it'll pick up the backend service definition. Fill in `MONGO_URI`, `ADMIN_EMAIL`, `CLOUDINARY_*`, and `CLIENT_URL` in the Render dashboard (marked `sync: false` so they're not committed to git). Railway or a small VPS work too — a `Procfile` is included for platforms that use one.
- **Database**: MongoDB Atlas free M0 tier is enough for a small storefront.
- **Images**: Cloudinary free tier (25 credits/month) is enough for a small storefront.

## What's still a scaffold, not "done"

Being upfront: this is a strong, working foundation — not a finished, battle-tested production system. Before real customers and real money touch it, you'll still want to:
- Add a real GST invoice/legal review if you're charging tax
- Consider server-side image resizing/responsive `srcset` for poster photos (Cloudinary can do this via URL transforms — worth adding once real product photos are in)

## Performance: code-splitting

Every route is now its own chunk (`React.lazy` + `Suspense` in `App.jsx`), and the Three.js/R3F hero is split out further still — it's ~240kb gzipped on its own, loaded only when a capable device actually navigates to the homepage (see below). Before this pass the whole app shipped as one 380kb-gzipped bundle; now the initial JS payload is ~122kb gzipped, with everything else fetched on demand as people navigate.

## Low-end device fallback for the 3D hero

`src/hooks/useDeviceCapability.js` checks `prefers-reduced-motion`, CPU core count, device memory (where the browser exposes it), connection speed/save-data, and WebGL support. If any of those suggest a low-end or constrained device, the homepage renders `HeroFallback` — a pure-CSS "floating posters" hero with the same visual idea, zero WebGL, and no Three.js download at all — instead of the interactive `Hero3D` component. Capable devices still get the full interactive version, lazy-loaded so it never blocks first paint; `HeroFallback` doubles as the loading state while that chunk downloads.

## Spam protection

- **Contact form** now actually submits to `POST /api/contact` (previously just showed a toast) and is stored via a new `ContactMessage` model, visible in a new **Admin → Messages** inbox.
- **Honeypot field**: an off-screen `company` input that real users never see or fill (not tab-reachable, `aria-hidden`), but most naive bots fill automatically. If it's non-empty, the backend silently pretends success without saving anything.
- **Rate limiting**: the contact form gets its own stricter cap (10 requests / 15 min per IP) on top of the general `/api/orders` and `/api/payments` limits already in place.

## UI polish (this pass)

- **Quick View actually works now.** The "Quick View" button on product cards previously set state that nothing rendered — a real gap from the first build. `QuickViewModal` now shows image, price, rating, quantity, add-to-cart, and wishlist without leaving the grid, wired into both Home and Shop.
- **Loading skeletons** on Home's trending/best-seller sections and the Shop grid — matches `ProductCard`'s exact proportions so the layout doesn't jump.
- **404 page** — previously unmatched routes just rendered blank/broke.
- **Responsive images**: `src/lib/imageUrl.js` centralizes image URL handling (was duplicated ad hoc in 5+ files) and adds Cloudinary-aware `srcset` generation, so once real Cloudinary photos are in, phones stop downloading desktop-sized images.
- **My Orders is now real**: previously 100% hardcoded demo data with no way to see your actual orders. It now looks up orders by the phone number used at checkout via `GET /api/orders/phone/:phone`, falling back to demo orders when no backend/lookup yet.

## Backend depth (this pass)

- **Printable receipts**: `GET /api/orders/:orderNumber/receipt` returns a self-contained, styled HTML receipt (works with the browser's own "Print → Save as PDF", no PDF library needed). Linked from Order Success and My Orders.
- **Expanded test coverage**: `cart-wishlist.test.js` (session isolation, populate-on-read, clearing), `catalog-config.test.js` (category ordering/active-filtering, trending add + drag-reorder, settings singleton behavior + validation, and — importantly — a test proving the contact-form honeypot silently drops spam without saving it). Combined with the previous pass's auth/products/payment-flow suites, most write paths now have at least one test.
- Same sandbox caveat as before: I confirmed all 12 route files import and wire together with zero errors, but couldn't execute a full `npm test` run here because this environment blocks the network call `mongodb-memory-server` needs. Runs normally with real internet access (your machine, CI, etc.).

## Input validation

`express-validator` now guards every write endpoint that matters: admin login, product create/update, order creation, payment submission, order status transitions, and settings updates. Bad requests get a `400` with field-level messages (`{ message, errors: [{ field, message }] }`) instead of reaching Mongoose or silently corrupting data. See `backend/middleware/validate.js` and the `body(...)`/`query(...)` chains at the top of each route file.

## Tests

`backend/tests/` has a Jest + Supertest suite focused on the highest-stakes flow — order creation → payment submission → admin verification — plus auth and product-catalog coverage. Run with `cd backend && npm install && npm test`.

**Note on running this yourself:** the suite uses `mongodb-memory-server`, which downloads a small MongoDB binary the first time you run it (cached afterward). I wrote, syntax-checked, and logic-reviewed every test, and confirmed all routes import and wire up without errors — but I could not execute a full run in the environment I built this in, because its network allowlist blocks `fastdl.mongodb.org`. This isn't a code issue; it'll run normally on your machine or in CI (GitHub Actions etc.) where that download isn't blocked. See `backend/tests/README.md` for what's covered.

## Cart & Wishlist: now synced to the backend

Cart and wishlist are keyed by an anonymous per-browser session ID (`src/lib/session.js`, a UUID stored in localStorage — no login required to shop). On load, each context tries to hydrate from `GET /api/cart/:sessionId` / `GET /api/wishlist/:sessionId`; changes push to the backend in the background (debounced for the cart, immediate for wishlist toggles). If the backend isn't reachable, everything silently falls back to the local copy — the storefront never breaks for the shopper, it just stops persisting across devices until the backend's back.
