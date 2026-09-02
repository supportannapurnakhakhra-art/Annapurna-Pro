import { getAllProducts } from "@/lib/shopify";
import ProductsViewClient from "@/components/ProductsViewClient";
import { notFound } from "next/navigation";

const FLOUR_MAP = {
    Wheat: "Wheat",
    Ragi: "Ragi",
    Bajri: "Bajri (Bajra)",
    Juvar: "Juvar (Jowar)",
    Jav: "Jav (Barley)",
    Mag: "Mag",
    Chana: "Chana",
    Makai: "Makai",
    Farali: "Farali",
};

export async function generateMetadata({ params }) {
    const { handle } = await params;
    const title = FLOUR_MAP[handle] || handle;
    return {
        title: `${title} Flour Products | Fresh & Healthy Atta`,
        description: `Explore our range of premium ${title} flour products. Freshly grounded and packed with nutrition.`,
        alternates: {
            canonical: `/flour/${handle}`,
        }
    };
}

export default async function FlourPage({ params }) {
    const { handle } = await params;
    const fullTitle = FLOUR_MAP[handle] || handle;

    if (!handle) notFound();

    // Fetch all products
    const products = await getAllProducts();

    // Filter products by flour metafield
    const filteredProducts = products.filter(p => {
        if (!p.flour) return false;
        return p.flour.toLowerCase() === handle.toLowerCase();
    });

    return (
        <div className="pt-0">
            <ProductsViewClient
                products={filteredProducts}
                collectionTitle={`${fullTitle} Flour Specials`}
            />
        </div>
    );
}
