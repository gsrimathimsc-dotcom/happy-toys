import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import HomeLink from "@/components/ui/HomeLink";
import FormField from "@/components/ui/FormField";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { loginSchema, type LoginValues } from "@/validation/schemas";

/** Sign-in for store administrators. Customers use the normal Log In page. */
export default function AdminLoginPage() {
  useDocumentTitle("Admin Login");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, logout } = useAuth();
  const { showToast } = useToast();
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const cameFrom = (location.state as { from?: string } | null)?.from ?? "/admin";
  if (user?.role === "admin") return <Navigate to={cameFrom} replace />;

  const submit = async ({ email, password }: LoginValues) => {
    setFormError("");
    try {
      const signedIn = await login(email, password);
      if (signedIn.role !== "admin") {
        logout();
        setFormError("This account is not an administrator. Customers can log in from the Log In page.");
        return;
      }
      showToast("Welcome to the admin panel.", "success");
      navigate(cameFrom, { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not log in.");
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto mb-3 max-w-md">
        <HomeLink label="Back to store" />
      </div>
      <div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100 sm:p-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <p className="mt-4 text-sm font-semibold text-secondary">Happy Toys</p>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">Admin login</h1>
        <p className="mt-1.5 text-muted">Authorised staff only.</p>

        <form onSubmit={handleSubmit(submit)} noValidate className="mt-8 space-y-5">
          {formError && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {formError}
            </p>
          )}
          <FormField
            label="Admin email"
            type="email"
            autoComplete="username"
            error={errors.email?.message}
            {...register("email")}
          />
          <FormField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
            Log In to Admin
          </Button>
        </form>
      </div>
    </div>
  );
}
