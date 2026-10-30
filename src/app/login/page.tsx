"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { validators } from "@/lib/utils";
import AuthCard from "@/components/layout/AuthCard";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const newErrors: typeof errors = {};
    if (!validators.email(email)) newErrors.email = "Please enter a valid email address.";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.ok) {
      setErrors({ form: result.error });
      return;
    }
    showToast("Welcome back! You are now logged in.", "success");
    router.push("/");
  };

  return (
    <AuthCard title="Welcome back" subtitle="Log in to continue shopping for happy moments.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {errors.form && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{errors.form}</p>
        )}
        <FormField
          label="Email address"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          autoComplete="current-password"
          error={errors.password}
        />
        <Button type="submit" size="lg" fullWidth isLoading={loading}>
          Log In
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New to Happy Toys?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthCard>
  );
}
