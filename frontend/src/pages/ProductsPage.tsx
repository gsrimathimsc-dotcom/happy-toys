import ProductsView from "@/components/products/ProductsView";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function ProductsPage() {
  useDocumentTitle("Shop All Toys");
  return <ProductsView />;
}
