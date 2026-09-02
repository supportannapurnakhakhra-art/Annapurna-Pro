import crypto from "crypto";
import PaymentSession from "@/lib/models/PaymentSession";
import { connectDB } from "@/lib/db";
import { completeDraftOrder, updateShopifyOrder } from "@/lib/shopify";

export async function POST(req) {
    try {
        const rawBody = await req.text();
        const body = JSON.parse(rawBody);
        const signature = req.headers.get("x-razorpay-signature");

        // 1. Verify Signature
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (secret) {
            const expectedSignature = crypto
                .createHmac("sha256", secret)
                .update(rawBody)
                .digest("hex");

            if (expectedSignature !== signature) {
                return Response.json({ success: false, message: "Invalid signature" }, { status: 400 });
            }
        }

        // 2. Process Event
        const { event, payload } = body;

        if (event === "order.paid") {
            const razorpayOrderId = payload.order.entity.id;
            const amountPaid = payload.order.entity.amount / 100;

            await connectDB();
            const session = await PaymentSession.findOne({ razorpayOrderId });

            if (session && session.status === "PENDING") {
                // Complete Draft Order
                const order = await completeDraftOrder(session.draftOrderId);

                if (session.isCod) {
                    // Partial COD logic
                    await updateShopifyOrder(order.id, {
                        tags: ["PARTIAL_COD_PAID"],
                        note: `Partial COD: Booking amount ₹${amountPaid} paid via Razorpay. Remaining amount to be collected on delivery.`,
                    });
                    session.status = "COD";
                } else {
                    // Normal Online Payment logic (if needed)
                    session.status = "PAID";
                }

                session.shopifyOrderId = order.id;
                session.shopifyOrderName = order.name;
                await session.save();

                console.log(`✅ Order ${order.name} completed via webhook for session ${session._id}`);
            }
        }

        return Response.json({ success: true });

    } catch (error) {
        console.error("WEBHOOK ERROR:", error);
        return Response.json({ success: false, message: error.message }, { status: 500 });
    }
}
