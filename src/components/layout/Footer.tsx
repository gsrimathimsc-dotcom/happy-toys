import Link from "next/link";
import { Mail, MapPin, Phone, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import categories from "@/data/categories.json";
import Logo from "./Logo";

const SHOP_LINKS = [
  { label: "All Toys", href: "/products" },
  { label: "New Arrivals", href: "/products?sort=newest" },
  { label: "Best Sellers", href: "/products?sort=popularity" },
  { label: "Budget Picks (under ₹500)", href: "/products?maxPrice=500&sort=price-asc" },
];

const ACCOUNT_LINKS = [
  { label: "Login", href: "/login" },
  { label: "Create Account", href: "/register" },
  { label: "My Cart", href: "/cart" },
  { label: "My Wishlist", href: "/wishlist" },
];

export default function Footer() {
  return (
    <footer className="mt-20 bg-navy text-slate-300">
      {/* Trust badges */}
      <div className="border-b border-white/10">
        <div className="container-page grid gap-6 py-8 sm:grid-cols-3">
          {[
            { icon: Truck, title: "Fast Delivery", text: "Across India in 2-5 days" },
            { icon: ShieldCheck, title: "Thoughtfully Chosen", text: "Age-appropriate picks for every child" },
            { icon: RotateCcw, title: "Easy Returns", text: "7-day hassle-free returns" },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <Icon className="h-6 w-6 text-secondary" />
              </span>
              <div>
                <p className="font-semibold text-white">{title}</p>
                <p className="text-sm">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed">
            Happy Toys brings safe, fun and educational toys for every age - handpicked for curious
            minds and happy hearts.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-secondary" /> Chennai, Tamil Nadu, India
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-secondary" /> +91 98765 43210 (demo)
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-secondary" /> hello@happytoys.example
            </li>
          </ul>
        </div>

        <FooterColumn title="Shop" links={SHOP_LINKS} />
        <FooterColumn
          title="Categories"
          links={categories.map((c) => ({ label: c.name, href: `/products?category=${c.slug}` }))}
        />
        <FooterColumn title="My Account" links={ACCOUNT_LINKS} />
      </div>

      <div className="border-t border-white/10">
        <p className="container-page py-5 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Happy Toys. Demo prototype for portfolio purposes - no real
          orders or payments are processed.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 font-semibold text-white">{title}</h3>
      <ul className="space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition hover:text-secondary">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
