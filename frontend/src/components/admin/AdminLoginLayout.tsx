import { Outlet } from "react-router-dom";
import Providers from "@/context/Providers";

/** A bare page for admin sign-in: no store navbar, footer or links. */
export default function AdminLoginLayout() {
  return (
    <Providers>
      <main className="flex min-h-screen items-center justify-center bg-primary-light px-4 py-10 font-sans">
        <Outlet />
      </main>
    </Providers>
  );
}
