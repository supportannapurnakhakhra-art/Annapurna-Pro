"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, Star, Heart } from "lucide-react";
import ProductModal from "./ProductModal";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

import shopServices from "@/lib/api/services";
import {
    buildCheckoutItem,
    getProductImageUrl,
} from "@/lib/checkoutItemMapper";

export default function ProductCard({ product }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalProduct, setModalProduct] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const averageRating = product.avg_rating || 0;
    const reviewCount = product.total_reviews || 0;
    const { toggleWishlist, isInWishlist } = useWishlist();
    const isWishlisted = isInWishlist(product.id);
    const { addToCartAndOpen, buyNow } = useCart();
    const rawImgUrl = getProductImageUrl(product);

    /* ---------------- HANDLERS ---------------- */
    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const customerJwt = localStorage.getItem("userToken");
        if (!customerJwt) {
            window.dispatchEvent(new Event("open-login-modal"));
            return;
        }

        toggleWishlist(product);
    };

    const handleViewClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        setModalLoading(true);
        try {
            const fetchedProduct = await shopServices.getProductByIdentifier(product.handle || product.id);
            setModalProduct(fetchedProduct);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch product details:", error);
            setModalProduct(product);
            setIsModalOpen(true);
        } finally {
            setModalLoading(false);
        }
    };

    const resolveCheckoutItem = async () => {
        let checkoutItem = buildCheckoutItem(product, null, rawImgUrl);

        if (checkoutItem.needsVariantHydration) {
            try {
                const fullProduct = await shopServices.getProductByIdentifier(
                    product.handle || product.id,
                );
                if (fullProduct) {
                    const fullVariant =
                        fullProduct.variants?.edges?.[0]?.node ||
                        fullProduct.variants?.nodes?.[0] ||
                        fullProduct.defaultVariant;
                    if (fullVariant) {
                        checkoutItem = buildCheckoutItem(fullProduct, fullVariant, rawImgUrl);
                    }
                }
            } catch (err) {
                console.error("Dynamic variant hydration failed:", err);
            }
        }

        const { needsVariantHydration, ...item } = checkoutItem;
        return item;
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (typeof window !== "undefined") {
            if (window.fbq) window.fbq("track", "AddToCart", { content_name: product.title, content_ids: [product.id], content_type: "product", value: Number(price), currency: "INR" });
            if (window.gtag) window.gtag("event", "add_to_cart", { content_name: product.title, content_ids: [product.id], content_type: "product", value: Number(price), currency: "INR" });
        }
        const item = await resolveCheckoutItem();
        await addToCartAndOpen(item, 1);
    };

    const handleBuyNow = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (typeof window !== "undefined") {
            if (window.fbq) window.fbq("track", "AddToCart", { content_name: product.title, content_ids: [product.id], content_type: "product", value: Number(price), currency: "INR" });
            if (window.fbq) window.fbq("track", "InitiateCheckout", { content_name: product.title, content_ids: [product.id], content_type: "product", value: Number(price), currency: "INR" });
            
            if (window.gtag) window.gtag("event", "add_to_cart", { content_name: product.title, content_ids: [product.id], content_type: "product", value: Number(price), currency: "INR" });
            if (window.gtag) window.gtag("event", "begin_checkout", { content_name: product.title, content_ids: [product.id], content_type: "product", value: Number(price), currency: "INR" });
        }
        const item = await resolveCheckoutItem();
        await buyNow(item, 1);
    };

    /* ---------------- PRICE ---------------- */
    const price = Number(product?.price?.amount || product?.priceRange?.minVariantPrice?.amount || product?.price || 0);
    const compareAt = Number(product?.compareAtPrice?.amount || product?.compareAtPrice || 0);
    const hasDiscount = compareAt > price;

    const discountPercent = hasDiscount
        ? Math.round(((compareAt - price) / compareAt) * 100)
        : 0;

    // Deeply robust availability evaluation checking explicit custom backend stock counters and status flags
    const rawStockCount = product?.quantityAvailable ?? product?.stock ?? product?.quantity ?? product?.defaultVariant?.quantityAvailable ?? 100;
    const isExplicitlyUnavailable = product?.availableForSale === false || product?.is_available === false || product?.available === false || product?.status === "out_of_stock";
    const isOutOfStock = isExplicitlyUnavailable && rawStockCount <= 0;

    /* ---------------- STARS ---------------- */
    const displayRating = reviewCount === 0 ? 5 : averageRating;
    const vendorName = product?.vendor || product?.brand || "Annapurna Khakhra";

    return (
        <>
            <Link href={`/product/${product?.handle || product?.id}`} className="cursor-auto flex h-full">
                <motion.div className="bg-white/90 backdrop-blur-md border border-white/30 hover:shadow-2xl rounded-3xl overflow-hidden px-1 md:px-3 pb-3 md:pb-6 pt-1 md:pt-3 group flex flex-col h-full w-full">
                    {/* IMAGE */}
                    <div className="relative h-[170px] md:h-[240px] overflow-hidden rounded-xl md:rounded-2xl mt-1 md:mt-3">
                        {hasDiscount && (
                            <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                                {discountPercent}% OFF
                            </span>
                        )}

                        <button
                            onClick={handleWishlistClick}
                            className="absolute top-3 right-3 z-20 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-all cursor-pointer group/heart"
                        >
                            <Heart
                                className={`w-4 h-4 md:w-5 h-5 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600 group-hover/heart:text-red-400"
                                    }`}
                            />
                        </button>

                        {rawImgUrl ? (
                            <Image
                                src={rawImgUrl}
                                alt={product?.title || "Khakhra"}
                                unoptimized
                                fill
                                sizes="(max-width: 768px) 100vw, 25vw"
                                className="object-cover rounded-2xl group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-2xl text-xs text-gray-500 font-medium">
                                No Image
                            </div>
                        )}
                    </div>

                    {/* INFO */}
                    <div className="mt-1 md:mt-4 flex flex-col flex-1">
                        <h6 className="text-gray-600 text-xs md:text-sm">{vendorName}</h6>

                        <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    className={`w-3 h-3 md:w-4 md:h-4 ${s <= Math.round(displayRating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-gray-200 text-gray-200"
                                        }`}
                                />
                            ))}
                            {reviewCount > 0 && (
                                <span className="text-xs md:text-sm text-gray-600">
                                    {averageRating.toFixed(1)} ({reviewCount})
                                </span>
                            )}
                        </div>

                        <h3 className="text-sm md:text-lg font-bold text-[#7C4A0E] line-clamp-2 min-h-[2.5rem] md:min-h-[3.5rem]">
                            {product.title}
                        </h3>

                        <div className="flex items-center gap-1 md:gap-2 mt-1 md:mt-2">
                            <span className="text-sm md:text-xl font-bold text-orange-600">
                                ₹{price}
                            </span>
                            {hasDiscount && (
                                <span className="text-sm md:text-lg line-through text-gray-400">
                                    ₹{compareAt}
                                </span>
                            )}
                        </div>

                        {product.defaultVariant?.title && (
                            <p className="text-[8px] md:text-xs text-gray-600 font-medium mt-1">
                                Weight: {product.defaultVariant.title}
                            </p>
                        )}

                        {/* ACTION BUTTONS */}
                        <div className="flex gap-1.5 md:gap-2 mt-2 md:mt-3 pt-2 border-t border-gray-100 mt-auto">
                            <button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className={`flex-1 py-1.5 md:py-2 text-[10px] md:text-xs font-bold rounded-lg border border-[#7C4A0E] text-[#7C4A0E] hover:bg-amber-50 transition shadow-sm ${isOutOfStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                                Add to Cart
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={isOutOfStock}
                                className={`flex-1 py-1.5 md:py-2 text-[10px] md:text-xs font-bold rounded-lg bg-[#7C4A0E] text-white hover:bg-[#6a3f0c] transition shadow-sm ${isOutOfStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                                {isOutOfStock ? "Out of Stock" : "Buy Now"}
                            </button>
                        </div>

                    </div>
                </motion.div>
            </Link>

            {isModalOpen && modalProduct && (
                <ProductModal
                    product={modalProduct}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </>
    );
}
