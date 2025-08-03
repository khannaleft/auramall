import ShopPageClient from "./ShopPageClient";
import { getProducts } from "@/services/firebaseService";
import { notFound } from "next/navigation";

interface ShopPageProps {
  params: { storeId: string };
}

export default async function ShopPage({ params }: ShopPageProps) {
  const allProducts = await getProducts();
  const storeId = Number(params.storeId);

  if (isNaN(storeId)) {
    notFound();
  }
  
  const storeProducts = allProducts.filter(p => p.storeId === storeId);
  
  return <ShopPageClient products={storeProducts} storeId={storeId} />;
}
