import PrivacyPolicy from "./PrivacyClient";

export const metadata = {
  title: "Privacy Policy | Your Data Security at Annapurna Khakhra",
  description: "How we protect your personal information when you shop for our traditional Gujarati masala khakhra snacks.",
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function Page() {
  return <PrivacyPolicy />;
}
