import ProfilePage from "./ProfileClient";

export const metadata = {
  title: "Your Profile | Annapurna Khakhra",
  description: "Manage your account, addresses, and order history at Annapurna Khakhra.",
  alternates: {
    canonical: '/profile',
  },
  robots: {
    index: false,
    follow: true,
  }
};

export default function Page() {
  return <ProfilePage />;
}
