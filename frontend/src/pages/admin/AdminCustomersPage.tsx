import { useState } from "react";
import { AdminHeading, LoadState, TablePanel, formatDateTime } from "@/components/admin/AdminParts";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useLoad } from "@/hooks/useLoad";
import { formatPrice } from "@/lib/utils";
import { getCustomers } from "@/services/adminService";

export default function AdminCustomersPage() {
  useDocumentTitle("Customers");
  const { data, error, reload } = useLoad(getCustomers);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  if (!data) return <LoadState error={error} onRetry={reload} />;

  const term = debouncedSearch.trim().toLowerCase();
  const customers = data.filter((c) => [c.name, c.email, c.mobile].some((text) => text.toLowerCase().includes(term)));

  return (
    <>
      <AdminHeading
        title="Customers"
        subtitle={`${data.length} registered customers. Total spent leaves out cancelled orders.`}
        action={
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers"
            aria-label="Search customers"
            className="input-field !w-full sm:!w-64"
          />
        }
      />

      <TablePanel>
        <thead className="border-b border-slate-100 text-xs uppercase text-muted">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Mobile</th>
            <th className="p-3">Joined</th>
            <th className="p-3 text-right">Orders</th>
            <th className="p-3 text-right">Total spent</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {customers.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-muted">
                No customers found.
              </td>
            </tr>
          )}
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="p-3 font-semibold text-navy">{customer.name}</td>
              <td className="p-3">{customer.email}</td>
              <td className="p-3">{customer.mobile || "-"}</td>
              <td className="whitespace-nowrap p-3">{formatDateTime(customer.joinedAt)}</td>
              <td className="p-3 text-right">{customer.orders}</td>
              <td className="p-3 text-right font-semibold">{formatPrice(customer.totalSpent)}</td>
            </tr>
          ))}
        </tbody>
      </TablePanel>
    </>
  );
}
