import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const SHOPFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPFRONT_TOKEN ;

export async function PUT(request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");

    const payload = {
      first_name: body.first_name || body.firstName || "",
      last_name: body.last_name || body.lastName || "",
      email: body.email || "",
    };
    if (body.phone) {
      payload.phone = body.phone;
    }

    const headers = {
      "Content-Type": "application/json",
      "X-Shopfront-Token": SHOPFRONT_TOKEN,
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/api/shop/customer/profile`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}