# CLAUDE.md
# HAPPY TOYS – FULL-STACK E-COMMERCE APPLICATION

## 1. PROJECT OVERVIEW

You are acting as a Senior Full-Stack Developer, Solution Architect, UI/UX Designer, Database Designer, and QA Engineer.

The project is an online Toy Store E-commerce application named **Happy Toys**.

An initial prototype already exists. Your primary responsibility is to analyse, improve, complete, and enhance the existing application into a fully functional, responsive, professional E-commerce platform.

IMPORTANT:
- Do not unnecessarily recreate the application from scratch.
- Analyse the existing source code before making changes.
- Preserve existing working functionality.
- Identify incomplete features, broken components, UI issues, and missing integrations.
- Complete existing functionalities.
- Add missing business functionalities.
- Improve the overall design, architecture, security, and performance.
- Ensure frontend, backend, and database integrations work correctly.

The final application should look and behave like a real commercial E-commerce website.

---

## 2. TECHNOLOGY STACK

### Frontend
- React JS
- JavaScript (ES6+)
- React Router DOM
- Tailwind CSS
- Axios
- Context API for state management
- Lucide React for icons
- Responsive CSS

### Backend
- ASP.NET Core Web API
- C#
- Entity Framework Core
- RESTful API architecture
- Dependency Injection
- DTO-based request and response models
- Proper exception handling
- Logging

### Database
- PostgreSQL
- pgAdmin 4
- Entity Framework Core PostgreSQL provider (Npgsql)
- Code First migrations

### Development Tools
- Visual Studio Code
- Visual Studio (if required)
- Git and GitHub
- Postman
- Claude AI / Codex

---

## 3. BRANDING AND UI/UX DESIGN

Enhance the existing Happy Toys theme to create a visually attractive and premium shopping experience.

### Brand Identity

Business Name: Happy Toys

Brand personality:
- Joyful
- Trustworthy
- Modern
- Colourful
- Professional
- Family-friendly

### Colour Palette

Use a balanced combination of attractive business colours.

Primary Colour: Deep Royal Blue – #2447C5

Secondary Colour: Vibrant Orange – #FF8A35

Accent Colour: Sunshine Yellow – #FFD447

Supporting Colour: Soft Lavender – #EEEAFE

Background: Warm White – #FFFDF9

Text Colour: Dark Navy – #172554

Success: #16A34A

Error: #DC2626

Use these colours consistently throughout the application.

Avoid excessive bright colours. Maintain a premium commercial appearance.

### Typography

Use modern fonts such as:
- Poppins for headings.
- Inter for body text.

Typography requirements:
- Clear headings.
- Comfortable reading sizes.
- Consistent font weights.
- Proper spacing.
- Readable mobile text.

### Design Improvements

- Modern hero banners.
- High-quality toy product images.
- Attractive category cards.
- Premium product cards.
- Smooth hover animations.
- Modern buttons.
- Consistent border radius.
- Subtle shadows.
- Attractive promotional banners.
- Professional footer.
- Loading skeletons.
- Toast notifications.
- Empty-state illustrations.
- Consistent spacing and alignment.

Do not use emojis as substitutes for professional product images or icons.

---

## 4. MOBILE-FIRST RESPONSIVE DESIGN

Mobile responsiveness is a critical requirement.

Design the application mobile-first and ensure it works properly on:

- Small mobile devices (320px).
- Standard mobile devices (375px–430px).
- Tablets (768px).
- Laptops (1024px–1440px).
- Large desktop screens (1920px).

### Mobile Requirements

- Responsive navigation menu.
- Mobile hamburger menu.
- Easy-to-use search functionality.
- Mobile-friendly product cards.
- Two-column product grid where appropriate.
- Touch-friendly buttons.
- Properly sized input fields.
- Responsive product detail pages.
- Mobile-friendly cart.
- Mobile-friendly checkout.
- Sticky Add to Cart button where appropriate.
- Responsive filters and sorting.
- No horizontal scrolling.
- No overlapping elements.
- Optimized product images.

All pages must be tested at different screen sizes.

Do not simply shrink the desktop layout. Design a proper mobile experience.

---

## 5. APPLICATION MODULES AND FUNCTIONALITIES

Implement and complete the following modules.

### MODULE 1: HOME PAGE

- Responsive navigation bar.
- Happy Toys logo.
- Product search.
- Login / Register.
- Wishlist icon.
- Shopping cart with item count.
- Attractive hero banner.
- Shop by Categories.
- Featured Products.
- Best Sellers.
- New Arrivals.
- Trending Toys.
- Special Offers.
- Discount banners.
- Customer testimonials.
- Newsletter subscription.
- Footer with useful links.

### MODULE 2: PRODUCT CATEGORIES

Implement these categories:

1. Educational Toys
2. Baby Toys
3. Remote Control Toys
4. Soft Toys
5. Building Blocks
6. Outdoor Toys
7. Board Games
8. Action Figures
9. Puzzles
10. Musical Toys

Features:
- Display products by category.
- Category-wise filtering.
- Category images.
- Product count.
- Dynamic category navigation.

### MODULE 3: PRODUCT MANAGEMENT

Create complete product management functionality.

Admin should be able to:

- Add products.
- Edit products.
- Delete products.
- View all products.
- Upload product images.
- Assign categories.
- Update product prices.
- Set discount prices.
- Manage stock quantities.
- Activate/deactivate products.

Product information:

- Product ID.
- Product name.
- Product description.
- Category.
- Brand.
- Price.
- Discount price.
- Product images.
- Rating.
- Stock quantity.
- Age group.
- Product specifications.
- Created date.
- Product status.

### MODULE 4: PRODUCT LISTING

- Product grid.
- Product search.
- Category filters.
- Price range filter.
- Brand filter.
- Age group filter.
- Availability filter.
- Sort by price.
- Sort by popularity.
- Sort by newest.
- Pagination.
- Wishlist.
- Add to Cart.
- Product ratings.
- Discount labels.

### MODULE 5: PRODUCT DETAILS

- Multiple product images.
- Image gallery.
- Product name.
- Product description.
- Price and discount.
- Customer ratings.
- Stock availability.
- Age recommendation.
- Product specifications.
- Quantity selector.
- Add to Cart.
- Buy Now.
- Wishlist.
- Related products.
- Customer reviews.

### MODULE 6: USER AUTHENTICATION

Implement:

- User registration.
- User login.
- Secure password hashing.
- JWT-based authentication.
- Logout.
- User profile.
- Forgot password workflow.
- Change password.
- Role-based authorization.

User roles:

- Customer.
- Admin.

Protect admin pages and APIs from unauthorized access.

Never store plain-text passwords.

### MODULE 7: SHOPPING CART

- Add products to cart.
- Remove products.
- Increase quantity.
- Decrease quantity.
- Validate stock availability.
- Calculate subtotal.
- Apply discount.
- Calculate total.
- Display cart item count.
- Persist cart for logged-in users.
- Support guest cart where appropriate.

### MODULE 8: WISHLIST

- Add to wishlist.
- Remove from wishlist.
- View wishlist.
- Move wishlist product to cart.
- Prevent duplicate wishlist entries.

### MODULE 9: CHECKOUT

Implement a complete checkout process.

Customer information:
- Full name.
- Email.
- Mobile number.
- Address.
- City.
- State.
- PIN code.

Checkout functionality:
- Delivery address selection.
- Order summary.
- Product quantity.
- Shipping charges.
- Discount calculations.
- Final payable amount.
- Payment method selection.

Initially implement Cash on Delivery and a clearly labelled simulated online payment option.

Do not claim that real payments are processed unless a genuine payment gateway is integrated.

### MODULE 10: ORDER MANAGEMENT

Customer features:
- Place order.
- View order confirmation.
- View order history.
- View order details.
- Cancel eligible orders.
- Track order status.

Order statuses:
- Pending.
- Confirmed.
- Processing.
- Shipped.
- Delivered.
- Cancelled.

Admin features:
- View all orders.
- View customer information.
- Update order status.
- Manage cancellations.
- View order details.

### MODULE 11: CUSTOMER REVIEWS

- Submit product reviews.
- Star ratings.
- Review comments.
- Display customer reviews.
- Admin moderation.
- Prevent duplicate reviews where appropriate.

### MODULE 12: ADMIN DASHBOARD

Create a professional admin dashboard.

Dashboard cards:
- Total Revenue.
- Total Orders.
- Total Customers.
- Total Products.
- Low Stock Products.
- Pending Orders.

Admin modules:
- Product Management.
- Category Management.
- Customer Management.
- Order Management.
- Inventory Management.
- Review Management.
- Dashboard Reports.

Add charts for:
- Monthly sales.
- Order status.
- Top-selling products.
- Revenue trends.

Only display actual database-backed figures.

---

## 6. BACKEND ARCHITECTURE

Use ASP.NET Core Web API.

Follow a clean and maintainable architecture.

Suggested structure:

HappyToys.API
- Controllers
- Middleware
- Extensions
- Program.cs
- appsettings.json

HappyToys.Application
- DTOs
- Interfaces
- Services
- Validators

HappyToys.Domain
- Entities
- Enums
- Common

HappyToys.Infrastructure
- Data
- Repositories
- Configurations
- Migrations
- Services

Use dependency injection.

Implement:
- RESTful API endpoints.
- DTOs.
- Service layer.
- Repository pattern where beneficial.
- Entity Framework Core.
- Global exception handling.
- Logging.
- Input validation.
- Proper HTTP status codes.
- Swagger / OpenAPI documentation.

Avoid unnecessary abstraction and overengineering.

---

## 7. DATABASE DESIGN – POSTGRESQL

Use PostgreSQL as the primary database.

Create appropriate database tables:

1. Users
2. Roles
3. UserAddresses
4. Categories
5. Products
6. ProductImages
7. Carts
8. CartItems
9. Wishlists
10. WishlistItems
11. Orders
12. OrderItems
13. Payments
14. Reviews
15. InventoryTransactions
16. Coupons

### Database Requirements

- Use primary keys and foreign keys.
- Define appropriate relationships.
- Add unique constraints where necessary.
- Use decimal/numeric for monetary values.
- Add indexes for frequently searched fields.
- Use proper nullable/non-nullable columns.
- Maintain created and updated timestamps.
- Implement database migrations.
- Avoid duplicate data.
- Use transactions for order placement and inventory updates.

Create realistic seed data for demonstration.

Use PostgreSQL connection strings through configuration and environment variables.

Never commit database passwords or secrets to GitHub.

---

## 8. API ENDPOINTS

Implement REST API endpoints for the following:

Authentication:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/forgot-password

Products:
- GET /api/products
- GET /api/products/{id}
- POST /api/products
- PUT /api/products/{id}
- DELETE /api/products/{id}

Categories:
- GET /api/categories
- POST /api/categories
- PUT /api/categories/{id}
- DELETE /api/categories/{id}

Cart:
- GET /api/cart
- POST /api/cart/items
- PUT /api/cart/items/{id}
- DELETE /api/cart/items/{id}

Wishlist:
- GET /api/wishlist
- POST /api/wishlist
- DELETE /api/wishlist/{id}

Orders:
- POST /api/orders
- GET /api/orders
- GET /api/orders/{id}
- PUT /api/orders/{id}/status

Reviews:
- GET /api/products/{id}/reviews
- POST /api/products/{id}/reviews

Admin:
- GET /api/admin/dashboard
- GET /api/admin/customers
- GET /api/admin/orders
- GET /api/admin/reports

Add authentication and authorization where required.

---

## 9. SECURITY REQUIREMENTS

- Secure password hashing.
- JWT authentication.
- Role-based access control.
- Input validation.
- SQL injection protection through parameterized ORM queries.
- CORS configuration.
- Secure configuration management.
- Protect sensitive API endpoints.
- Validate product prices and stock on the server.
- Do not trust client-side order totals.
- Prevent unauthorized admin operations.
- Handle authentication token expiration.

---

## 10. PERFORMANCE AND CODE QUALITY

- Use reusable React components.
- Avoid duplicate code.
- Use lazy loading where appropriate.
- Optimize product images.
- Use pagination for large product lists.
- Avoid unnecessary API calls.
- Handle API loading and error states.
- Maintain consistent coding standards.
- Use meaningful variable and function names.
- Write maintainable code.
- Avoid deprecated libraries and APIs.

---

## 11. TESTING AND VALIDATION

Test the following end-to-end workflows:

1. Customer registration.
2. Customer login.
3. Product browsing.
4. Product searching.
5. Category filtering.
6. Product details.
7. Add to cart.
8. Update cart quantity.
9. Wishlist operations.
10. Checkout.
11. Order creation.
12. Order history.
13. Admin login.
14. Admin product management.
15. Admin category management.
16. Admin order management.
17. Stock updates.
18. Responsive mobile navigation.
19. Mobile checkout.
20. API error handling.

Ensure all existing features continue working after enhancements.

Fix all critical errors before considering the project complete.

---

## 12. DEVELOPMENT WORKFLOW – IMPORTANT

Before modifying the application:

STEP 1: Analyse the complete existing project.

STEP 2: Identify:
- Existing pages.
- Existing components.
- Current technologies.
- Existing functionality.
- Missing functionality.
- Broken functionality.
- UI/UX issues.
- Existing backend integrations.
- Existing database configuration.

STEP 3: Prepare a feature assessment report with three categories:
- Working.
- Partially Working.
- Not Implemented.

STEP 4: Prepare an implementation plan.

STEP 5: Improve the UI/UX design and mobile responsiveness.

STEP 6: Complete the frontend functionalities.

STEP 7: Implement ASP.NET Core Web API.

STEP 8: Configure PostgreSQL and Entity Framework Core.

STEP 9: Integrate frontend with backend APIs.

STEP 10: Implement authentication and authorization.

STEP 11: Test all workflows.

STEP 12: Fix issues and verify the complete application.

IMPORTANT RULES:

- Do not delete existing working features.
- Do not replace real API integrations with mock data.
- Do not leave buttons without functionality.
- Do not create pages that contain only static designs.
- Do not hardcode database-backed information in frontend components.
- Do not silently ignore errors.
- Do not modify unrelated files unnecessarily.
- Do not assume a feature is complete just because its UI exists.
- Maintain consistency throughout the application.

---

## 13. DOCUMENTATION

Maintain the following documentation:

- README.md
- CLAUDE.md
- PROJECT_ARCHITECTURE.md
- DATABASE_SCHEMA.md
- API_DOCUMENTATION.md
- SETUP_GUIDE.md

Include:
- Installation steps.
- Required software.
- Environment configuration.
- PostgreSQL database setup.
- EF Core migration commands.
- Backend startup instructions.
- Frontend startup instructions.
- Admin demo credentials.
- API testing instructions.

Never invent demo credentials. Create and document valid seed credentials during setup.

---

## 14. FINAL ACCEPTANCE CRITERIA

The project is complete only when:

1. React frontend runs successfully.
2. ASP.NET Core backend runs successfully.
3. PostgreSQL connection works.
4. Database migrations execute successfully.
5. Customer registration and login work.
6. Product data loads from the backend.
7. Shopping cart works correctly.
8. Wishlist works correctly.
9. Checkout creates valid orders.
10. Order management works.
11. Admin dashboard displays real data.
12. Product CRUD works.
13. Responsive mobile design works.
14. All important buttons and navigation links work.
15. No critical console errors.
16. No critical backend errors.
17. All major user journeys are tested.

FINAL GOAL:

Transform the existing Happy Toys prototype into a complete, professional, modern, mobile-responsive, full-stack E-commerce application using:

Frontend: React JS
Backend: ASP.NET Core Web API
Database: PostgreSQL

Build it as a real business-ready demonstration application with an attractive UI, reliable functionality, clean architecture, and maintainable code.

Start by analysing the existing project. Do not start coding before completing the initial assessment.

Work incrementally, explain important changes in simple English, and provide a summary of completed and remaining features after each development phase.
---

## 15. CHANGE LOG (keep updated after every change)

### 2026-11-01 – Step 6: Admin panel completed

Admin login: `/admin/login` (admins only; a customer account is signed out and told it is not an administrator). Seed admin credentials are listed in SETUP_GUIDE.md. Admin pages redirect here when not signed in.

Daily and monthly "purchase" means customer orders (cancelled orders excluded, Indian time). No supplier-purchase tables were added.

New or changed API endpoints (all admin-only, all saved in PostgreSQL):

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/admin/reports/monthly?months=12 | Orders, units and total amount per month |
| GET | /api/admin/customers | Customers with order count and total spent |
| POST / PUT / DELETE | /api/admin/coupons[/{id}] | Add, edit, delete coupons (code unique, percentage max 100) |
| POST / PUT / DELETE | /api/categories[/{id}] | Add, rename, delete categories (id is a slug of the name; delete refused while products use it) |

`CouponDto` now includes `id`. Existing: dashboard, orders, products, daily report, offers, product create/edit/delete/stock, order status.

Admin screens: Dashboard, Products (add/edit/delete), Categories (add/edit/delete), Stock, Orders and order details (status update), Customers, Daily Sales, Monthly Sales, Offers (coupon add/edit/delete).

Files: backend `AdminService`, `CategoryService`, `AdminController`, `CategoriesController`, DTOs; frontend `pages/admin/*`, `AdminLayout`, `RequireAdmin`, `adminService.ts`, `schemas.ts`. Tests: `AdminManagementTests.cs`.

Status: frontend type-checks and builds; backend compiles. The new backend tests are written but NOT yet run (they need `HAPPYTOYS_TEST_DB`).

Still not done: product image upload (admin enters an image address), customer reviews and moderation, admin password reset, charts (tables and bars only), customer-side use of coupons at checkout, deployment to Vercel (needs `vercel login` and a Neon database).

### 2026-11-01 – Admin login page and dashboard charts

- `/admin/login` is now a standalone page (no store navbar or footer) and shows no credentials.
- Dashboard now has charts (plain SVG/CSS, no chart library): monthly sales, revenue trend (7 days), orders by status, top-selling products. All figures come from the database. `GET /api/admin/dashboard` now also returns `orderStatusCounts`.
- Demo data: with `Seed:SampleOrders=true` (set in `appsettings.Development.json` only) the seeder adds 8 sample customers and about 70 orders over 6 months, once, only when the orders table is empty. Sample customers use the `Seed:CustomerPassword`.
- Not run yet: backend tests, and the seeder against a live database.

### 2026-11-09 – Mobile usability pass (frontend only)

No API or database changes. Checked by type-check and build only; NOT yet tried on a real phone or emulator.

- Inputs, selects and text areas are 16px below 640px so iPhones do not zoom on focus (`index.css`). Page no longer scrolls sideways.
- Product details: Add to Cart and Buy Now are a sticky bar at the bottom on mobile, inline on desktop.
- Mobile menu scrolls when the category list is long. Filter drawer locks page scroll while open. "Sort by" label hidden on phones.
- Touch targets: quantity buttons and cart remove button are 40px on mobile.
- Page height uses `dvh`. Smaller headings and panel padding on phones for Checkout, Cart, Wishlist, Order confirmation, Login/Register and Admin. Long order numbers and emails wrap.
- Admin tables already scroll sideways inside their panel; unchanged.

Still to do: test every page at 320px, 375px, 768px and 1024px on a device or emulator.

### 2026-11-09 – Theme animations (frontend only)

No API or database changes. Checked by build only; not yet watched in a browser.

- Pages fade in on navigation (`Layout.tsx`). Home sections fade up on scroll via `components/ui/Reveal.tsx`.
- Hero background shifts slowly and its circles drift. Product cards lift with a soft glow on hover. Buttons lift on hover.
- Wishlist heart and navbar count badges pop when they change. Mobile menu slides down.
- New keyframes (`pop`, `drift`, `gradient-shift`, `drop-in`) are in `index.css`. All motion is switched off for visitors who set "reduce motion" on their device.
