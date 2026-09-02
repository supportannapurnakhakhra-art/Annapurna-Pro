// components/YouMayAlsoLikeServer.jsx
import { getProducts } from "@/lib/api/services";
import YouMayAlsoLikeSlider from "./YouMayAlsoLike";

export default async function YouMayAlsoLikeServer() {
  const products = await getProducts({ limit: 8 });

  if (!products?.length) return null;

  return <YouMayAlsoLikeSlider products={products} />;
}
