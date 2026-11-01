import { ArrowRight, Sparkles, Star } from "lucide-react";
import Button from "@/components/ui/Button";

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-blue-600 to-indigo-700">
      {/* Decorative shapes */}
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
      <div className="absolute -bottom-24 right-1/3 h-64 w-64 rounded-full bg-secondary/20" />

      <div className="container-page relative grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
        <div className="animate-slide-up text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur">
            <Sparkles className="h-4 w-4 text-secondary" /> Festive Sale - up to 37% off
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Toys that spark <span className="text-secondary">joy</span> and{" "}
            <span className="text-accent-light">imagination</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-blue-100">
            Discover fun, thoughtfully chosen toys for every age - from first rattles to STEM robot
            kits. Delivered to your doorstep across India.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/products" variant="accent" size="lg">
              Shop Now <ArrowRight className="h-5 w-5" />
            </Button>
            <Button href="/products?sort=newest" variant="light" size="lg">
              New Arrivals
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-8">
            {[
              ["24", "Toys to explore"],
              ["8", "Categories"],
              ["4.5", "Avg. rating"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="text-2xl font-extrabold">{value}</p>
                <p className="text-sm text-blue-200">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Product collage */}
        <div className="relative mx-auto hidden h-[440px] w-full max-w-lg sm:block">
          <HeroImage src="/images/products/p10.svg" alt="Teddy bear" className="left-0 top-6 h-60 w-60 rotate-[-6deg]" />
          <HeroImage src="/images/products/p7.svg" alt="RC car" className="right-0 top-0 h-52 w-52 rotate-[5deg] [animation-delay:1s]" />
          <HeroImage src="/images/products/p13.svg" alt="Building bricks" className="bottom-0 left-1/2 h-56 w-56 -translate-x-1/3 rotate-[3deg] [animation-delay:2s]" />
          <div className="absolute bottom-10 left-0 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-light">
              <Star className="h-5 w-5 fill-secondary text-secondary" />
            </span>
            <div>
              <p className="text-sm font-bold text-navy">Rated 4.5/5</p>
              <p className="text-xs text-muted">across our demo catalog</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroImage({ src, alt, className }: { src: string; alt: string; className: string }) {
  return (
    <div className={`absolute animate-float overflow-hidden rounded-3xl border-4 border-white shadow-2xl ${className}`}>
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}
