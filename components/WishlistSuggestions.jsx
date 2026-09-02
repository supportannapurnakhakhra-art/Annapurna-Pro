"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useWishlist } from "@/context/WishlistContext";
import HorizontalProductCard from "./HorizontalProductCard";

// Swiper styles
import "swiper/css";
import "swiper/css/pagination";

export default function WishlistSuggestions() {
    const { wishlist } = useWishlist();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggested = async () => {
            try {
                const res = await fetch("/api/wishlist-suggestions");
                const data = await res.json();
                if (data.success && Array.isArray(data.products)) {
                    setProducts(data.products);
                }
            } catch (err) {
                console.error("Failed to fetch wishlist suggestions", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSuggested();
    }, []);

    const wishlistIds = new Set((wishlist || []).map((p) => String(p.id)));
    const filteredProducts = (products || []).filter(
        (p) => !wishlistIds.has(String(p.id))
    ).slice(0, 10);

    if (loading || filteredProducts.length === 0) return null;

    return (
        <div className="mt-6 mb-6">
            <h3 className="text-sm font-bold text-[#7d4b0e] mb-4 px-4 uppercase tracking-wider">
                You May Also Like
            </h3>

            {/* Desktop Layout: One Column List */}
            <div className="hidden lg:flex flex-col gap-4 px-4">
                {filteredProducts.map((product) => (
                    <HorizontalProductCard
                        key={product.id}
                        product={product}
                        hideRemove={true}
                    />
                ))}
            </div>

            {/* Mobile Layout: Swiper Slider */}
            <div className="lg:hidden px-2">
                <Swiper
                    modules={[Autoplay, Pagination]}
                    spaceBetween={12}
                    slidesPerView={1.05}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                    }}
                    loop={filteredProducts.length > 1}
                    className="wishlist-swiper"
                >
                    {filteredProducts.map((product) => (
                        <SwiperSlide key={product.id} className="pb-2">
                            <HorizontalProductCard
                                product={product}
                                hideRemove={true}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <style jsx global>{`
                .wishlist-swiper {
                    padding-bottom: 10px !important;
                }
                .wishlist-swiper .swiper-slide {
                    height: auto !important;
                }
                .wishlist-swiper .swiper-pagination-bullet-active {
                    background: #7d4b0e !important;
                }
            `}</style>
        </div>
    );
}
