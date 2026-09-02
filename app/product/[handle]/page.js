// product/[handle]/page.js
import { getProductByIdentifier } from "@/lib/api/services";
import ProductDetailsClient from "./product-details-client";
import YouMayAlsoLikeServer from "@/components/YouMayAlsoLikeServer";
import Reviews from "@/components/Reviews";
import PromoSection from "@/components/PromoSection";
import BestSellerSection from "@/components/BestSellerSection";
import FAQSection from "@/components/FAQSection";
import RecentlyViewedProducts from "@/components/RecentlyViewedProducts";
import WhatsAppCommunitySection from "@/components/WhatsAppCommunitySection";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const product = await getProductByIdentifier(handle);

  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.title} | Traditional Gujarati Masala Khakhra`,
    description: product.description?.length > 160 
      ? product.description.substring(0, 157) + "..." 
      : product.description || `Buy ${product.title} online. Authentic Annapurna Khakhra made with traditional recipes. A perfect healthy Gujarati snack.`,
    alternates: {
      canonical: `/product/${handle}`,
    },
  };
}

export default async function ProductDetailsPage({ params }) {
  const { handle } = await params;

  const product = await getProductByIdentifier(handle);
  if (!product) notFound();

  return (
    <>
      <ProductDetailsClient product={product} />
      {/* <PromoSection /> */}
      <Reviews productId={product.id} initialReviews={product.reviews} initialAverage={product.avg_rating} />
      <BestSellerSection />
      <YouMayAlsoLikeServer />
      <RecentlyViewedProducts />
      <FAQSection />
      <WhatsAppCommunitySection />
    </>
  );
}
