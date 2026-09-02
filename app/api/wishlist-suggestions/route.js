import { NextResponse } from "next/server";
import { getProducts } from "@/lib/api/services";

export async function GET() {
  try {
    const products = await getProducts({ limit: 50 });

    return NextResponse.json({
      success: true,
      products: products || [],
    });
  } catch (error) {
    console.error("WISHLIST SUGGESTIONS API ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
