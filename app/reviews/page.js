import ReviewsPage from "./ReviewsClient";

export const metadata = {
  title: "Customer Reviews | What People Say | Annapurna Khakhra",
  description: "Read authentic reviews from our customers about their favorite traditional Gujarati khakhra.",
  alternates: {
    canonical: '/reviews',
  },
};

export default function Page() {
  return <ReviewsPage />;
}
