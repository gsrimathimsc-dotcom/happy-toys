import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminHeading, LoadState, TablePanel } from "@/components/admin/AdminParts";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import { useToast } from "@/context/ToastContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useLoad } from "@/hooks/useLoad";
import { cn } from "@/lib/utils";
import { createCategory, deleteCategory, updateCategory } from "@/services/adminService";
import { getCategories } from "@/services/productService";
import { categorySchema, type CategoryValues } from "@/validation/schemas";
import type { Category } from "@/types";

const EMPTY: CategoryValues = { name: "", description: "" };

export default function AdminCategoriesPage() {
  useDocumentTitle("Manage Categories");
  const { showToast } = useToast();
  const { data, error, reload } = useLoad(getCategories);
  /** null = form closed, "new" = adding, otherwise the category being edited. */
  const [editing, setEditing] = useState<Category | "new" | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryValues>({ resolver: zodResolver(categorySchema), defaultValues: EMPTY });

  const open = (category: Category | "new") => {
    reset(category === "new" ? EMPTY : { name: category.name, description: category.description });
    setEditing(category);
  };

  const save = async (values: CategoryValues) => {
    try {
      if (editing && editing !== "new") await updateCategory(editing.id, values);
      else await createCategory(values);
      showToast(`${values.name} saved`, "success");
      setEditing(null);
      reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not save the category.", "error");
    }
  };

  const remove = async (category: Category) => {
    if (!window.confirm(`Delete the "${category.name}" category?`)) return;
    try {
      await deleteCategory(category.id);
      showToast(`${category.name} deleted`, "success");
      reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not delete the category.", "error");
    }
  };

  if (!data) return <LoadState error={error} onRetry={reload} />;

  return (
    <>
      <AdminHeading
        title="Categories"
        subtitle="A category can only be deleted when it has no products."
        action={
          <Button onClick={() => open("new")}>
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        }
      />

      {editing && (
        <form
          onSubmit={handleSubmit(save)}
          noValidate
          className="mb-6 grid gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:grid-cols-2"
        >
          <h2 className="text-lg font-bold text-navy sm:col-span-2">
            {editing === "new" ? "New category" : `Edit ${editing.name}`}
          </h2>
          <FormField label="Name" error={errors.name?.message} {...register("name")} />
          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-semibold text-navy">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              aria-invalid={errors.description ? true : undefined}
              className={cn("input-field resize-y", errors.description && "border-red-400")}
              {...register("description")}
            />
            {errors.description && <p className="mt-1 text-xs font-medium text-red-600">{errors.description.message}</p>}
          </div>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <Button type="submit" isLoading={isSubmitting}>
              Save Category
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
            <th className="p-3">Name</th>
            <th className="p-3">Description</th>
            <th className="p-3 text-right">Products</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((category) => (
            <tr key={category.id}>
              <td className="p-3 font-semibold text-navy">{category.name}</td>
              <td className="p-3 text-muted">{category.description}</td>
              <td className="p-3 text-right">{category.productCount}</td>
              <td className="p-3">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="sm" aria-label={`Edit ${category.name}`} onClick={() => open(category)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" aria-label={`Delete ${category.name}`} onClick={() => void remove(category)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </TablePanel>
    </>
  );
}
