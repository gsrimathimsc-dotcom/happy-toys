import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/productService";
import ProductDetailsView from "@/components/products/ProductDetailsView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);
  return { title: product ? product.name : "Product not found" };
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { id } = await params;
  // Show the 404 page straight away for unknown IDs.
  if (!getProductById(id)) notFound();
  // The details themselves are loaded from GET /api/products/[id] in the browser.
  return <ProductDetailsView productId={id} />;
}
