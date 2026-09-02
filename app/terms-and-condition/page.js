import TermsAndConditions from "./TermsClient";

export const metadata = {
  title: "Terms and Conditions | Annapurna Khakhra | Traditional Snacks",
  description: "Read the terms and conditions for ordering Annapurna Khakhra. Our commitment to providing authentic Gujarati khakhra with trust and quality.",
  alternates: {
    canonical: '/terms-and-condition',
  },
};

export default function Page() {
  return <TermsAndConditions />;
}
