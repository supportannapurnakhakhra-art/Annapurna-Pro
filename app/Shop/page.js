

// app/collection/page.jsx
import ProductsViewClient from "@/components/ProductsViewClient";
import { getProducts } from "@/lib/api/services";

export const metadata = {
  title: "Shop All Authentic Gujarati Khakhra | Annapurna Khakhra",
  description: "Browse our complete collection of traditional handmade khakhra. From Masala to Jeera, find all your favorite Gujarati snacks in one place.",
  alternates: {
    canonical: '/Shop',
  },
};

export default async function CollectionsPage({ searchParams }) {
  const params = await searchParams;
  const searchQuery = params.search || "";
  const products = await getProducts();

  return (
    <ProductsViewClient 
      products={products} 
      initialSearchQuery={searchQuery} 
    />
  );
}


