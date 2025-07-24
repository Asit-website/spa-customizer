"use client";
import { useParams } from "next/navigation";
import CustomizerLayout from "../../CustomizerLayout";

import { backendProducts } from "../../productsData";

export default function CustomizerPage() {
  const { id } = useParams();
  const product = backendProducts.find(p => String(p.id) === String(id));

  if (!product) return <div>Product not found</div>;

  return <CustomizerLayout selectedProduct={product} />;
}