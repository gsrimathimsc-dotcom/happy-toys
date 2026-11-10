import { useState } from "react";
import AdminSearch from "@/components/admin/AdminSearch";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { AdminHeading, LoadState, StockBadge, TablePanel } from "@/components/admin/AdminParts";
import Button from "@/components/ui/Button";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useLoad } from "@/hooks/useLoad";
import { formatPrice } from "@/lib/utils";
import { deleteProduct, getAdminProducts, toProductInput, updateProduct } from "@/services/adminService";
import type { Product } from "@/types";

export default function AdminProductsPage() {
  useDocumentTitle("Manage Products");
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { data, error, reload } = useLoad(getAdminProducts);
  const [search, setSearch] = useState("");

  if (!data) return <LoadState error={error} onRetry={reload} />;

  const term = search.trim().toLowerCase();
  const products = data.filter((p) =>
    [p.name, p.brand, p.categoryName, p.id].some((text) => text.toLowerCase().includes(term))
  );

  const run = async (action: Promise<unknown>, message: string) => {
    try {
      await action;
      showToast(message, "success");
      reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "That did not work.", "error");
    }
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`Delete "${product.name}"? It will be hidden from the store, and past orders stay as they are.`)) {
      void run(deleteProduct(product.id), `${product.name} deleted`);
    }
  };

  const handleRestore = (product: Product) =>
    void run(updateProduct(product.id, { ...toProductInput(product), isActive: true }), `${product.name} restored`);

  return (
    <>
      <AdminHeading
        title="Products"
        subtitle={`${data.length} products, including deleted ones.`}
        action={
          <Button href="/admin/products/new">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        }
      />

      <AdminSearch
        onSearch={setSearch}
        label="Search products"
        placeholder="Search by name, brand or category"
        className="mb-4"
        items={data}
        matches={(p, term) => [p.name, p.brand, p.categoryName, p.id].some((text) => text.toLowerCase().includes(term))}
        getKey={(p) => p.id}
        onSelect={(p) => navigate(`/admin/products/${p.id}/edit`)}
        renderItem={(p) => (
          <span className="flex items-center justify-between gap-3">
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-navy">{p.name}</span>
              <span className="block truncate text-xs text-muted">{p.brand} - {p.categoryName}</span>
            </span>
            <span className="text-sm font-bold text-navy">{formatPrice(p.price)}</span>
          </span>
        )}
      />

      <TablePanel fit>
        <thead className="border-b border-slate-100 text-xs uppercase text-muted">
          <tr>
            <th className="p-3">Product</th>
            <th className="hidden p-3 lg:table-cell">Category</th>
            <th className="hidden p-3 text-right sm:table-cell">Price</th>
            <th className="hidden p-3 text-right sm:table-cell">Stock</th>
            <th className="hidden p-3 md:table-cell">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr key={product.id} className={product.isActive ? "" : "bg-slate-50 text-muted"}>
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <img src={product.imageUrl} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0">
                    <p className="font-semibold text-navy">{product.name}</p>
                    <p className="text-xs text-muted">{product.brand}</p>
                    <p className="text-xs text-muted sm:hidden">
                      {formatPrice(product.price)} · {product.stockQuantity} in stock
                      {!product.isActive && " · Deleted"}
                    </p>
                  </div>
                </div>
              </td>
              <td className="hidden p-3 lg:table-cell">{product.categoryName}</td>
              <td className="hidden p-3 text-right font-semibold sm:table-cell">{formatPrice(product.price)}</td>
              <td className="hidden p-3 text-right sm:table-cell">{product.stockQuantity}</td>
              <td className="hidden p-3 md:table-cell">
                {product.isActive ? (
                  <StockBadge stock={product.stockQuantity} />
                ) : (
                  <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">Deleted</span>
                )}
              </td>
              <td className="p-3">
                <div className="flex justify-end gap-1">
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    aria-label={`Edit ${product.name}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-primary hover:bg-primary-light"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  {product.isActive ? (
                    <button
                      onClick={() => handleDelete(product)}
                      aria-label={`Delete ${product.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRestore(product)}
                      aria-label={`Restore ${product.name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg text-green-700 hover:bg-green-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </TablePanel>
      {products.length === 0 && <p className="mt-4 text-center text-sm text-muted">No products match your search.</p>}
    </>
  );
}
