const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://10.27.1.208:4000";

/**
 * Normalizes an image URL to inject the backend IP and ensure /media/ routes go to /api/media/.
 */
function normalizeImageUrl(urlInput) {
  if (!urlInput || typeof urlInput !== "string") return "";
  let url = urlInput.trim();
  if (!url) return "";

  if (url.startsWith("//")) {
    url = `https:${url}`;
  }

  // Rewrite /media/ prefix in hostname paths to /api/media/
  if (url.match(/^https?:\/\/[^\/]+\/media\//)) {
    url = url.replace(/^https?:\/\/[^\/]+\/media\//, `${BACKEND_URL}/api/media/`);
  } else if (url.match(/^https?:\/\/[^\/]+\/api\/media\//)) {
    url = url.replace(/^https?:\/\/[^\/]+\/api\/media\//, `${BACKEND_URL}/api/media/`);
  } else if (url.startsWith("/media/")) {
    url = `${BACKEND_URL}/api${url}`;
  } else if (url.startsWith("/") && !url.startsWith("//")) {
    url = `${BACKEND_URL}${url}`;
  }

  return url;
}

/**
 * Parse weight value and unit from backend and return weight in kilograms (number).
 */
function parseWeightToKg(value, unit) {
  let val = value;
  let un = unit;

  // If value is a string, and unit is missing or empty, try to parse both from value
  if (typeof value === "string" && (!unit || !String(unit).trim())) {
    const match = value.match(/([\d.]+)\s*(gm|g|kg|kgs|mg|grams?|kilograms?)\b/i);
    if (match) {
      val = parseFloat(match[1]);
      un = match[2];
    }
  }

  const rawValue = typeof val === "string" ? val.trim() : val;
  const n = Number(rawValue || 0);
  const extracted = Number(
    typeof rawValue === "string"
      ? (rawValue.match(/[\d.]+/) || [0])[0]
      : rawValue || 0,
  );
  const numericValue = Number.isFinite(n) && n ? n : extracted;
  if (!numericValue) return 0;
  const u = String(un || "").trim().toLowerCase();
  if (!u) return numericValue; // assume already in kg if unit missing
  if (u === "kg" || u === "kgs" || u === "kilogram" || u === "kilograms") return numericValue;
  if (u === "g" || u === "gm" || u === "grams" || u === "gram") return numericValue / 1000;
  if (u === "mg" || u === "milligram" || u === "milligrams") return numericValue / 1e6;
  // fallback: if unit contains 'g' but not 'kg', treat as grams
  if (u.includes("g") && !u.includes("kg")) return numericValue / 1000;
  return numericValue;
}

/**
 * Maps a custom backend product shape to the rich Shopify-compatible UI shape.
 */
export function mapProductToShopifyShape(backendProduct) {
  if (!backendProduct) return null;

  // If already matches Shopify structure closely, return or supplement
  const id = backendProduct.product_id || backendProduct.productId || backendProduct.id || backendProduct._id || `gid://shopify/Product/${backendProduct.identifier || Math.random().toString(36).substr(2, 9)}`;
  const title = backendProduct.product_title || backendProduct.product_name || backendProduct.productTitle || backendProduct.title || backendProduct.name || "Premium Khakhra";
  const handle = backendProduct.handle || backendProduct.slug || backendProduct.identifier || title.toLowerCase().replace(/\s+/g, "-");

  const basePrice = backendProduct.price || 100;
  const comparePrice = backendProduct.compareAtPrice || backendProduct.originalPrice || null;

  // Standardize featured image
  let rawFeatured =
    backendProduct.product_image ||
    backendProduct.productImage ||
    backendProduct.featuredImage ||
    backendProduct.featured_image ||
    backendProduct.image ||
    backendProduct.image_url ||
    backendProduct.featuredImageUrl ||
    backendProduct.images?.edges?.[0]?.node ||
    backendProduct.images?.nodes?.[0] ||
    (Array.isArray(backendProduct.images) ? backendProduct.images[0] : null) ||
    backendProduct.media?.[0];

  let featuredImage = null;
  if (rawFeatured) {
    let nodeObj = rawFeatured.node || rawFeatured;
    let urlStr = typeof nodeObj === "string" ? nodeObj : nodeObj.url || nodeObj.src || nodeObj.originalSrc || nodeObj.image_url || nodeObj.imageUrl || "";
    let altTextStr = typeof nodeObj === "string" ? title : nodeObj.altText || nodeObj.alt || title;
    let normalizedUrl = normalizeImageUrl(urlStr);
    if (normalizedUrl) {
      featuredImage = { url: normalizedUrl, altText: altTextStr };
    }
  }

  // Standardize images array
  let rawImagesArray = backendProduct.images?.edges || backendProduct.images?.nodes || backendProduct.images || [];
  let imagesEdges = [];
  if (Array.isArray(rawImagesArray)) {
    imagesEdges = rawImagesArray
      .map((img) => {
        let nodeObj = img.node || img;
        let urlStr = typeof nodeObj === "string" ? nodeObj : nodeObj.url || nodeObj.src || nodeObj.originalSrc || nodeObj.image_url || nodeObj.imageUrl || "";
        let altTextStr = typeof nodeObj === "string" ? title : nodeObj.altText || nodeObj.alt || title;
        let normalizedUrl = normalizeImageUrl(urlStr);
        return {
          node: {
            url: normalizedUrl,
            altText: altTextStr,
          },
        };
      })
      .filter((e) => e.node.url);
  }
  if (imagesEdges.length === 0 && featuredImage) {
    imagesEdges = [{ node: featuredImage }];
  }

  // Fallback to update featuredImage if missing but imagesEdges has nodes
  if (!featuredImage && imagesEdges.length > 0) {
    featuredImage = imagesEdges[0].node;
  }

  console.log(`DEBUG Mapped Product [${title}]:`, featuredImage ? `Featured URL: ${featuredImage.url}` : "NO FEATURED IMAGE FOUND");

  // Map variants safely
  let variantsArray = [];
  if (backendProduct.variants?.edges) {
    variantsArray = backendProduct.variants.edges.map(e => e.node);
  } else if (Array.isArray(backendProduct.variants) && backendProduct.variants.length > 0) {
    variantsArray = backendProduct.variants.map((v, idx) => {
      const vNode = v.node || v;
      // Extract actual variant ID favoring explicit variant ID fields
      let vId = vNode.id || vNode._id || vNode.variant_id || vNode.variantId || `${id}/Variant/${idx}`;
      if (String(vId) === String(id) && vNode.variant_id && String(vNode.variant_id) !== String(id)) {
        vId = vNode.variant_id;
      }
      const vPriceAmount = String(vNode.price?.amount || vNode.price || basePrice);
      const vNumericId = String(vId).split("/").pop();
      return {
        id: String(vId).includes("gid://") ? vId : `gid://shopify/ProductVariant/${vId}`,
        variantId: vNumericId,
        variant_id: vNumericId,
        title: vNode.title || vNode.name || "Default Title",
        availableForSale: vNode.availableForSale ?? vNode.available ?? (vNode.inventory_quantity !== undefined ? vNode.inventory_quantity > 0 : (vNode.inventoryQuantity !== undefined ? vNode.inventoryQuantity > 0 : (backendProduct.availableForSale ?? true))),
        quantityAvailable: vNode.quantityAvailable ?? vNode.stock ?? vNode.inventory_quantity ?? vNode.inventoryQuantity ?? backendProduct.inventory_quantity ?? backendProduct.inventoryQuantity ?? 100,
        price: {
          amount: vPriceAmount,
          currencyCode: vNode.price?.currencyCode || "INR",
        },
        compareAtPrice: vNode.compareAtPrice ? {
          amount: String(vNode.compareAtPrice.amount || vNode.compareAtPrice),
          currencyCode: vNode.compareAtPrice.currencyCode || "INR",
        } : comparePrice ? {
          amount: String(comparePrice?.amount || comparePrice),
          currencyCode: "INR",
        } : null,
        // Normalize weight into a numeric `weight` (kilograms) and set `weightUnit` to 'kg'
        weight: parseWeightToKg(
          vNode.weight ||
          vNode.weight_value ||
          vNode.weightValue ||
          vNode.weight_grams ||
          vNode.weightGrams ||
          vNode.min_weight ||
          vNode.minWeight ||
          backendProduct.min_weight ||
          backendProduct.weight ||
          backendProduct.weight_grams ||
          backendProduct.weightGrams ||
          vNode.title ||
          vNode.name ||
          backendProduct.title,
          vNode.weightUnit ||
          vNode.weight_unit ||
          vNode.weight_unit_name ||
          vNode.weightUnitName ||
          backendProduct.weight_unit ||
          backendProduct.weightUnit ||
          backendProduct.weight_unit_name ||
          backendProduct.weightUnitName,
        ),
        weightUnit: 'kg',
        selectedOptions: Array.isArray(vNode.selectedOptions) ? vNode.selectedOptions : [
          { name: "Weight", value: vNode.weight || vNode.title || "Standard" }
        ],
      };
    });
  } else if (backendProduct.defaultVariant || backendProduct.default_variant) {
    const dv = backendProduct.defaultVariant || backendProduct.default_variant;
    const dvId = dv.variant_id || dv.variantId || dv.id || dv._id || `${id.split("/").pop()}-default`;
    variantsArray = [{
      id: String(dvId).includes("gid://") ? dvId : `gid://shopify/ProductVariant/${dvId}`,
      title: dv.title || dv.name || "Default Title",
      availableForSale: dv.availableForSale ?? dv.available ?? (dv.inventory_quantity !== undefined ? dv.inventory_quantity > 0 : (dv.inventoryQuantity !== undefined ? dv.inventoryQuantity > 0 : (backendProduct.availableForSale ?? true))),
      quantityAvailable: dv.quantityAvailable ?? dv.stock ?? dv.inventory_quantity ?? dv.inventoryQuantity ?? backendProduct.inventory_quantity ?? backendProduct.inventoryQuantity ?? 100,
      price: { amount: String(dv.price?.amount || dv.price || basePrice), currencyCode: "INR" },
      compareAtPrice: dv.compareAtPrice ? { amount: String(dv.compareAtPrice?.amount || dv.compareAtPrice), currencyCode: "INR" } : null,
      // Normalized weight
      weight: parseWeightToKg(
        dv.weight ||
        dv.weight_value ||
        dv.weightValue ||
        dv.weight_grams ||
        dv.weightGrams ||
        dv.min_weight ||
        dv.minWeight ||
        backendProduct.min_weight ||
        backendProduct.weight ||
        backendProduct.weight_grams ||
        backendProduct.weightGrams ||
        dv.title ||
        dv.name ||
        backendProduct.title,
        dv.weightUnit ||
        dv.weight_unit ||
        dv.weight_unit_name ||
        dv.weightUnitName ||
        backendProduct.weight_unit ||
        backendProduct.weightUnit ||
        backendProduct.weight_unit_name ||
        backendProduct.weightUnitName,
      ),
      weightUnit: 'kg',
      selectedOptions: dv.selectedOptions || [{ name: "Weight", value: dv.weight || dv.title || "Standard" }]
    }];
  } else {
    // Generate default variant if none present, checking all top-level variant ID candidate properties
    const actualVariantId = backendProduct.default_variant_id || backendProduct.defaultVariantId || backendProduct.variant_id || backendProduct.variantId || `${id.split("/").pop()}-default`;
    variantsArray = [{
      id: `gid://shopify/ProductVariant/${actualVariantId}`,
      title: "Default Title",
      availableForSale: backendProduct.availableForSale ?? (backendProduct.inventory_quantity !== undefined ? backendProduct.inventory_quantity > 0 : (backendProduct.inventoryQuantity !== undefined ? backendProduct.inventoryQuantity > 0 : true)),
      quantityAvailable: backendProduct.quantityAvailable ?? backendProduct.stock ?? backendProduct.inventory_quantity ?? backendProduct.inventoryQuantity ?? 100,
      price: {
        amount: String(basePrice),
        currencyCode: "INR",
      },
      compareAtPrice: comparePrice ? {
        amount: String(comparePrice?.amount || comparePrice),
        currencyCode: "INR",
      } : null,
      // best-effort weight from top-level product
      weight: parseWeightToKg(
        backendProduct.min_weight ||
        backendProduct.weight ||
        backendProduct.weight_grams ||
        backendProduct.weightGrams ||
        backendProduct.title ||
        0,
        backendProduct.weight_unit ||
        backendProduct.weightUnit ||
        backendProduct.weight_unit_name ||
        backendProduct.weightUnitName,
      ),
      weightUnit: 'kg',
      selectedOptions: [{ name: "Title", value: "Default Title" }],
    }];
  }

  const defaultVariant = variantsArray[0] || null;

  return {
    ...backendProduct,
    id: String(id).includes("gid://") ? id : `gid://shopify/Product/${id}`,
    title,
    handle,
    vendor: backendProduct.vendor || backendProduct.brand || "Annapurna Khakhra",
    productType: backendProduct.productType || backendProduct.category || "Traditional Snack",
    tags: Array.isArray(backendProduct.tags) ? backendProduct.tags : typeof backendProduct.tags === "string" ? backendProduct.tags.split(",").map(t => t.trim()) : [],
    description: backendProduct.description || "",
    featuredImage: featuredImage?.url ? featuredImage : null,
    images: { edges: imagesEdges },
    madeWith: backendProduct.madeWith || backendProduct.made_with || null,
    flour: backendProduct.flour || null,
    section: backendProduct.section || null,
    collections: backendProduct.collections?.edges ? backendProduct.collections : {
      edges: Array.isArray(backendProduct.collections) ? backendProduct.collections.map(c => ({ node: mapCollectionToShopifyShape(c) })) : []
    },
    priceRange: backendProduct.priceRange?.minVariantPrice ? backendProduct.priceRange : {
      minVariantPrice: { amount: String(defaultVariant?.price?.amount || basePrice), currencyCode: "INR" },
      maxVariantPrice: { amount: String(defaultVariant?.price?.amount || basePrice), currencyCode: "INR" },
    },
    defaultVariant,
    variantId: defaultVariant?.id || null,
    quantityAvailable: defaultVariant?.quantityAvailable || 0,
    price: defaultVariant?.price || { amount: String(basePrice), currencyCode: "INR" },
    compareAtPrice: defaultVariant?.compareAtPrice || null,
    availableForSale: defaultVariant?.availableForSale ?? true,
    variants: {
      edges: variantsArray.map(v => ({ node: v })),
      nodes: variantsArray,
    },
  };
}

/**
 * Maps custom backend collection shapes safely.
 */
export function mapCollectionToShopifyShape(backendCollection) {
  if (!backendCollection) return null;
  const node = backendCollection.node || backendCollection;
  const id = node.id || node._id || `gid://shopify/Collection/${node.identifier || Math.random()}`;
  const mapped = {
    ...node,
    id: String(id).includes("gid://") ? id : `gid://shopify/Collection/${id}`,
    title: node.title || node.name || "",
    handle: node.handle || node.slug || node.identifier || "",
    description: node.description || "",
    image: (() => {
      const metafieldImage = node.metafields?.find(m => m.key === "image" || m.key === "featured_image")?.value;
      const img = node.image || node.featuredImage || node.featured_image || node.imageUrl || node.image_url || node.collection_image || metafieldImage;
      if (!img) return null;

      let urlStr = "";
      let altText = node.title || "";

      if (typeof img === "string") {
        urlStr = img;
      } else {
        urlStr = img.url || img.src || img.original_src || img.originalSrc || img.imageUrl || img.image_url || img.thumb || img.file?.url || img.asset?.url || "";
        altText = img.altText || img.alt || node.title || "";
      }

      const normalizedUrl = normalizeImageUrl(urlStr);
      return normalizedUrl ? { url: normalizedUrl, altText } : null;
    })(),
  };

  console.log("DEBUG: Mapped Collection:", mapped.title, mapped.image ? "HAS IMAGE" : "NO IMAGE");
  return mapped;
}

/**
 * Maps standard custom backend cart items to Shopify cart.lines.edges format.
 */
export function mapCartToShopifyShape(backendCart) {
  if (!backendCart) return null;

  // Unwrap nested backend data payloads seamlessly
  const actualCartObj = backendCart.data?.items ? backendCart.data : (backendCart.data || backendCart);
  const isArray = Array.isArray(actualCartObj);
  const cartId = isArray ? (actualCartObj[0]?.cart_token || "cart_default") : (actualCartObj.id || actualCartObj.cart_token || actualCartObj._id || "cart_default");

  let linesEdges = [];
  const items = isArray ? actualCartObj : (actualCartObj.items || actualCartObj.cart_items || actualCartObj.cartItems || actualCartObj.lineItems || actualCartObj.lines?.edges || []);

  if (Array.isArray(items)) {
    linesEdges = items.map((item, idx) => {
      // If already a shopify edge
      if (item.node?.merchandise) return item;

      const itemNode = item.node || item;
      const variantId = itemNode.variant_id || itemNode.variantId || itemNode.id;
      const mappedProduct = mapProductToShopifyShape(itemNode.product || itemNode);

      return {
        node: {
          id: itemNode.cart_item_id || itemNode.line_id || itemNode.id || `line_${idx}`,
          quantity: Number(itemNode.quantity) || 1,
          merchandise: {
            id: String(variantId).includes("gid://") ? variantId : `gid://shopify/ProductVariant/${variantId}`,
            title: itemNode.variant_title || itemNode.variantTitle || mappedProduct?.defaultVariant?.title || "Standard",
            price: {
              amount: String(itemNode.price || mappedProduct?.price?.amount || 0),
              currencyCode: "INR",
            },
            product: mappedProduct,
          },
        },
      };
    });
  }

  const totalAmount = linesEdges.reduce((sum, edge) => {
    return sum + (Number(edge.node.merchandise.price.amount) * edge.node.quantity);
  }, 0);

  return {
    ...actualCartObj,
    id: cartId,
    lines: {
      edges: linesEdges,
    },
    cost: {
      totalAmount: {
        amount: String(actualCartObj.total_amount || actualCartObj.totalAmount || totalAmount),
        currencyCode: "INR",
      },
      subtotalAmount: {
        amount: String(actualCartObj.subtotal_amount || actualCartObj.subtotalAmount || totalAmount),
        currencyCode: "INR",
      },
    },
    totalQuantity: linesEdges.reduce((sum, e) => sum + e.node.quantity, 0),
  };
}
