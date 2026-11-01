import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Mail } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { newsletterSchema, type NewsletterValues } from "@/validation/schemas";
import Button from "@/components/ui/Button";

export default function Newsletter() {
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const subscribe = async () => {
    await new Promise((resolve) => setTimeout(resolve, 600)); // demo delay
    reset();
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
            Get new arrivals, parenting tips and early access to our offers.
          </p>
          <form onSubmit={handleSubmit(subscribe)} noValidate className="mt-7 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              {...register("email")}
              placeholder="Enter your email address"
              className="flex-1 rounded-full border-0 px-5 py-3.5 text-navy outline-none ring-primary focus:ring-4"
              aria-label="Email address"
            />
            <Button type="submit" variant="accent" size="lg" isLoading={isSubmitting}>
              Subscribe
            </Button>
          </form>
          {errors.email && <p className="mt-3 text-sm font-medium text-red-300">{errors.email.message}</p>}
        </div>
      </div>
    </section>
  );
}
