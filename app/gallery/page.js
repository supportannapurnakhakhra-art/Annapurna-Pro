import KhakhraGallery from "./GalleryClient";

export const metadata = {
  title: "Annapurna Khakhra Gallery | Traditional Gujarati Snack Making",
  description: "View our gallery of authentic Gujarati khakhra making. See the care and tradition that goes into every Annapurna Masala Khakhra.",
  alternates: {
    canonical: '/gallery',
  },
};

export default function Page() {
  return <KhakhraGallery />;
}
