import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { loginSchema, type LoginValues } from "@/validation/schemas";
import AuthCard from "@/components/layout/AuthCard";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";

export default function LoginPage() {
  useDocumentTitle("Log In");
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const submit = async ({ email, password }: LoginValues) => {
    setFormError("");
    try {
      await login(email, password);
      showToast("Welcome back! You are now logged in.", "success");
      navigate("/");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not log in.");
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Log in to continue shopping for happy moments.">
      <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
        {formError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</p>
        )}
        <FormField
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <FormField
          label="Password"
          type="password"
          placeholder="At least 6 characters"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          Log In
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New to Happy Toys?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
