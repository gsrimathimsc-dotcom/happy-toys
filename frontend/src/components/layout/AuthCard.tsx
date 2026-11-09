import type { ReactNode } from "react";
import { Gift, ShieldCheck, Truck } from "lucide-react";
import Logo from "./Logo";

/** Two-column card shared by the Login and Register pages. */
export default function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="container-page py-6 sm:py-12">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-100 lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-indigo-700 p-10 text-white lg:flex">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-secondary/20" />
          <div className="relative">
            <Logo light />
            <h2 className="mt-10 text-3xl font-extrabold leading-tight">
              Every day is a <span className="text-secondary">play day</span>
            </h2>
            <p className="mt-3 text-blue-100">Save your favourites and check out faster with a Happy Toys demo account.</p>
          </div>
          <ul className="relative space-y-4">
            {[
              { icon: Gift, text: "Exclusive member-only offers" },
              { icon: Truck, text: "Track orders in one place" },
              { icon: ShieldCheck, text: "Safe & secure (demo) checkout" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  <Icon className="h-5 w-5 text-secondary" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Form panel */}
        <div className="p-5 sm:p-10">
          <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">{title}</h1>
          <p className="mt-1.5 text-muted">{subtitle}</p>
          <div className="mt-6 sm:mt-8">{children}</div>
          <p className="mt-6 rounded-xl bg-secondary-light px-4 py-3 text-xs text-navy">
            <strong>Demo store:</strong> please don&apos;t use a password you use anywhere else.
          </p>
        </div>
      </div>
    </div>
  );
}
