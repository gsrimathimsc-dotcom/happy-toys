import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

/** Lets only admins through. The API checks this again on every request. */
export default function RequireAdmin() {
  const { user, isReady } = useAuth();
  const location = useLocation();

  if (!isReady) return <Spinner label="Checking your account..." />;
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;

  if (user.role !== "admin") {
    return (
      <div className="container-page flex flex-col items-center py-24 text-center">
        <ShieldAlert className="h-14 w-14 text-red-500" />
        <h1 className="mt-5 text-3xl font-extrabold text-navy">Admins only</h1>
        <p className="mt-2 max-w-md text-muted">This area is for store administrators.</p>
        <Button href="/" className="mt-6">
          Go to Home
        </Button>
      </div>
    );
  }

  return <Outlet />;
}
