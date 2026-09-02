import OrderHistoryPage from "./OrderHistoryClient";

export const metadata = {
  title: "Your Order History | Annapurna Khakhra",
  description: "View and track your past orders of traditional Gujarati khakhra.",
  alternates: {
    canonical: '/order-history',
  },
  robots: {
    index: false,
    follow: true,
  }
};

export default function Page() {
  return <OrderHistoryPage />;
}
