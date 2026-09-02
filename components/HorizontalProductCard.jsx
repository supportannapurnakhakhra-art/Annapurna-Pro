"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Trash2, Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import shopServices from "@/lib/api/services";
import {
    buildCheckoutItem,
    getProductImageUrl,
} from "@/lib/checkoutItemMapper";

export default function HorizontalProductCard({ product, hideRemove = false }) {
    const averageRating = product.avg_rating || 0;
    const reviewCount = product.total_reviews || 0;
    const { toggleWishlist, closeWishlist, isInWishlist } = useWishlist();
    const isWishlisted = isInWishlist(product.id);
    const { addToCartAndOpen, buyNow } = useCart();
    const rawImgUrl = getProductImageUrl(product);

    /* ---------------- HANDLERS ---------------- */
    const handleRemoveClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(product);
    };

    const handleWishlistClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const userToken = localStorage.getItem("userToken");
        if (!userToken) {
            window.dispatchEvent(new Event("open-login-modal"));
            return;
        }

        toggleWishlist(product);
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

        if (typeof closeWishlist === "function") {
            closeWishlist();
        }

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

        if (typeof closeWishlist === "function") {
            closeWishlist();
        }

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
    const price = Number(product?.price?.amount ?? product?.price ?? 0);
    const compareAt = Number(product?.compareAtPrice?.amount ?? product?.compareAtPrice ?? 0);
    const hasDiscount = compareAt > price;

    const discountPercent = hasDiscount
        ? Math.round(((compareAt - price) / compareAt) * 100)
        : 0;

    const isOutOfStock = product?.availableForSale === false;

    /* ---------------- STARS ---------------- */
    const displayRating = reviewCount === 0 ? 5 : averageRating;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-all p-3 relative"
        >
            <Link href={`/product/${product.handle}`} onClick={closeWishlist} className="absolute inset-0 z-0" />

            <div className="flex gap-4 relative z-10 pointer-events-none">
                {/* IMAGE */}
                <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 group overflow-hidden rounded-xl bg-gray-50 pointer-events-auto">
                    <Link href={`/product/${product.handle}`} onClick={closeWishlist} className="block h-full w-full">
                        {hasDiscount && (
                            <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full z-10">
                                {discountPercent}% OFF
                            </span>
                        )}

                        {rawImgUrl ? (
                            <Image
                                src={rawImgUrl}
                                alt={product.title || "Product"}
                                fill
                                sizes="(max-width: 768px) 100px, 150px"
                                unoptimized
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <span className="text-[10px] text-gray-400">No Image</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* INFO */}
                <div className="flex-1 flex flex-col justify-between py-1 min-w-0 pointer-events-auto">
                    <div>
                        <div className="flex justify-between items-start gap-2">
                            <h6 className="text-gray-500 text-[10px] uppercase tracking-wider font-medium">{product.vendor}</h6>
                            {!hideRemove ? (
                                <button
                                    onClick={handleRemoveClick}
                                    className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1 -mt-1 -mr-1 pointer-events-auto"
                                    title="Remove from wishlist"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleWishlistClick}
                                    className={`transition-colors cursor-pointer p-1 -mt-1 -mr-1 pointer-events-auto ${isWishlisted ? "text-red-500" : "text-gray-400 hover:text-[#7d4b0e]"
                                        }`}
                                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                >
                                    <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                                </button>
                            )}
                        </div>

                        <Link href={`/product/${product.handle}`} onClick={closeWishlist}>
                            <h3 className="text-sm md:text-base font-bold text-[#7C4A0E] line-clamp-1 hover:text-[#5a3102] transition-colors pointer-events-auto">
                                {product.title}
                            </h3>
                        </Link>

                        <div className="flex items-center gap-1.5 mt-1">
                            <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        className={`w-2.5 h-2.5 ${s <= Math.round(displayRating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "fill-gray-200 text-gray-200"
                                            }`}
                                    />
                                ))}
                            </div>
                            {reviewCount > 0 && (
                                <span className="text-[10px] text-gray-500">
                                    {averageRating.toFixed(1)}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 md:gap-3">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-orange-600 font-inter">
                                    ₹{price}
                                </span>
                                {hasDiscount && (
                                    <span className="text-xs line-through text-gray-400 font-inter">
                                        ₹{compareAt}
                                    </span>
                                )}
                            </div>
                            {product.defaultVariant?.title && (
                                <p className="text-[9px] text-gray-500 font-medium">
                                    {product.defaultVariant.title}
                                </p>
                            )}
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex gap-1.5 pointer-events-auto">
                            <button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-md border border-[#7C4A0E] text-[#7C4A0E] hover:bg-amber-50 transition shadow-sm ${isOutOfStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                                Add
                            </button>
                            <button
                                onClick={handleBuyNow}
                                disabled={isOutOfStock}
                                className={`px-2.5 py-1 text-[10px] font-bold rounded-md bg-[#7C4A0E] text-white hover:bg-[#6a3f0c] transition shadow-sm ${isOutOfStock ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                            >
                                Buy
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </motion.div>
    );
}
