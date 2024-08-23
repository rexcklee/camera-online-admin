"use client";
import ProductAttributesPage from "@/app/components/productAttributesPage";
import { useParams } from "next/navigation";

export default function Product() {
  const params = useParams();
  const id = params.id as string;

  return (
    <>
      <ProductAttributesPage id={id} />
    </>
  );
}
