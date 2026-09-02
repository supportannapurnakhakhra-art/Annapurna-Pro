import AddressesPage from "./AddressesClient";

export const metadata = {
  title: "My Addresses | Annapurna Khakhra",
  description: "Manage your shipping and billing addresses for Annapurna Khakhra.",
  alternates: {
    canonical: '/order-history/addresses',
  },
  robots: {
    index: false,
    follow: true,
  }
};

export default function Page() {
  return <AddressesPage />;
}
