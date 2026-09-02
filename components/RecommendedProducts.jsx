"use client";

import ProductCard from "./ProductCard";

export default function RecommendedProducts({ products }) {
    if (!products || products.length === 0) return null;

    return (
        <section className="md:mt-6 mt-2 md:p-5 p-0">
            <div className="px-2 flex flex-col items-center md:mb-10 mb-4 text-center">
                {/* <span className="text-amber-600 font-bold tracking-widest uppercase text-sm mb-2">
                    Handpicked for you
                </span> */}
                <h2 className="text-2xl md:text-5xl font-black text-[#7d4b0e]">
                    Recommended For You
                </h2>
                {/* <div className="w-24 h-1.5 bg-orange-400 rounded-full mt-4"></div> */}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-4">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>
    );
}
