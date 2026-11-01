import { Gift, Percent } from "lucide-react";
import Button from "@/components/ui/Button";

export default function OfferBanner() {
  return (
    <section className="container-page pt-16">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent to-orange-400 p-8 text-white">
          <Percent className="absolute -right-6 -top-6 h-40 w-40 text-white/15" />
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-100">Limited time</p>
          <h3 className="mt-2 text-3xl font-extrabold">Up to 36% off</h3>
          <p className="mt-2 max-w-xs text-orange-50">On remote control cars, drones and off-road racers.</p>
          <Button href="/products?category=remote-control-toys" variant="light" className="mt-6">
            Shop RC Toys
          </Button>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary to-yellow-300 p-8 text-navy">
          <Gift className="absolute -right-6 -top-6 h-40 w-40 text-navy/10" />
          <p className="text-sm font-semibold uppercase tracking-wider text-navy/70">Gifting made easy</p>
          <h3 className="mt-2 text-3xl font-extrabold">Toys under ₹500</h3>
          <p className="mt-2 max-w-xs text-navy/80">Perfect return gifts for birthday parties.</p>
          <Button href="/products?maxPrice=500&sort=price-asc" className="mt-6">
            Explore Budget Picks
          </Button>
        </div>
      </div>
    </section>
  );
}
