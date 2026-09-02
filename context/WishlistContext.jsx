"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import wishlistStore from "@/lib/api/stores/wishlistStore";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
    const [wishlist, setWishlist] = useState([]);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchWishlistItems = useCallback(async () => {
        setLoading(true);
        try {
            const items = await wishlistStore.getWishlist();
            setWishlist(Array.isArray(items) ? items : []);
        } catch (err) {
            console.error("Wishlist fetch error:", err);
            setWishlist([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWishlistItems();
    }, [fetchWishlistItems]);

    // Listen for external updates (e.g. from login, update, or logout events)
    useEffect(() => {
        const handleUpdate = () => {
            fetchWishlistItems();
        };

        window.addEventListener("wishlist-updated", handleUpdate);
        window.addEventListener("customer-updated", handleUpdate);
        window.addEventListener("customer-logout", handleUpdate);

        return () => {
            window.removeEventListener("wishlist-updated", handleUpdate);
            window.removeEventListener("customer-updated", handleUpdate);
            window.removeEventListener("customer-logout", handleUpdate);
        };
    }, [fetchWishlistItems]);

    const toggleWishlist = useCallback(async (product) => {
        const rawId = product?.id || product?._id;
        if (!rawId) return;

        try {
            await wishlistStore.toggleWishlistBackend(rawId);
            const items = await wishlistStore.getWishlist();
            setWishlist(Array.isArray(items) ? items : []);
        } catch (error) {
            console.error("WishlistContext: toggle error", error);
        }
    }, []);

    const removeFromWishlist = useCallback(async (productId) => {
        if (!productId) return;
        try {
            await wishlistStore.removeFromWishlistBackend(productId);
            const items = await wishlistStore.getWishlist();
            setWishlist(Array.isArray(items) ? items : []);
        } catch (error) {
            console.error("WishlistContext: remove error", error);
        }
    }, []);

    const isInWishlist = useCallback((productId) => {
        if (!Array.isArray(wishlist) || !productId) return false;
        const targetRaw = String(productId).split("/").pop();
        return wishlist.some((item) => {
            const itemRaw = String(item?.id || item?._id || "").split("/").pop();
            return itemRaw === targetRaw;
        });
    }, [wishlist]);

    const openWishlist = () => setIsWishlistOpen(true);
    const closeWishlist = () => setIsWishlistOpen(false);

    return (
        <WishlistContext.Provider
            value={{
                wishlist: Array.isArray(wishlist) ? wishlist : [],
                loading,
                isWishlistOpen,
                toggleWishlist,
                removeFromWishlist,
                isInWishlist,
                openWishlist,
                closeWishlist,
                fetchWishlist: fetchWishlistItems,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}
