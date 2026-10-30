"use client";

import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { validators } from "@/lib/utils";
import Button from "@/components/ui/Button";

export default function Newsletter() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validators.email(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600)); // demo delay
    setSubmitting(false);
    setEmail("");
    showToast("Thanks for subscribing! (demo - no email is sent)", "success");
  };

  return (
    <section className="container-page pt-16">
      <div className="relative overflow-hidden rounded-3xl bg-navy px-6 py-12 text-center sm:px-12">
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-primary/40" />
        <div className="absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-accent/30" />
        <div className="relative mx-auto max-w-xl">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
            <Mail className="h-7 w-7 text-navy" />
          </span>
          <h2 className="mt-5 text-3xl font-extrabold text-white">Join the Happy Toys Club</h2>
          <p className="mt-2 text-slate-300">
            Get new arrivals, parenting tips and an extra 10% off your first order.
          </p>
          <form onSubmit={handleSubmit} noValidate className="mt-7 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 rounded-full border-0 px-5 py-3.5 text-navy outline-none ring-primary focus:ring-4"
              aria-label="Email address"
            />
            <Button type="submit" variant="accent" size="lg" isLoading={submitting}>
              Subscribe
            </Button>
          </form>
          {error && <p className="mt-3 text-sm font-medium text-red-300">{error}</p>}
        </div>
      </div>
    </section>
  );
}
