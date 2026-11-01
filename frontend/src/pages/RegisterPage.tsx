import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { registerSchema, type RegisterValues } from "@/validation/schemas";
import AuthCard from "@/components/layout/AuthCard";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";

export default function RegisterPage() {
  useDocumentTitle("Create Account");
  const navigate = useNavigate();
  const { register: createAccount } = useAuth();
  const { showToast } = useToast();
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", agreed: false },
  });

  const submit = async ({ name, email, password }: RegisterValues) => {
    setFormError("");
    try {
      await createAccount(name, email, password);
      showToast(`Welcome to Happy Toys, ${name.split(" ")[0]}!`, "success");
      navigate("/");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not create your account.");
    }
  };

  return (
    <AuthCard title="Create your account" subtitle="It only takes a minute to join the Happy Toys family.">
      <form onSubmit={handleSubmit(submit)} noValidate className="space-y-5">
        {formError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{formError}</p>
        )}
        <FormField label="Full name" placeholder="e.g. Priya Sharma" autoComplete="name" error={errors.name?.message} {...register("name")} />
        <FormField label="Email address" type="email" placeholder="you@example.com" autoComplete="email" error={errors.email?.message} {...register("email")} />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Password" type="password" placeholder="Min. 6 characters" autoComplete="new-password" error={errors.password?.message} {...register("password")} />
          <FormField label="Confirm password" type="password" placeholder="Re-enter password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        </div>
        <div>
          <label className="flex items-start gap-2 text-sm text-muted">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-primary" {...register("agreed")} />
            I agree to the Terms of Service and Privacy Policy (demo).
          </label>
          {errors.agreed && <p className="mt-1 text-xs font-medium text-red-600">{errors.agreed.message}</p>}
        </div>
        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          Create Account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthCard>
  );
}
