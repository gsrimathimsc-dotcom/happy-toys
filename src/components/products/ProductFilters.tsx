"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";

export const PRICE_RANGES = [
  { label: "Under ₹500", min: undefined, max: 500 },
  { label: "₹500 - ₹1,000", min: 500, max: 1000 },
  { label: "₹1,000 - ₹2,000", min: 1000, max: 2000 },
  { label: "Above ₹2,000", min: 2000, max: undefined },
] as const;

export interface FilterValues {
  category: string;
  minPrice: string;
  maxPrice: string;
}

interface ProductFiltersProps {
  categories: Category[];
  values: FilterValues;
  onChange: (changes: Partial<FilterValues>) => void;
  onClear: () => void;
}

export default function ProductFilters({ categories, values, onChange, onClear }: ProductFiltersProps) {
  // Local state for the custom price inputs, applied on "Apply".
  const [min, setMin] = useState(values.minPrice);
  const [max, setMax] = useState(values.maxPrice);
  const [priceError, setPriceError] = useState("");

  useEffect(() => {
    setMin(values.minPrice);
    setMax(values.maxPrice);
  }, [values.minPrice, values.maxPrice]);

  const applyCustomPrice = () => {
    if (min && max && Number(min) > Number(max)) {
      setPriceError("Min price cannot be greater than max price.");
      return;
    }
    setPriceError("");
    onChange({ minPrice: min, maxPrice: max });
  };

  const isRangeActive = (range: (typeof PRICE_RANGES)[number]) =>
    values.minPrice === (range.min?.toString() ?? "") &&
    values.maxPrice === (range.max?.toString() ?? "");

  const optionClass = (active: boolean) =>
    cn(
      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
      active ? "bg-primary-light font-semibold text-primary" : "text-navy hover:bg-slate-50"
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-navy">Filters</h2>
        <button onClick={onClear} className="text-sm font-semibold text-accent hover:text-accent-dark">
          Clear all
        </button>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Category</h3>
        <ul className="space-y-1">
          <li>
            <button className={optionClass(!values.category)} onClick={() => onChange({ category: "" })}>
              All Categories
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button
                className={optionClass(values.category === c.slug)}
                onClick={() => onChange({ category: c.slug })}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Price</h3>
        <ul className="space-y-1">
          {PRICE_RANGES.map((range) => {
            const active = isRangeActive(range);
            return (
              <li key={range.label}>
                <button
                  className={optionClass(active)}
                  onClick={() =>
                    onChange(
                      active
                        ? { minPrice: "", maxPrice: "" }
                        : {
                            minPrice: range.min?.toString() ?? "",
                            maxPrice: range.max?.toString() ?? "",
                          }
                    )
                  }
                >
                  {range.label}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="Min ₹"
            className="input-field"
            aria-label="Minimum price"
          />
          <span className="text-muted">-</span>
          <input
            type="number"
            min={0}
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder="Max ₹"
            className="input-field"
            aria-label="Maximum price"
          />
        </div>
        <button
          onClick={applyCustomPrice}
          className="mt-2 w-full rounded-lg border border-primary py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
        >
          Apply price
        </button>
        {priceError && <p className="mt-2 text-xs font-medium text-red-600">{priceError}</p>}
      </div>
    </div>
  );
}
