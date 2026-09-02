import ShippingPolicy from "./ShippingClient";

export const metadata = {
  title: "Shipping Policy | Annapurna Khakhra | Gujarati Khakhra Delivery",
  description: "Details about how we deliver our fresh, traditional khakhra across India. Annapurna Khakhra - from our home to yours.",
  alternates: {
    canonical: '/shipping-policy',
  },
};

export default function Page() {
  return <ShippingPolicy />;
}
