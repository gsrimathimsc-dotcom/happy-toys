import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { applyServerErrors } from "@/lib/formErrors";
import { Package, Pencil, Plus, TicketPercent, Trash2 } from "lucide-react";
import { AdminHeading, LoadState, StatCard, TablePanel } from "@/components/admin/AdminParts";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useLoad } from "@/hooks/useLoad";
import { formatPrice } from "@/lib/utils";
import { createCoupon, deleteCoupon, getOffers, updateCoupon } from "@/services/adminService";
import { couponSchema, type CouponValues } from "@/validation/schemas";
import type { Coupon } from "@/types";

const EMPTY: CouponValues = {
  code: "",
  type: "percentage",
  value: 10,
  minimumOrderAmount: 0,
  expiresOn: "",
  isActive: true,
};

/** The date part (yyyy-mm-dd) the date field needs, in the browser's own time zone. */
function toDateInput(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function AdminOffersPage() {
  useDocumentTitle("Offers");
  const { showToast } = useToast();
  const { data, error, reload } = useLoad(getOffers);
  /** null = form closed, "new" = adding, otherwise the coupon being edited. */
  const [editing, setEditing] = useState<Coupon | "new" | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CouponValues>({ resolver: zodResolver(couponSchema), defaultValues: EMPTY });

  const open = (coupon: Coupon | "new") => {
    reset(
      coupon === "new"
        ? EMPTY
        : {
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            minimumOrderAmount: coupon.minimumOrderAmount,
            expiresOn: toDateInput(coupon.expiresAt),
            isActive: coupon.isActive,
          }
    );
    setEditing(coupon);
  };

  const save = async ({ expiresOn, ...values }: CouponValues) => {
    // A coupon works through the whole of its last day.
    const expiresAt = expiresOn ? new Date(`${expiresOn}T23:59:59`).toISOString() : null;
    try {
      if (editing && editing !== "new") await updateCoupon(editing.id, { ...values, expiresAt });
      else await createCoupon({ ...values, expiresAt });
      showToast(`Coupon ${values.code.toUpperCase()} saved`, "success");
      setEditing(null);
      reload();
    } catch (err) {
      applyServerErrors(err, setError, ["code", "value", "minimumOrderAmount"], "code");
      showToast(err instanceof Error ? err.message : "Could not save the coupon.", "error");
    }
  };

  const remove = async (coupon: Coupon) => {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) return;
    try {
      await deleteCoupon(coupon.id);
      showToast(`Coupon ${coupon.code} deleted`, "success");
      reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not delete the coupon.", "error");
    }
  };

  if (!data) return <LoadState error={error} onRetry={reload} />;

  const activeCoupons = data.coupons.filter((c) => c.isActive).length;

  return (
    <>
      <AdminHeading title="Offers" subtitle="Discounted products and coupon codes." />

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <StatCard icon={Package} label="Products on offer" value={data.productsOnOffer.length} />
        <StatCard icon={TicketPercent} label="Active coupons" value={activeCoupons} />
      </div>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-navy">Coupons</h2>
        <Button size="sm" onClick={() => open("new")}>
          <Plus className="h-4 w-4" /> Add Coupon
        </Button>
      </div>
      <p className="mb-3 text-sm text-muted">Customers will be able to use coupons at checkout after the shopping update.</p>

      {editing && (
        <form
          onSubmit={handleSubmit(save)}
          noValidate
          className="mb-4 grid gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:grid-cols-2"
        >
          <h3 className="font-bold text-navy sm:col-span-2">
            {editing === "new" ? "New coupon" : `Edit ${editing.code}`}
          </h3>
          <FormField label="Code" placeholder="e.g. HAPPY10" error={errors.code?.message} {...register("code")} />
          <div>
            <label htmlFor="type" className="mb-1.5 block text-sm font-semibold text-navy">
              Discount type
            </label>
            <select id="type" className="input-field" {...register("type")}>
              <option value="percentage">Percentage off</option>
              <option value="fixedAmount">Fixed amount off (₹)</option>
            </select>
          </div>
          <FormField label="Discount value" type="number" min={1} error={errors.value?.message} {...register("value", { valueAsNumber: true })} />
          <FormField
            label="Minimum order (₹)"
            type="number"
            min={0}
            error={errors.minimumOrderAmount?.message}
            {...register("minimumOrderAmount", { valueAsNumber: true })}
          />
          <div>
            <FormField label="Last day (optional)" type="date" error={errors.expiresOn?.message} {...register("expiresOn")} />
            <p className="mt-1 text-xs text-muted">Leave empty for a coupon that never expires.</p>
          </div>
          <label className="flex min-h-11 items-center gap-2 self-center text-sm text-navy">
            <input type="checkbox" className="h-4 w-4 accent-primary" {...register("isActive")} />
            Active
          </label>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <Button type="submit" isLoading={isSubmitting}>
              Save Coupon
            </Button>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <TablePanel>
        <thead className="border-b border-slate-100 text-xs uppercase text-muted">
          <tr>
            <th className="p-3">Code</th>
            <th className="p-3">Discount</th>
            <th className="p-3 text-right">Minimum order</th>
            <th className="p-3">Last day</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.coupons.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-muted">
                No coupons yet.
              </td>
            </tr>
          )}
          {data.coupons.map((coupon) => (
            <tr key={coupon.id}>
              <td className="p-3 font-mono font-semibold text-navy">{coupon.code}</td>
              <td className="p-3">
                {coupon.type === "percentage" ? `${coupon.value}% off` : `${formatPrice(coupon.value)} off`}
              </td>
              <td className="p-3 text-right">{formatPrice(coupon.minimumOrderAmount)}</td>
              <td className="whitespace-nowrap p-3">
                {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "No expiry"}
              </td>
              <td className="p-3">{coupon.isActive ? "Active" : "Inactive"}</td>
              <td className="p-3">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="sm" aria-label={`Edit ${coupon.code}`} onClick={() => open(coupon)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" aria-label={`Delete ${coupon.code}`} onClick={() => void remove(coupon)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </TablePanel>

      <h2 className="mb-3 mt-8 text-lg font-bold text-navy">Products on offer</h2>
      <p className="mb-3 text-sm text-muted">Change a product&apos;s price and MRP in Products to set its discount.</p>
      <TablePanel>
        <thead className="border-b border-slate-100 text-xs uppercase text-muted">
          <tr>
            <th className="p-3">Product</th>
            <th className="p-3">Category</th>
            <th className="p-3 text-right">MRP</th>
            <th className="p-3 text-right">Price</th>
            <th className="p-3 text-right">Discount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.productsOnOffer.map((product) => (
            <tr key={product.id}>
              <td className="p-3 font-semibold text-navy">{product.name}</td>
              <td className="p-3">{product.categoryName}</td>
              <td className="p-3 text-right text-muted line-through">{formatPrice(product.originalPrice)}</td>
              <td className="p-3 text-right font-semibold">{formatPrice(product.price)}</td>
              <td className="p-3 text-right font-semibold text-green-700">{product.discountPercentage}%</td>
            </tr>
          ))}
        </tbody>
      </TablePanel>
    </>
  );
}
