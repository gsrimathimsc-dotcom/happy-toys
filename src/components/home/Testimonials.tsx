import { Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import StarRating from "@/components/ui/StarRating";
import SectionHeading from "@/components/ui/SectionHeading";

export default function Testimonials() {
  return (
    <section className="container-page pt-16">
      <SectionHeading title="What Parents Say" subtitle="Loved by families across India" />
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.id}
            className="relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-lg"
          >
            <Quote className="absolute right-5 top-5 h-8 w-8 text-primary-light" />
            <StarRating rating={t.rating} />
            <blockquote className="mt-4 leading-relaxed text-slate-600">&ldquo;{t.comment}&rdquo;</blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-white">
                {t.name.charAt(0)}
              </span>
              <span>
                <span className="block font-semibold text-navy">{t.name}</span>
                <span className="block text-xs text-muted">{t.city}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
