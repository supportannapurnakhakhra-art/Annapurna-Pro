import crypto from "crypto";
import PaymentSession from "@/lib/models/PaymentSession";
import { completeDraftOrder, markShopifyOrderPaid, updateShopifyOrder, createOrderTransaction } from "@/lib/shopify";
import { connectDB } from "@/lib/db";


function generateOrderToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    console.log("VERIFYING PAYMENT:", { razorpay_order_id, razorpay_payment_id });

    // 🔐 Safety check
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return Response.json(
        { success: false, message: "Missing Razorpay fields" },
        { status: 400 }
      );
    }

    // 🔐 Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      console.error("SIGNATURE VERIFICATION FAILED");
      return Response.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    // 1️⃣ Get payment session
    // We search without the "PENDING" restriction first to handle race conditions with webhook
    let session = await PaymentSession.findOne({
      razorpayOrderId: razorpay_order_id
    });

    if (!session) {
      console.error("SESSION NOT FOUND FOR ORDER ID:", razorpay_order_id);
      return Response.json(
        { success: false, message: "Payment session not found" },
        { status: 404 }
      );
    }

    // If already processed (by webhook), return success immediately
    if (session.status === "PAID" || session.status === "COD") {
      console.log("PAYMENT ALREADY PROCESSED BY WEBHOOK:", session.status);
      return Response.json({
        success: true,
        token: session.orderToken,
      });
    }

    // 2️⃣ Complete Shopify Draft Order
    const order = await completeDraftOrder(session.draftOrderId);

    if (!order?.id) {
      throw new Error("Shopify order completion failed");
    }

    const customAttributes = [
      { key: "Razorpay Order ID", value: razorpay_order_id },
      { key: "Razorpay Payment ID", value: razorpay_payment_id },
    ];

    if (session.isCod) {
      // Partial COD logic: Record transaction for the booking amount
      const bookingAmt = session.bookingAmount || 50;

      await createOrderTransaction(order.id, bookingAmt, "Razorpay", razorpay_payment_id);

      await updateShopifyOrder(order.id, {
        tags: ["PARTIAL_COD_PAID"],
        note: `Partial COD Payment Success.
Razorpay Order ID: ${razorpay_order_id}
Razorpay Payment ID: ${razorpay_payment_id}
Booking amount ₹${bookingAmt} paid via Razorpay. 
Remaining balance to be collected on delivery.`,
        customAttributes,
      });
      session.status = "COD";
    } else {
      // Normal online order: Record full amount as SALE transaction
      await createOrderTransaction(order.id, session.amount, "Razorpay", razorpay_payment_id);

      // Update note and custom attributes
      await updateShopifyOrder(order.id, {
        note: `Full Online Payment Success.
Razorpay Order ID: ${razorpay_order_id}
Razorpay Payment ID: ${razorpay_payment_id}`,
        customAttributes,
      });
      session.status = "PAID";
    }

    const orderToken = session.orderToken || generateOrderToken();

    // update session
    session.razorpayPaymentId = razorpay_payment_id;
    session.shopifyOrderId = order.id;
    session.shopifyOrderName = order.name;
    session.orderToken = orderToken;

    await session.save();

    console.log("PAYMENT VERIFICATION SUCCESSFUL:", order.name);

    return Response.json({
      success: true,
      token: orderToken,
    });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);

    return Response.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}
// import dbConnect from "@/lib/db";

// export async function POST(req) {
//     await dbConnect();
//   const body = await req.json();

//   const {
//     razorpay_order_id,
//     razorpay_payment_id,
//     razorpay_signature,
//   } = body;

//   const generatedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//     .update(razorpay_order_id + "|" + razorpay_payment_id)
//     .digest("hex");

//   if (generatedSignature !== razorpay_signature) {
//     return Response.json({ success: false }, { status: 400 });
//   }

//   // 1️⃣ Get payment session
//   const session = await PaymentSession.findOne({
//     razorpayOrderId: razorpay_order_id,
//   });

//   if (!session) {
//     return Response.json({ success: false }, { status: 404 });
//   }

//   // 2️⃣ Complete Draft Order
//   const order = await completeDraftOrder(session.draftOrderId);

//   // 3️⃣ Update DB
//   session.status = "PAID";
//   session.razorpayPaymentId = razorpay_payment_id;
//   session.shopifyOrderId = order.id;
//   session.shopifyOrderName = order.name;
//   await session.save();

//   return Response.json({
//     success: true,
//     orderId: order.name.replace("#", ""),
//   });
// }




