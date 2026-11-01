# CLAUDE.md
# HAPPY TOYS – E-COMMERCE APPLICATION

## 1. PROJECT OVERVIEW

You are working as a Senior Full-Stack Developer, Software Architect, UI/UX Designer, and Code Reviewer.

Your task is to improve and complete an existing Toy Store E-commerce application named **Happy Toys**.

The objective is to transform the existing prototype into a professional, modern, fully functional, responsive e-commerce application.

IMPORTANT:
- First analyze the existing project.
- Understand the current implementation.
- Identify incomplete features, missing functionality, UI issues, and bugs.
- Improve the existing application instead of unnecessarily recreating everything.
- Preserve useful existing code and functionality.
- Complete all existing features.
- Add missing features wherever required.
- Maintain clean architecture and reusable components.

## 2. TECHNOLOGY STACK

Use the following technology stack:

### Frontend
- React.js
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- Lucide React Icons
- Axios for API communication
- React Context API for state management
- React Hook Form for form handling
- Zod for validation

### Backend
- ASP.NET Core Web API
- C#
- Entity Framework Core
- RESTful API architecture
- Dependency Injection
- DTOs and validation
- Swagger / OpenAPI

### Database
For the current demo version:
- Use static JSON data or in-memory data.
- Do not introduce a database without explicit approval.
- Keep the backend architecture ready for future PostgreSQL integration.

### Development Tools
- Visual Studio Code
- Visual Studio
- Git and GitHub
- Swagger UI
- Postman

IMPORTANT:
The existing Next.js frontend/backend prototype must be migrated to React.js frontend and ASP.NET Core backend. Do not retain Next.js as the application framework.

## 3. UI/UX DESIGN – PREMIUM E-COMMERCE THEME

Completely enhance the existing Happy Toys visual design.

The application should look like a premium commercial e-commerce website, not a basic college project.

### Brand Identity

Brand Name: HAPPY TOYS

Brand Personality:
- Fun
- Trustworthy
- Modern
- Attractive
- Family-friendly
- Professional

### Color Palette

Use a consistent, attractive business color palette.

Primary Color:
- Deep Royal Blue: #3155D9

Secondary Color:
- Vibrant Orange: #FF8A3D

Accent Color:
- Sunshine Yellow: #FFD166

Supporting Colors:
- Soft Lavender: #EEE9FF
- Mint Green: #DDF5E8
- Light Background: #F8F9FD
- Dark Text: #202B45
- Secondary Text: #697386
- White: #FFFFFF

Use colors consistently across buttons, navigation, cards, badges, banners, and other UI elements.

Avoid excessive bright colors. Maintain a balanced and premium appearance.

### Typography

Use modern, readable fonts:
- Primary font: Poppins
- Secondary font: Inter

Typography requirements:
- Clear heading hierarchy.
- Readable body text.
- Consistent font weights.
- Attractive product titles.
- Proper spacing and line height.

### Design Requirements

- Modern and premium UI.
- Attractive hero banners.
- Beautiful product cards.
- Professional navigation bar.
- Smooth hover effects.
- Subtle animations.
- Consistent border radius.
- Soft shadows.
- Attractive buttons.
- High-quality product images.
- Proper whitespace.
- Responsive layouts.
- Consistent design system.

Use reusable design components instead of writing styles independently for every page.

## 4. RESPONSIVE DESIGN – MOBILE FIRST

Mobile responsiveness is a mandatory requirement.

Design and optimize the application for:

- Mobile phones: 320px–480px
- Large mobile phones: 481px–767px
- Tablets: 768px–1023px
- Laptops: 1024px–1440px
- Large desktops: 1441px and above

### Mobile UI Requirements

1. Responsive navigation with hamburger menu.
2. Mobile-friendly search bar.
3. Product grid:
   - 2 columns on mobile where appropriate.
   - 3 columns on tablets.
   - 4 or more columns on desktops depending on available space.
4. Responsive product images.
5. Touch-friendly buttons.
6. Proper spacing between interactive elements.
7. Mobile-friendly filters using drawer or bottom sheet.
8. Responsive shopping cart.
9. Mobile-friendly checkout forms.
10. No horizontal scrolling.
11. Responsive banners.
12. Sticky mobile shopping/cart controls where appropriate.

Test the application at multiple screen sizes.

Do not simply shrink the desktop layout. Design a proper mobile experience.

## 5. COMPLETE E-COMMERCE FUNCTIONALITIES

Analyze the existing application and implement or complete the following features.

### A. HOME PAGE

- Attractive hero banner.
- Promotional offers.
- Shop by category.
- Featured products.
- Best-selling products.
- New arrivals.
- Trending toys.
- Discount products.
- Customer testimonials.
- Newsletter subscription.
- Promotional banners.
- Footer with useful links.

### B. PRODUCT CATALOG

- Display all products.
- Product category filtering.
- Search by product name.
- Search by keyword.
- Filter by price range.
- Filter by ratings.
- Sort by price low to high.
- Sort by price high to low.
- Sort by popularity.
- Sort by newest arrivals.
- Pagination or load more.
- Product availability status.

### C. PRODUCT DETAILS

- Multiple product images where available.
- Product name.
- Product description.
- Price.
- Original price.
- Discount percentage.
- Star ratings.
- Customer reviews.
- Stock availability.
- Quantity selector.
- Add to Cart.
- Buy Now.
- Add to Wishlist.
- Related products.
- Recently viewed products.

### D. SHOPPING CART

- Add products to cart.
- Remove products.
- Increase/decrease quantity.
- Validate available quantity.
- Calculate subtotal.
- Calculate discount.
- Calculate delivery charges.
- Calculate final amount.
- Apply coupon codes.
- Empty cart screen.
- Continue shopping.
- Proceed to checkout.

Cart data should persist across page refreshes using localStorage for the demo version.

### E. WISHLIST

- Add products to wishlist.
- Remove products.
- View wishlist.
- Move wishlist items to cart.
- Persist wishlist using localStorage.

### F. USER AUTHENTICATION

For demo purposes, implement basic mock authentication.

- Registration.
- Login.
- Logout.
- Form validation.
- Password visibility toggle.
- User profile.
- Edit profile.
- Demo user session.
- Protected routes.

Clearly indicate that demo authentication is not production-grade security.

### G. CHECKOUT

Create a professional multi-step checkout experience.

Step 1: Customer Information
- Name.
- Email.
- Mobile number.

Step 2: Delivery Address
- Address.
- City.
- State.
- PIN code.

Step 3: Order Summary
- Products.
- Quantity.
- Subtotal.
- Discount.
- Delivery charges.
- Final total.

Step 4: Payment
- Cash on Delivery (demo).
- UPI (simulation only).
- Card payment (simulation only).

Do not integrate real payment gateways.

### H. ORDER MANAGEMENT

- Place demo order.
- Generate unique order number.
- Order confirmation page.
- View order history.
- View order details.
- Order status.
- Cancel order where permitted.
- Download printable order summary.

### I. CUSTOMER REVIEWS

- Display product ratings.
- Display customer reviews.
- Submit demo reviews.
- Rating summary.
- Validate review forms.

### J. ADMIN DASHBOARD

Create a simple admin dashboard for demonstration.

Dashboard features:
- Total products.
- Total orders.
- Total customers.
- Total sales (based on demo data).
- Recent orders.
- Best-selling products.
- Sales overview chart.

Admin product management:
- View products.
- Add product.
- Edit product.
- Delete product.
- Manage categories.
- Update stock.

Admin order management:
- View orders.
- View order details.
- Update order status.

Use mock authentication and clearly identify this as a demonstration admin panel.

## 6. BACKEND – ASP.NET CORE WEB API

Develop a clean and maintainable ASP.NET Core Web API.

Suggested structure:

HappyToys.API
|
|-- Controllers
|   |-- ProductsController.cs
|   |-- CategoriesController.cs
|   |-- CartController.cs
|   |-- OrdersController.cs
|   |-- UsersController.cs
|   |-- WishlistController.cs
|   |-- AdminController.cs
|
|-- DTOs
|-- Models
|-- Services
|-- Interfaces
|-- Repositories
|-- Data
|-- Middleware
|-- Validators
|-- Program.cs
|-- appsettings.json

Use suitable architectural patterns without unnecessary complexity.

### API Endpoints

Products:
- GET /api/products
- GET /api/products/{id}
- GET /api/products/search
- GET /api/products/category/{categoryId}
- POST /api/products
- PUT /api/products/{id}
- DELETE /api/products/{id}

Categories:
- GET /api/categories
- GET /api/categories/{id}

Cart:
- GET /api/cart
- POST /api/cart/items
- PUT /api/cart/items/{id}
- DELETE /api/cart/items/{id}

Wishlist:
- GET /api/wishlist
- POST /api/wishlist
- DELETE /api/wishlist/{productId}

Orders:
- POST /api/orders
- GET /api/orders
- GET /api/orders/{id}
- PUT /api/orders/{id}/status

Users:
- POST /api/users/register
- POST /api/users/login
- GET /api/users/profile
- PUT /api/users/profile

Admin:
- GET /api/admin/dashboard
- GET /api/admin/orders
- GET /api/admin/products

Use appropriate HTTP status codes and error responses.

IMPORTANT:
All APIs must work with mock/in-memory data in the demo version. Do not add a database dependency unless explicitly approved.

## 7. SAMPLE DATA

Create at least 30 realistic toy products.

Categories:
- Educational Toys
- Baby Toys
- Remote Control Toys
- Soft Toys
- Building Blocks
- Outdoor Toys
- Board Games
- Action Figures

Each product should contain:

- Id
- Name
- CategoryId
- Description
- Price
- OriginalPrice
- DiscountPercentage
- Rating
- ReviewCount
- ImageUrl
- StockQuantity
- IsActive
- CreatedDate

Use Indian Rupees (₹) throughout the application.

Use appropriate, high-quality toy images.

## 8. CODE QUALITY AND ARCHITECTURE

Follow these coding standards:

- TypeScript strict mode.
- Reusable React components.
- Functional components and hooks.
- Separation of concerns.
- Proper API service layer.
- Centralized error handling.
- Consistent naming conventions.
- Proper DTO usage in backend.
- Dependency injection.
- Async/await.
- Input validation.
- Clean and readable code.
- Avoid duplicate code.
- Avoid unnecessary dependencies.
- No unused variables or imports.
- No console errors.
- No broken navigation.
- No placeholder buttons that do nothing.

## 9. TESTING AND QUALITY ASSURANCE

Test all major application flows.

Frontend:
- Page navigation.
- Product search.
- Filtering and sorting.
- Add to cart.
- Cart quantity updates.
- Wishlist.
- Checkout validation.
- Login and logout.
- Responsive layouts.

Backend:
- API endpoint functionality.
- Request validation.
- Error handling.
- Product retrieval.
- Order creation.
- Cart operations.
- Admin operations.

Check:
- No TypeScript errors.
- No C# compilation errors.
- No broken API calls.
- No broken images.
- No horizontal scrolling on mobile.
- No non-functional buttons.
- No missing pages.

Run the frontend and backend builds and fix all identified errors.

## 10. DEVELOPMENT AND EXECUTION

Provide clear instructions for:

Frontend:
- Node.js installation.
- npm installation.
- Dependency installation.
- React application startup.
- Environment configuration.

Backend:
- .NET SDK installation.
- ASP.NET Core project setup.
- NuGet package installation.
- Backend startup.
- Swagger access.

Explain how to run frontend and backend simultaneously.

## 11. IMPLEMENTATION APPROACH

Follow this sequence.

PHASE 1 – EXISTING PROJECT ANALYSIS
- Inspect all existing files.
- Identify the current architecture.
- Identify existing functionalities.
- Identify incomplete features.
- Identify bugs and design issues.
- Prepare a list of improvements.

PHASE 2 – TECHNOLOGY MIGRATION
- Migrate Next.js frontend to React.js with Vite.
- Develop ASP.NET Core Web API.
- Preserve existing useful business logic.
- Configure frontend/backend communication.

PHASE 3 – UI/UX REDESIGN
- Establish the Happy Toys design system.
- Improve colors, fonts, typography, and layout.
- Redesign all pages.
- Implement mobile-first responsive design.

PHASE 4 – FUNCTIONALITY COMPLETION
- Complete existing features.
- Implement missing e-commerce features.
- Connect React components to backend APIs.
- Add mock data and state persistence.

PHASE 5 – TESTING
- Test all features.
- Test mobile responsiveness.
- Fix bugs.
- Run production builds.

PHASE 6 – DOCUMENTATION
- Update README.md.
- Document the architecture.
- Document API endpoints.
- Provide installation instructions.
- Explain how to run the application.

## 12. IMPORTANT RULES FOR CLAUDE

1. Never assume an existing feature is complete without checking its implementation.
2. Never remove an existing working feature without a valid reason.
3. Do not recreate the entire project unnecessarily.
4. Do not introduce a database in this demo version.
5. Do not use Next.js as the final frontend or backend framework.
6. Use React.js for frontend and ASP.NET Core for backend.
7. Always maintain mobile responsiveness.
8. Every button and link must perform its intended action.
9. Never leave unfinished TODO implementations in completed features.
10. Do not break existing working functionality while adding new features.
11. Before changing major architecture, explain the proposed changes.
12. Work phase by phase and verify each phase before moving forward.
13. Do not claim that a feature is completed unless it has been implemented and tested.
14. If any requirement is unclear, ask before making major assumptions.
15. Keep the code beginner-friendly and explain important implementation decisions.

## FINAL EXPECTATION

Deliver a polished, fully functional, responsive Happy Toys E-commerce application using:

FRONTEND: React.js + TypeScript + Vite

BACKEND: ASP.NET Core Web API + C#

DATA: Mock/In-memory data (No database)

DESIGN: Premium, colorful, modern, business-oriented and mobile-first.

The final application must be suitable for a professional client demonstration and future database integration.

Start with PHASE 1: Analyze the existing project. Do not immediately start rewriting files. First understand the current application and prepare an implementation plan.