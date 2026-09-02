import LoginPage from "./LoginClient";

export const metadata = {
  title: "Login | Annapurna Khakhra",
  description: "Sign in to your Annapurna Khakhra account to manage orders and profile.",
  alternates: {
    canonical: '/auth/login',
  },
  robots: {
    index: false,
    follow: true,
  }
};

export default function Page() {
  return <LoginPage />;
}
