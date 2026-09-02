import { notFound } from "next/navigation";
import { getCollectionByIdentifier } from "@/lib/api/services";
import ProductsViewClient from "@/components/ProductsViewClient";

export async function generateMetadata({ params }) {
  const { handle } = await params; 
  const title = handle ? handle.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "Collection";

  return {
    title: `${title} | Authentic Gujarati Traditional Khakhra Collection`,
    description: `Explore our ${title} of Annapurna Khakhra. The finest variety of traditional Gujarati khakhra and masala khakhra snacks.`,
    alternates: {
      canonical: `/shopbycollection/${handle}`,
    },
  };
}

export default async function Page({ params, searchParams }) {
  const { handle } = await params; 
  const sp = await searchParams;   

  if (!handle) notFound();

  const data = await getCollectionByIdentifier(handle);

  if (!data) notFound();

  return (
    <ProductsViewClient
      products={data.products}
      collectionTitle={data.title}
      initialSearchQuery={sp?.search || ""}
    />
  );
}
