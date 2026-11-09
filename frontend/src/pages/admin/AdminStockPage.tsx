import { useState } from "react";
import AdminSearch from "@/components/admin/AdminSearch";
import { AdminHeading, LoadState, StockBadge, TablePanel } from "@/components/admin/AdminParts";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useLoad } from "@/hooks/useLoad";
import { getAdminProducts, updateStock } from "@/services/adminService";
import type { Product } from "@/types";

export default function AdminStockPage() {
  useDocumentTitle("Stock");
  const { data, error, reload } = useLoad(getAdminProducts);
  const [search, setSearch] = useState("");

  if (!data) return <LoadState error={error} onRetry={reload} />;

  // Lowest stock first, so what needs attention is at the top.
  const term = search.trim().toLowerCase();
  const products = data
    .filter((p) => p.isActive && [p.name, p.brand, p.categoryName, p.id].some((text) => text.toLowerCase().includes(term)))
    .sort((a, b) => a.stockQuantity - b.stockQuantity);
  const totalUnits = products.reduce((sum, p) => sum + p.stockQuantity, 0);

  return (
    <>
      <AdminHeading
        title="Current Stock"
        subtitle={`${products.length} products, ${totalUnits.toLocaleString("en-IN")} units. Lowest stock is shown first.`}
      />
      <AdminSearch onSearch={setSearch} label="Search stock" placeholder="Search by name, brand or category" className="mb-4" />
      {products.length === 0 && <p className="mb-4 text-sm text-muted">No products match your search.</p>}
      <TablePanel fit>
        <thead className="border-b border-slate-100 text-xs uppercase text-muted">
          <tr>
            <th className="p-3">Product</th>
            <th className="hidden p-3 md:table-cell">Category</th>
            <th className="hidden p-3 sm:table-cell">Status</th>
            <th className="p-3 text-right">Units in stock</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <StockRow key={product.id} product={product} onSaved={reload} />
          ))}
        </tbody>
      </TablePanel>
    </>
  );
}

function StockRow({ product, onSaved }: { product: Product; onSaved: () => void }) {
  const { showToast } = useToast();
  const [value, setValue] = useState(String(product.stockQuantity));
  const [saving, setSaving] = useState(false);

  const quantity = Number(value);
  const isValid = value.trim() !== "" && Number.isInteger(quantity) && quantity >= 0;
  const changed = quantity !== product.stockQuantity;

  const save = async () => {
    setSaving(true);
    try {
      await updateStock(product.id, quantity);
      showToast(`${product.name}: stock is now ${quantity}`, "success");
      onSaved();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not update the stock.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <tr>
      <td className="p-3">
        <p className="font-semibold text-navy">{product.name}</p>
        <div className="mt-1 sm:hidden">
          <StockBadge stock={product.stockQuantity} />
        </div>
      </td>
      <td className="hidden p-3 md:table-cell">{product.categoryName}</td>
      <td className="hidden p-3 sm:table-cell"><StockBadge stock={product.stockQuantity} /></td>
      <td className="p-3">
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
          <input
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label={`Stock for ${product.name}`}
            className="input-field !w-20 text-right sm:!w-24"
          />
          <Button size="sm" onClick={save} isLoading={saving} disabled={!isValid || !changed} aria-label={`Save stock for ${product.name}`}>
            Save
          </Button>
        </div>
      </td>
    </tr>
  );
}
