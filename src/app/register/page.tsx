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

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type RegisterErrors = Partial<Record<keyof RegisterForm | "form", string>>;

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState<RegisterForm>({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const newErrors: RegisterErrors = {};
    if (form.name.trim().length < 2) newErrors.name = "Please enter your name.";
    if (!validators.email(form.email)) newErrors.email = "Please enter a valid email address.";
    if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters.";
    if (form.confirmPassword !== form.password) newErrors.confirmPassword = "Passwords do not match.";
    if (!agreed) newErrors.form = "Please accept the terms to continue.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    const result = await register(form.name, form.email, form.password);
    setLoading(false);
    if (!result.ok) {
      setErrors({ form: result.error });
      return;
    }
    showToast(`Welcome to Happy Toys, ${form.name.split(" ")[0]}!`, "success");
    router.push("/");
  };

  return (
    <AuthCard title="Create your account" subtitle="It only takes a minute to join the Happy Toys family.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {errors.form && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{errors.form}</p>
        )}
        <FormField label="Full name" name="name" value={form.name} onChange={update("name")} placeholder="e.g. Priya Sharma" autoComplete="name" error={errors.name} />
        <FormField label="Email address" name="email" type="email" value={form.email} onChange={update("email")} placeholder="you@example.com" autoComplete="email" error={errors.email} />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Password" name="password" type="password" value={form.password} onChange={update("password")} placeholder="Min. 6 characters" autoComplete="new-password" error={errors.password} />
          <FormField label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={update("confirmPassword")} placeholder="Re-enter password" autoComplete="new-password" error={errors.confirmPassword} />
        </div>
        <label className="flex items-start gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-primary"
          />
          I agree to the Terms of Service and Privacy Policy (demo).
        </label>
        <Button type="submit" size="lg" fullWidth isLoading={loading}>
          Create Account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
