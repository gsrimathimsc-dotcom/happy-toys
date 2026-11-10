import { useState } from "react";
import AdminSearch from "@/components/admin/AdminSearch";
import { AdminHeading, LoadState, TablePanel, formatDateTime } from "@/components/admin/AdminParts";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useLoad } from "@/hooks/useLoad";
import { formatPrice } from "@/lib/utils";
import { getCustomers } from "@/services/adminService";

export default function AdminCustomersPage() {
  useDocumentTitle("Customers");
  const { data, error, reload } = useLoad(getCustomers);
  const [search, setSearch] = useState("");

  if (!data) return <LoadState error={error} onRetry={reload} />;

  const term = search.trim().toLowerCase();
  const customers = data.filter((c) => [c.name, c.email, c.mobile].some((text) => text.toLowerCase().includes(term)));

  return (
    <>
      <AdminHeading
        title="Customers"
        subtitle={`${data.length} registered customers. Total spent leaves out cancelled orders.`}
        action={
          <AdminSearch
            onSearch={setSearch}
            label="Search customers"
            placeholder="Search customers"
            className="sm:!w-72"
            items={data}
            matches={(c, term) => [c.name, c.email, c.mobile].some((text) => text.toLowerCase().includes(term))}
            getKey={(c) => c.email}
            getText={(c) => c.email}
            renderItem={(c) => (
              <span className="block min-w-0">
                <span className="block truncate text-sm font-semibold text-navy">{c.name}</span>
                <span className="block truncate text-xs text-muted">{c.email}</span>
              </span>
            )}
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
