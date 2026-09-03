# gumbo-tech-task-admin-dashboard

# Admin Dashboard

Responsive React + TypeScript admin panel for the `core-backend` e-commerce API.

## Run locally

1. Start the backend from `../core-backend`:

   ```bash
   npm run dev
   ```

2. Start this dashboard:

   ```bash
   npm run dev
   ```

Vite proxies `/api` to `http://localhost:5000` during development. For a separate or production API, copy `.env.example` to `.env.local` and set `VITE_API_URL`.

Admin registration is intentionally unavailable. Create the first admin as documented in the backend README, then sign in through `/api/auth/admin/login`.

## Included

- Protected admin login with session restoration and automatic logout on 401 responses
- Dashboard totals and recent orders
- Product create, edit, delete, search, validation, stock indicators, and pagination
- Category create, edit, delete, search, and validation
- Order filtering, detail view, pagination, and guarded status progression
- User search and block/unblock controls
- Responsive desktop/mobile layouts and consistent loading, error, empty, and success states

## Checks

```bash
npm run build
```

## Incomplete Features

- Payment Gateway integration is not implemented
- Bonus features (Wishlist, Reviews, Coupons, Notifications, Unit tests, Swagger, Image upload) are not implemented
