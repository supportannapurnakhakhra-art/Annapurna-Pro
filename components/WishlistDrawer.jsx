"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { X, Heart, ShoppingBag, User } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import HorizontalProductCard from "./HorizontalProductCard";
import WishlistSuggestions from "./WishlistSuggestions";

export default function WishlistDrawer() {
    const { wishlist, isWishlistOpen, closeWishlist, loading } = useWishlist();
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isWishlistOpen) {
            setShouldRender(true);
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            setTimeout(() => setShouldRender(false), 300);
        }
    }, [isWishlistOpen]);

    if (!shouldRender) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"
                    }`}
                onClick={closeWishlist}
            />

            {/* Drawer */}
            <div
                className={`absolute top-0 right-0 h-full w-full max-w-[448px] lg:max-w-[900px] bg-white shadow-2xl transition-transform duration-300 transform ${isAnimating ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                <div
                    className="flex h-full ml-auto bg-white"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Left Sidebar for Suggestions (Desktop only) */}
                    <div className="hidden lg:block w-[40%] border-r border-amber-50 overflow-y-auto bg-[#fdfaf7] no-scrollbar">
                        <WishlistSuggestions />
                    </div>

                    {/* Main Content */}
                    <div className="w-full lg:w-[60%] flex flex-col h-full bg-[#fdfaf7]">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-amber-100 bg-white shadow-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center">
                                    <Heart className="w-5 h-5 text-[#7d4b0e] fill-[#7d4b0e]" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[#7d4b0e]">My Wishlist</h2>
                                    <p className="text-[10px] text-amber-800/60 font-medium uppercase tracking-wider">{wishlist.length} Items</p>
                                </div>
                            </div>
                            <button
                                onClick={closeWishlist}
                                className="p-2 hover:bg-amber-50 rounded-full transition-colors cursor-pointer group"
                            >
                                <X className="w-6 h-6 text-gray-400 group-hover:text-[#7d4b0e]" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-40">
                                    <div className="w-8 h-8 border-4 border-[#7d4b0e] border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-4 text-gray-500 font-medium text-sm">Loading your wishlist...</p>
                                </div>
                            ) : wishlist.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                                    <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                        <Heart className="w-12 h-12 text-amber-200" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Your wishlist is empty</h3>
                                    <p className="text-sm text-gray-500 mb-8 max-w-[240px]">
                                        Save your favorite items here to keep track of them and add them to your cart anytime.
                                    </p>
                                    <Link href="/Shop" className="w-full">
                                        <button
                                            onClick={closeWishlist}
                                            className="w-full py-4 bg-[#7d4b0e] text-white rounded-2xl font-bold hover:bg-[#6b400c] transition-all shadow-lg shadow-amber-900/10 cursor-pointer active:scale-95"
                                        >
                                            Start Shopping
                                        </button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    {wishlist.map((product) => (
                                        <HorizontalProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            )}
                            {/* Suggestions in mobile (shown inside scrollable area) */}
                            <div className="lg:hidden mt-6 pt-4 border-t border-amber-100">
                                <WishlistSuggestions />
                            </div>
                        </div>
                    </div>

                    {/* Footer removed per user request */}
                </div>
            </div>
        </div>
    );
}
