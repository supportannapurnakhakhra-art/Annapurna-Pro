
import Razorpay from "razorpay";

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID) {
    throw new Error("RAZORPAY_KEY_ID missing");
  }

  if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET) {
    throw new Error("RAZORPAY_KEY_SECRET missing");
  }

  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    key_secret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET,
  });
}

export async function createRazorpayOrder(data) {
  const razorpay = getRazorpay();
  return razorpay.orders.create(data);
}
// import Razorpay from "razorpay";

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// console.log("Razorpay initialized with Key ID:", process.env.RAZORPAY_KEY_ID);
// console.log("Razorpay initialized with Key Secret:", process.env.RAZORPAY_KEY_SECRET );
// export async function createRazorpayOrder({ amount, receipt }) {
//   try {
//     const order = await razorpay.orders.create({
//       amount,
//       currency: "INR",
//       receipt,
//       payment_capture: 1,
//     });

//     return order;
//   } catch (error) {
//     console.error("RAZORPAY ORDER ERROR:", error);
//     throw new Error("Failed to create Razorpay order");
//   }
// }





// import Razorpay from "razorpay";

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// console.log("Razorpay initialized with Key ID:", process.env.RAZORPAY_KEY_ID);
// console.log("Razorpay initialized with Key Secret:", process.env.RAZORPAY_KEY_SECRET );
// export async function createRazorpayOrder({ amount, receipt }) {
//   try {
//     const order = await razorpay.orders.create({
//       amount,
//       currency: "INR",
//       receipt,
//       payment_capture: 1,
//     });

//     return order;
//   } catch (error) {
//     console.error("RAZORPAY ORDER ERROR:", error);
//     throw new Error("Failed to create Razorpay order");
//   }
// }



