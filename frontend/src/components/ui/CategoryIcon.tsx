import { Baby, Bike, Bot, Boxes, Car, Dices, GraduationCap, PawPrint, Shapes } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Icon + color for each category (kept here so Tailwind can see the class names).
const CATEGORY_STYLES: Record<string, { icon: LucideIcon; color: string }> = {
  "educational-toys": { icon: GraduationCap, color: "bg-blue-50 text-blue-600" },
  "baby-toys": { icon: Baby, color: "bg-pink-50 text-pink-600" },
  "remote-control-toys": { icon: Car, color: "bg-orange-50 text-orange-600" },
  "soft-toys": { icon: PawPrint, color: "bg-rose-50 text-rose-600" },
  "building-blocks": { icon: Boxes, color: "bg-yellow-50 text-yellow-600" },
  "outdoor-toys": { icon: Bike, color: "bg-green-50 text-green-600" },
  "board-games": { icon: Dices, color: "bg-purple-50 text-purple-600" },
  "action-figures": { icon: Bot, color: "bg-cyan-50 text-cyan-600" },
};

export function getCategoryColor(slug: string): string {
  return CATEGORY_STYLES[slug]?.color ?? "bg-slate-100 text-slate-600";
}

export default function CategoryIcon({ slug, className }: { slug: string; className?: string }) {
  const Icon = CATEGORY_STYLES[slug]?.icon ?? Shapes;
  return <Icon className={className} />;
}
