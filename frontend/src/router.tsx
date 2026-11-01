import { createBrowserRouter } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminLoginLayout from "@/components/admin/AdminLoginLayout";
import RequireAdmin from "@/components/admin/RequireAdmin";
import Layout from "@/components/layout/Layout";
import AdminCategoriesPage from "@/pages/admin/AdminCategoriesPage";
import AdminCustomersPage from "@/pages/admin/AdminCustomersPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminMonthlySalesPage from "@/pages/admin/AdminMonthlySalesPage";
import AdminDailySalesPage from "@/pages/admin/AdminDailySalesPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminOffersPage from "@/pages/admin/AdminOffersPage";
import AdminOrderDetailsPage from "@/pages/admin/AdminOrderDetailsPage";
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage";
import AdminProductFormPage from "@/pages/admin/AdminProductFormPage";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AdminStockPage from "@/pages/admin/AdminStockPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import ErrorPage from "@/pages/ErrorPage";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import NotFoundPage from "@/pages/NotFoundPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import ProductDetailsPage from "@/pages/ProductDetailsPage";
import ProductsPage from "@/pages/ProductsPage";
import RegisterPage from "@/pages/RegisterPage";
import WishlistPage from "@/pages/WishlistPage";

/** Every page of the store. Each one shows inside the shared Layout. */
export const router = createBrowserRouter([
  {
    element: <AdminLoginLayout />,
    errorElement: <ErrorPage />,
    children: [{ path: "/admin/login", element: <AdminLoginPage /> }],
  },
  {
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/products", element: <ProductsPage /> },
      { path: "/products/:id", element: <ProductDetailsPage /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/order-confirmation/:orderId", element: <OrderConfirmationPage /> },
      { path: "/wishlist", element: <WishlistPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      {
        element: <RequireAdmin />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboardPage /> },
              { path: "products", element: <AdminProductsPage /> },
              { path: "products/new", element: <AdminProductFormPage /> },
              { path: "products/:id/edit", element: <AdminProductFormPage /> },
              { path: "categories", element: <AdminCategoriesPage /> },
              { path: "customers", element: <AdminCustomersPage /> },
              { path: "monthly-sales", element: <AdminMonthlySalesPage /> },
              { path: "stock", element: <AdminStockPage /> },
              { path: "orders", element: <AdminOrdersPage /> },
              { path: "orders/:id", element: <AdminOrderDetailsPage /> },
              { path: "daily-sales", element: <AdminDailySalesPage /> },
              { path: "offers", element: <AdminOffersPage /> },
            ],
          },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
