// app/page.js   ← FINAL WORKING VERSION
import { getProducts, getCollections } from "@/lib/api/services";
import ProductCard from "@/components/ProductCard";
import HeroSection from "@/components/Herosection";
import OurPromiseSection from "@/components/OurPromiseSection";
import KhakhraMakingProcess from "@/components/KhakhraMakingProcess";
import CraftsmanshipHeritageSection from "@/components/CraftsmanshipHeritageSection";
import ShopByOilPreferenceSection from "@/components/ShopByOilPreferenceSection";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import CallToActionSection from "@/components/CallToActionSection";
import FAQSection from "@/components/FAQSection";
import CategoriesSlider from "@/components/CategoriesSlider";
import Link from "next/link";
import FlourOptionsSection from "@/components/FlourOptionsSection";
import HoliSpecialOffer from "@/components/HoliSpecialOffer";

export const metadata = {
  title: "Annapurna Khakhra - Best Traditional Gujarati Snacks Online",
  description:
    "Shop premium Annapurna Khakhra online. Authentic handmade Gujarati khakhra in various flavors like Masala, Jeera, and Methi. Traditional taste in every bite.",
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const products = await getProducts({ limit: 14 });
  const collections = await getCollections();

  return (
    <div className="bg-[#fdfbf7]">
      {/* <HoliSpecialOffer /> */}
      <CategoriesSlider collections={collections} />
      {/* <HeroSection /> */}

      <OurPromiseSection />
      <div className="max-w-7xl mx-auto bg-[#fdfbf7] py-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-[#7C4A0E] text-center m-2">
          Our Top Selling Khakhra
        </h2>
        <p className="mt-4 text-[#cc760e] text-base sm:text-lg md:text-xl leading-relaxed text-center m-2">
          Freshly crafted, lovingly made. Explore our bestsellers.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="flex justify-center mt-4 md:mt-8">
          <Link
            href="/Shop"
            className="group flex items-center gap-2 bg-[#7d4b0e] text-white px-5 md:px-8 py-2.5 md:py-4 rounded-full text-sm md:text-base font-semibold tracking-wide shadow-md hover:bg-[#6b400c] transition-all duration-300"
          >
            View All
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
      <KhakhraMakingProcess />
      <CraftsmanshipHeritageSection />
      <ShopByOilPreferenceSection />
      <FlourOptionsSection />
      <TestimonialsCarousel />
      <CallToActionSection />
      <FAQSection />
    </div>
  );
}
