import PaymentSession from "@/lib/models/PaymentSession";
import { getAllProducts } from "@/lib/shopify";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    console.log("THANK YOU TOKEN:", token);

    if (!token) {
      return Response.json(
        { success: false, message: "Token missing" },
        { status: 400 }
      );
    }

    const session = await PaymentSession.findOne({ orderToken: token });

    if (!session) {
      return Response.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // ✅ Allow COD or PAID online orders only
    if (session.isCod !== true && session.status !== "PAID") {
      return Response.json(
        { success: false, message: "Payment not completed" },
        { status: 400 }
      );
    }

    const isPartialCod = session.isCod && session.bookingAmount > 0;
    const paidAmount = session.isCod ? (session.bookingAmount || 50) : session.amount;
    const pendingAmount = session.isCod ? Math.max(0, session.amount - paidAmount) : 0;

    // Fetch recommended products
    let recommendedProducts = [];
    try {
      const allProducts = await getAllProducts(250);
      recommendedProducts = allProducts
        .filter((p) => {
          if (!p.section) return false;

          try {
            // Shopify list metafields are often returned as JSON string arrays like '["Recommended", "Other"]'
            const sections = JSON.parse(p.section);
            if (Array.isArray(sections)) {
              return sections.some(s => s.trim().toLowerCase() === "recommended");
            }
          } catch (e) {
            // Fallback for single string value
            const sectionVal = p.section.toString().trim().toLowerCase();
            return sectionVal === "recommended";
          }
          return false;
        })
        .slice(0, 4);
    } catch (err) {
      console.error("Error fetching recommended products:", err);
    }

    // Map recommended products to only return necessary fields for ProductCard
    const mappedRecommended = recommendedProducts.map((p) => ({
      id: p.id,
      title: p.title,
      handle: p.handle,
      vendor: p.vendor || null,
      featuredImage: p.featuredImage ? { url: p.featuredImage.url, altText: p.featuredImage.altText || "" } : null,
      price: p.price || null,
      compareAtPrice: p.compareAtPrice || null,
      availableForSale: p.availableForSale !== false,
      defaultVariant: p.defaultVariant ? {
        id: p.defaultVariant.id,
        title: p.defaultVariant.title,
        price: p.defaultVariant.price,
        compareAtPrice: p.defaultVariant.compareAtPrice,
        availableForSale: p.defaultVariant.availableForSale !== false,
      } : null,
    }));

    // 🔐 Safe response
    return Response.json({
      success: true,
      order: {
        orderNumber: session.shopifyOrderName?.replace("#", "") || null,
        totalAmount: session.amount,
        paidAmount: paidAmount,
        pendingAmount: pendingAmount,
        currency: "INR",
        paymentMethod: session.isCod ? "COD" : "ONLINE",
        status: session.isCod ? (isPartialCod ? "PARTIALLY_PAID" : "CONFIRMED") : "PAID",
      },
      recommendedProducts: mappedRecommended,
    });

  } catch (err) {
    console.error("THANK YOU FETCH ERROR:", err);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

