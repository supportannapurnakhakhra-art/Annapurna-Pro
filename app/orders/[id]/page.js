// import OrderDetailClient from "./OrderDetailClient";

// export const metadata = {
//   title: "Order Details | Annapurna Khakhra",
//   description: "Detailed view of your order including items, shipping, and payment status.",
//   alternates: {
//     canonical: '/orders',
//   },
//   robots: {
//     index: false,
//     follow: true,
//   }
// };

// export default function Page() {
//   return <OrderDetailClient />;
// }


"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Package, 
  Clock, 
  Truck, 
  CheckCircle, 
  ArrowLeft, 
  ShoppingBag, 
  CreditCard, 
  MapPin, 
  Tag, 
  AlertCircle 
} from "lucide-react";
import { apiClient } from "@/lib/api/client";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch order details
  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        // Fetch order details from the custom E-Commerce backend using the authenticated apiClient
        const res = await apiClient(`/api/shop/orders/${id}`, { method: "GET" });

        if (res.ok && res.data && res.data.success) {
          const dataOrder = res.data.data;
          
          const mapAddress = (addr) => {
            if (!addr) return null;
            return {
              first_name: addr.first_name || "",
              last_name: addr.last_name || "",
              address1: addr.address_line1 || addr.address1 || "",
              address2: addr.address_line2 || addr.address2 || "",
              city: addr.city || "",
              province: addr.state || addr.province || "",
              zip: addr.pincode || addr.zip || "",
              country: addr.country || "India",
              phone: addr.phone || "",
              email: addr.email || "",
            };
          };

          const mappedOrder = {
            id: dataOrder.id,
            orderNumber: dataOrder.order_number || `#${dataOrder.id}`,
            processedAt: dataOrder.placed_at || dataOrder.created_at,
            status: dataOrder.status || "pending",
            financialStatus: dataOrder.financial_status || "pending",
            fulfillmentStatus: dataOrder.fulfillment_status || "unfulfilled",
            currency: dataOrder.currency || "INR",
            subtotalPrice: parseFloat(dataOrder.subtotal_amount || 0).toFixed(2),
            discountAmount: parseFloat(dataOrder.discount_amount || 0).toFixed(2),
            taxAmount: parseFloat(dataOrder.tax_amount || 0).toFixed(2),
            shippingPrice: parseFloat(dataOrder.shipping_amount || 0).toFixed(2),
            totalPrice: parseFloat(dataOrder.total_amount || 0).toFixed(2),
            lineItems: (dataOrder.items || []).map((item) => ({
              id: item.id,
              title: item.product?.title || item.linked_product_title || item.title,
              variantTitle: item.variant?.title || item.linked_variant_title || "Default",
              sku: item.variant?.sku || item.linked_variant_sku || item.sku || "N/A",
              quantity: item.quantity,
              price: item.price,
              total: parseFloat(item.total_amount || (parseFloat(item.price || 0) * item.quantity)).toFixed(2),
              imageUrl: item.image_url || item.linked_product_image_url || item.product?.image_url || null,
            })),
            shippingAddress: mapAddress(dataOrder.shipping_address || (dataOrder.addresses || []).find(a => a.address_type === "shipping")),
            billingAddress: mapAddress(dataOrder.billing_address || (dataOrder.addresses || []).find(a => a.address_type === "billing")),
            shipments: dataOrder.shipments || [],
            latestShipment: dataOrder.latest_shipment || null,
          };
          
          setOrder(mappedOrder);
        } else {
          alert("Order not found!");
          router.push("/profile");
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfbf7] px-4">
        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#7d4b0e] animate-pulse text-center">
          Loading Order Details...
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      {/* Premium Header Banner */}
      <header
        className="relative h-48 sm:h-56 md:h-64 bg-cover bg-center"
        style={{ backgroundImage: "url('https://cdn.shopify.com/s/files/1/0953/6284/2993/files/b5.png?v=1770090995')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#2d1804]/80 to-[#2d1804]/40"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-center tracking-wide">
            Order Details
          </h1>
          <p className="text-base sm:text-lg md:text-xl mt-2 sm:mt-3 text-amber-200 tracking-wider">
            Order {order.orderNumber}
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#7d4b0e] hover:text-[#cc760e] mb-6 font-semibold text-sm sm:text-base cursor-pointer group transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Orders
        </button>

        {/* Main Details Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-amber-100 p-5 sm:p-6 md:p-8 lg:p-12 mb-8 sm:mb-9 md:mb-10">
          
          {/* Header Info Grid */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-amber-100 pb-8 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-[#7d4b0e]">
                Order {order.orderNumber}
              </h2>
              <p className="text-sm sm:text-base text-amber-700 mt-2 flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4 text-[#cc760e]" />
                Placed on{" "}
                {new Date(order.processedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Badges Stack */}
            <div className="flex flex-wrap gap-3">
              {/* Financial Status Badge */}
              <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-sm border ${
                order.financialStatus.toLowerCase() === "paid"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : order.financialStatus.toLowerCase() === "pending"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}>
                <CreditCard className="w-4 h-4" />
                <span className="capitalize">Payment: {order.financialStatus}</span>
              </div>

              {/* Fulfillment Status Badge */}
              <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-sm border ${
                order.fulfillmentStatus.toLowerCase() === "fulfilled" || order.status.toLowerCase() === "shipped"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : order.fulfillmentStatus.toLowerCase() === "unfulfilled"
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-blue-50 text-blue-800 border-blue-200"
              }`}>
                <Truck className="w-4 h-4" />
                <span className="capitalize">
                  Status: {order.status === "shipped" ? "Shipped" : order.fulfillmentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Tracking Section */}
          {order.latestShipment && (
            <div className="border-b border-amber-100 pb-8 mb-8">
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-[#7d4b0e] mb-6 flex items-center gap-2">
                <Truck className="w-6 h-6 text-[#cc760e]" />
                Delivery & Tracking Details
              </h3>

              <div className="bg-amber-50/30 rounded-2xl p-5 sm:p-6 md:p-8 border border-amber-100/60 shadow-sm animate-fade-in">
                {/* Tracking Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-xs">
                    <p className="text-xs text-amber-700/80 font-semibold uppercase tracking-wider">Courier Partner</p>
                    <p className="text-lg font-bold text-gray-800 mt-1 capitalize">
                      {order.latestShipment.carrier || "MegaShip Delivery"}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-xs">
                    <p className="text-xs text-amber-700/80 font-semibold uppercase tracking-wider">Tracking Number</p>
                    <p className="text-lg font-mono font-bold text-[#7d4b0e] mt-1 select-all">
                      {order.latestShipment.tracking_number || "Awaiting Update..."}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-xs">
                    <p className="text-xs text-amber-700/80 font-semibold uppercase tracking-wider">Shipment ID</p>
                    <p className="text-lg font-bold text-gray-800 mt-1">
                      {order.latestShipment.shipment_number || `MS-${order.id}`}
                    </p>
                  </div>
                </div>

                {/* Timeline Progress */}
                <div className="relative mt-8 mb-6">
                  {/* Progress Line Background */}
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-amber-100 -translate-y-1/2 rounded-full hidden sm:block"></div>
                  
                  {/* Active Progress Line */}
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-1000 hidden sm:block"
                    style={{ 
                      width: order.latestShipment.status?.toLowerCase() === "delivered" 
                        ? "100%" 
                        : order.latestShipment.status?.toLowerCase() === "shipped" 
                        ? "50%" 
                        : "0%" 
                    }}
                  ></div>

                  {/* Steps Grid */}
                  <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
                    {/* Step 1: Order Placed */}
                    <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-left sm:text-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md border-4 border-white">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-gray-800">Order Placed</h4>
                        <p className="text-xs text-amber-700 mt-0.5">
                          {new Date(order.processedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>

                    {/* Step 2: Shipped */}
                    <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-left sm:text-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md border-4 border-white transition-colors duration-500 ${
                        ["shipped", "delivered"].includes(order.latestShipment.status?.toLowerCase())
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm sm:text-base ${
                          ["shipped", "delivered"].includes(order.latestShipment.status?.toLowerCase()) ? "text-gray-800" : "text-gray-400"
                        }`}>Shipped</h4>
                        <p className="text-xs text-amber-700 mt-0.5">
                          {order.latestShipment.shipped_at 
                            ? new Date(order.latestShipment.shipped_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                            : ["shipped", "delivered"].includes(order.latestShipment.status?.toLowerCase()) ? "In Transit" : "Pending Shipment"
                          }
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Delivered */}
                    <div className="flex sm:flex-col items-center gap-4 sm:gap-2 text-left sm:text-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md border-4 border-white transition-colors duration-500 ${
                        order.latestShipment.status?.toLowerCase() === "delivered"
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm sm:text-base ${
                          order.latestShipment.status?.toLowerCase() === "delivered" ? "text-gray-800" : "text-gray-400"
                        }`}>Delivered</h4>
                        <p className="text-xs text-amber-700 mt-0.5">
                          {order.latestShipment.delivered_at 
                            ? new Date(order.latestShipment.delivered_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                            : "Pending Delivery"
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tracking Action Button */}
                
              </div>
            </div>
          )}

          {/* Tracking Section for Shipped/Fulfilled Orders without Shipment Record */}
          {!order.latestShipment && (order.status?.toLowerCase() === "shipped" || order.fulfillmentStatus?.toLowerCase() === "fulfilled") && (
            <div className="border-b border-amber-100 pb-8 mb-8">
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-[#7d4b0e] mb-6 flex items-center gap-2">
                <Truck className="w-6 h-6 text-[#cc760e]" />
                Delivery & Tracking Details
              </h3>
              <div className="bg-amber-50/20 rounded-2xl p-5 sm:p-6 md:p-8 border border-amber-100/60 shadow-sm animate-fade-in">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-100 rounded-xl text-amber-800 flex-shrink-0">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">Shipment is on the way!</h4>
                    <p className="text-sm sm:text-base text-amber-900/80 mt-1 leading-relaxed">
                      Your order has been hand-packed with care and is preparing for transit. Our delivery partner will assign tracking details shortly. Check back soon for your real-time tracking links!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Items Section */}
          <div className="border-b border-amber-100 pb-8">
            <h3 className="text-xl sm:text-2xl font-bold font-heading text-[#7d4b0e] mb-6 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-[#cc760e]" />
              Order Items
            </h3>

            <div className="space-y-4 sm:space-y-5 md:space-y-6">
              {order.lineItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-amber-50/40 hover:bg-amber-50/80 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border border-amber-100/50 gap-4 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4 sm:gap-5 md:gap-6 w-full sm:w-auto">
                    {/* Item Image with fallbacks */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-lg sm:rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-amber-200/60 shadow-sm relative">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-amber-700/60" />
                      )}
                      {/* Quantity Tag */}
                      <span className="absolute -bottom-1.5 -right-1.5 bg-[#7d4b0e] text-white text-xs font-bold w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                        {item.quantity}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base sm:text-lg md:text-xl text-gray-800 break-words group-hover:text-[#7d4b0e] transition-colors duration-300">
                        {item.title}
                      </h4>
                      
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {item.variantTitle && item.variantTitle !== "Default" && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100/80 text-amber-900 border border-amber-200/50">
                            {item.variantTitle}
                          </span>
                        )}
                        {item.sku && item.sku !== "N/A" && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200/50 font-mono">
                            SKU: {item.sku}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right w-full sm:w-auto sm:pl-4">
                    <p className="text-xl sm:text-2xl font-extrabold text-[#7d4b0e]">
                      ₹{parseFloat(item.total || 0).toFixed(2)}
                    </p>
                    <p className="text-xs sm:text-sm text-amber-700 mt-0.5 font-medium">
                      ₹{parseFloat(item.price || 0).toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
            
            {/* Payment Method / Summary */}
            <div className="bg-amber-50/20 border border-amber-100 rounded-xl sm:rounded-2xl p-5 sm:p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-[#cc760e]" />
                <h4 className="font-bold text-base sm:text-lg text-gray-800">Payment & Note Info</h4>
              </div>
              <p className="text-sm sm:text-base text-amber-900/80 leading-relaxed">
                All transactions are encrypted and processed securely. For cash-on-delivery orders, please pay at the time of delivery. If you need any assistance with your order, feel free to contact our support team.
              </p>
            </div>

            {/* Calculations Breakdown */}
            <div className="bg-gradient-to-r from-amber-50/40 to-orange-50/40 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-amber-200/60 shadow-sm">
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base md:text-lg font-medium text-amber-900/90">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-800">₹{order.subtotalPrice}</span>
                </div>

                {parseFloat(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-4 h-4" /> Discount
                    </span>
                    <span>-₹{order.discountAmount}</span>
                  </div>
                )}

                {parseFloat(order.taxAmount) > 0 && (
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="font-semibold text-gray-800">₹{order.taxAmount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-gray-800">₹{order.shippingPrice}</span>
                </div>

                <div className="flex justify-between text-xl sm:text-2xl font-extrabold pt-3 sm:pt-4 border-t border-amber-200">
                  <span className="text-[#7d4b0e]">Total</span>
                  <span className="text-[#7d4b0e]">₹{order.totalPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Addresses Grid (Side by side on desktop) */}
          {(order.shippingAddress || order.billingAddress) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-8 pt-8 border-t border-amber-100">
              
              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="bg-gradient-to-r from-orange-50/30 to-amber-50/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-amber-100 border-l-4 border-l-[#7d4b0e]">
                  <p className="font-bold text-lg sm:text-xl text-[#7d4b0e] mb-4 flex items-center gap-2 font-heading">
                    <Truck className="w-5 h-5 text-[#cc760e]" /> Delivery Address
                  </p>
                  <p className="text-amber-950 leading-relaxed text-sm sm:text-base font-medium">
                    <strong>{order.shippingAddress.first_name} {order.shippingAddress.last_name}</strong>
                    <br />
                    <span className="opacity-80">
                      {order.shippingAddress.address1}
                      {order.shippingAddress.address2 && `, ${order.shippingAddress.address2}`}
                      <br />
                      {order.shippingAddress.city}, {order.shippingAddress.province} - {order.shippingAddress.zip}
                      <br />
                      {order.shippingAddress.country}
                    </span>
                    <br />
                    <span className="block mt-3 text-xs sm:text-sm text-amber-900 font-semibold">
                      Phone: <span className="font-mono font-bold text-gray-800">{order.shippingAddress.phone}</span>
                    </span>
                  </p>
                </div>
              )}

              {/* Billing Address */}
              {order.billingAddress && (
                <div className="bg-gradient-to-r from-amber-50/30 to-orange-50/30 rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 border border-amber-100 border-l-4 border-l-[#cc760e]">
                  <p className="font-bold text-lg sm:text-xl text-[#cc760e] mb-4 flex items-center gap-2 font-heading">
                    <MapPin className="w-5 h-5 text-[#7d4b0e]" /> Billing Address
                  </p>
                  <p className="text-amber-950 leading-relaxed text-sm sm:text-base font-medium">
                    <strong>{order.billingAddress.first_name} {order.billingAddress.last_name}</strong>
                    <br />
                    <span className="opacity-80">
                      {order.billingAddress.address1}
                      {order.billingAddress.address2 && `, ${order.billingAddress.address2}`}
                      <br />
                      {order.billingAddress.city}, {order.billingAddress.province} - {order.billingAddress.zip}
                      <br />
                      {order.billingAddress.country}
                    </span>
                    <br />
                    <span className="block mt-3 text-xs sm:text-sm text-amber-900 font-semibold">
                      Phone: <span className="font-mono font-bold text-gray-800">{order.billingAddress.phone}</span>
                    </span>
                  </p>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Action Button */}
        <div className="text-center py-4">
          <a
            href="/"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#7d4b0e] to-[#a0682a] text-white px-8 sm:px-10 md:px-12 py-3.5 sm:py-4 rounded-full text-base sm:text-lg font-bold shadow-lg hover:shadow-2xl hover:bg-[#a0682a] transition-all duration-300 transform hover:scale-105"
          >
            Continue Shopping
          </a>
        </div>

      </div>
    </div>
  );
} 