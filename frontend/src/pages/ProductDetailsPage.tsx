import { useParams } from "react-router-dom";
import ProductDetailsView from "@/components/products/ProductDetailsView";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  return <ProductDetailsView productId={id ?? ""} />;
}
