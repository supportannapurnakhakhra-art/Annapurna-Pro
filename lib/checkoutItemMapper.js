// lib/checkoutItemMapper.js — map storefront products to Mega Checkout SDK items

export function getNumericId(id) {
  if (!id) return "";
  const cleanId = String(id).replace(/-default$/, "");
  const match = cleanId.match(/\d+$/);
  return match ? match[0] : cleanId;
}

export function getProductImageUrl(product) {
  let rawImgUrl =
    product?.featuredImage?.url ||
    (typeof product?.featuredImage === "string" ? product.featuredImage : null) ||
    product?.featuredImageUrl ||
    product?.image_url ||
    product?.imageUrl ||
    product?.images?.edges?.[0]?.node?.url ||
    product?.images?.[0]?.url ||
    product?.image ||
    null;

  if (rawImgUrl && typeof rawImgUrl === "string") {
    if (rawImgUrl.includes("/media/") && !rawImgUrl.includes("/api/media/")) {
      rawImgUrl = rawImgUrl.replace("/media/", "/api/media/");
    }
    return rawImgUrl;
  }

  return "/placeholder.jpg";
}

export function resolveDefaultVariant(product) {
  return (
    product?.variants?.edges?.[0]?.node ||
    product?.variants?.nodes?.[0] ||
    product?.variants?.[0] ||
    product?.defaultVariant || { id: product?.id, title: "Default" }
  );
}

export function buildCheckoutItem(product, variant, imageUrl) {
  const defaultVariant = variant || resolveDefaultVariant(product);

  const rawVariantId =
    defaultVariant?.variant_id ||
    defaultVariant?.variantId ||
    defaultVariant?.id ||
    defaultVariant?._id ||
    product?.variant_id ||
    product?.variantId ||
    product?.default_variant_id ||
    product?.id;

  const rawProductId = product?.product_id || product?.productId || product?.id;

  const cleanVariantId = getNumericId(rawVariantId);
  const cleanProductId = getNumericId(rawProductId);

  const priceVal = Number(
    defaultVariant?.price?.amount ??
      defaultVariant?.price ??
      product?.price?.amount ??
      product?.price ??
      0,
  );

  const rawWeight = defaultVariant?.weight ?? product?.weight ?? 0;
  const weightVal = Number(rawWeight);
  const variantWeightGrams =
    weightVal > 0 && weightVal < 15
      ? Math.round(weightVal * 1000)
      : Math.round(weightVal);

  return {
    id: cleanVariantId,
    productId: cleanProductId,
    variantId: cleanVariantId,
    title: product?.title || "",
    variantTitle: defaultVariant?.title || "Standard",
    imageUrl: imageUrl || getProductImageUrl(product),
    sku: defaultVariant?.sku || "",
    price: priceVal,
    weight: variantWeightGrams,
    weightUnit: "g",
    needsVariantHydration:
      !variant &&
      (cleanVariantId === cleanProductId ||
        String(rawVariantId).includes("-default")),
  };
}
