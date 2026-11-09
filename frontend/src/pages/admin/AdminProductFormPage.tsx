import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { applyServerErrors } from "@/lib/formErrors";
import { AdminHeading, LoadState } from "@/components/admin/AdminParts";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { useToast } from "@/context/ToastContext";
import { useCategories } from "@/hooks/useCategories";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useLoad } from "@/hooks/useLoad";
import { cn } from "@/lib/utils";
import { createProduct, getAdminProducts, toProductInput, updateProduct } from "@/services/adminService";
import type { Product } from "@/types";
import { productSchema, type ProductValues } from "@/validation/schemas";

const PLACEHOLDER_IMAGE = "/images/placeholder.svg";

const EMPTY_PRODUCT: ProductValues = {
  name: "",
  categoryId: "",
  brand: "",
  description: "",
  price: 0,
  originalPrice: 0,
  imageUrl: PLACEHOLDER_IMAGE,
  stockQuantity: 0,
  ageGroup: "",
  isActive: true,
  isFeatured: false,
  isBestSeller: false,
  isNew: true,
};

/** The same page adds a new product and edits an existing one. */
export default function AdminProductFormPage() {
  const { id } = useParams<{ id: string }>();
  useDocumentTitle(id ? "Edit Product" : "Add Product");

  const { data, error, reload } = useLoad<Product | null>(async () => {
    if (!id) return null;
    const products = await getAdminProducts();
    const product = products.find((p) => p.id === id);
    if (!product) throw new Error("This product was not found.");
    return product;
  }, id);

  if (id && !data) return <LoadState error={error} onRetry={reload} />;
  return <ProductForm product={data} />;
}

function ProductForm({ product }: { product: Product | null }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const categories = useCategories();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ?? EMPTY_PRODUCT,
  });

  // The category list arrives after the form opens, so its value is set again then.
  useEffect(() => {
    if (categories.length > 0) reset((current) => ({ ...current }));
  }, [categories, reset]);

  const save = async (values: ProductValues) => {
    try {
      if (product) {
        await updateProduct(product.id, { ...toProductInput(product), ...values });
      } else {
        await createProduct({ ...values, specifications: {} });
      }
      showToast(`${values.name} saved`, "success");
      navigate("/admin/products");
    } catch (err) {
      applyServerErrors(err, setError, ["name", "brand", "description", "price", "originalPrice", "imageUrl", "stockQuantity"], "name");
      showToast(err instanceof Error ? err.message : "Could not save the product.", "error");
    }
  };

  const number = { valueAsNumber: true };

  return (
    <>
      <AdminHeading title={product ? `Edit ${product.name}` : "Add Product"} />

      <form
        onSubmit={handleSubmit(save, () => showToast("Please fix the highlighted fields.", "error"))}
        noValidate
        className="grid gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:grid-cols-2 sm:p-6"
      >
        <div className="sm:col-span-2">
          <FormField label="Product name" error={errors.name?.message} {...register("name")} />
        </div>

        <div>
          <label htmlFor="categoryId" className="mb-1.5 block text-sm font-semibold text-navy">
            Category
          </label>
          <select
            id="categoryId"
            aria-invalid={errors.categoryId ? true : undefined}
            className={cn("input-field", errors.categoryId && "border-red-400")}
            {...register("categoryId")}
          >
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs font-medium text-red-600">{errors.categoryId.message}</p>}
        </div>

        <FormField label="Brand" error={errors.brand?.message} {...register("brand")} />
        <FormField label="Selling price (₹)" type="number" min={1} error={errors.price?.message} {...register("price", number)} />
        <FormField label="Original price / MRP (₹)" type="number" min={1} error={errors.originalPrice?.message} {...register("originalPrice", number)} />
        <FormField label="Stock quantity" type="number" min={0} error={errors.stockQuantity?.message} {...register("stockQuantity", number)} />
        <FormField label="Age group" placeholder="e.g. 3-7 years" error={errors.ageGroup?.message} {...register("ageGroup")} />

        <div className="sm:col-span-2">
          <FormField label="Image address" error={errors.imageUrl?.message} {...register("imageUrl")} />
          <p className="mt-1 text-xs text-muted">Keep the placeholder, or enter the address of an image.</p>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="mb-1.5 block text-sm font-semibold text-navy">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            aria-invalid={errors.description ? true : undefined}
            className={cn("input-field resize-y", errors.description && "border-red-400")}
            {...register("description")}
          />
          {errors.description && <p className="mt-1 text-xs font-medium text-red-600">{errors.description.message}</p>}
        </div>

        <fieldset className="flex flex-wrap gap-x-6 gap-y-2 sm:col-span-2">
          <legend className="mb-1.5 text-sm font-semibold text-navy">Show this product</legend>
          {(
            [
              ["isActive", "On sale"],
              ["isFeatured", "Featured"],
              ["isBestSeller", "Best seller"],
              ["isNew", "New arrival"],
            ] as const
          ).map(([field, label]) => (
            <label key={field} className="flex min-h-11 items-center gap-2 text-sm text-navy">
              <input type="checkbox" className="h-4 w-4 accent-primary" {...register(field)} />
              {label}
            </label>
          ))}
        </fieldset>

        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <Button type="submit" size="lg" isLoading={isSubmitting}>
            Save Product
          </Button>
          <Button href="/admin/products" variant="ghost" size="lg">
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}
