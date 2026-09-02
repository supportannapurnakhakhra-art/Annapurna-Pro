import RegisterPage from "./RegisterClient";

export const metadata = {
  title: "Create Account | Join Annapurna Khakhra",
  description: "Register for an account at Annapurna Khakhra for a faster checkout experience and to track your orders.",
  alternates: {
    canonical: '/auth/register',
  },
  robots: {
    index: false,
    follow: true,
  }
};

export default function Page() {
  return <RegisterPage />;
}
