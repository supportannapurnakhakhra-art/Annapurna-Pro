import FAQSection from "./FAQClient";

export const metadata = {
  title: "Frequently Asked Questions | Annapurna Khakhra Help",
  description: "Find answers to common questions about our traditional Gujarati khakhra, ingredients, shipping, and more. Annapurna Khakhra - Pure and Authentic.",
  alternates: {
    canonical: '/faq',
  },
};

export default function Page() {
  return <FAQSection />;
}
