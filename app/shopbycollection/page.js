import ShopByCollectionPage from "./ShopByCollectionClient";

export const metadata = {
  title: "Shop by Collection | Annapurna Khakhra Collections",
  description: "Explore our curated collections of traditional Gujarati khakhra, from Pure Ghee to Sugar-Free options.",
  alternates: {
    canonical: '/shopbycollection',
  },
};

export default function Page() {
  return <ShopByCollectionPage />;
}
