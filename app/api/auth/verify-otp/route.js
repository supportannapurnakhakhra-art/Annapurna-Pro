import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const SHOPFRONT_TOKEN = process.env.NEXT_PUBLIC_SHOPFRONT_TOKEN;

export async function POST(request) {
  try {
    const body = await request.json();
    const phone = String(body.phone || "").trim().replace(/\D/g, "").slice(-10);
    const otp = String(body.otp || body.enteredOtp || "").trim();

    const payload = { phone, otp };
    if (body.cart_token || body.guestCartId) {
      payload.cart_token = body.cart_token || body.guestCartId;
    }

    const res = await fetch(`${BACKEND_URL}/api/shop/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopfront-Token": SHOPFRONT_TOKEN,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("verify-otp error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
