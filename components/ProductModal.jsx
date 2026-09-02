"use client";

import { Fragment, useState, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { buildCheckoutItem } from "@/lib/checkoutItemMapper";


export default function ProductQuickViewModal({ isOpen, onClose, product }) {
    const router = useRouter();
    const { addToCartAndOpen, buyNow } = useCart();
    const [selectedVariant, setSelectedVariant] = useState(
        product?.variants?.edges?.[0]?.node || product?.variants?.nodes?.[0] || product?.variants?.[0] || product?.defaultVariant || null
    );
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [quantityError, setQuantityError] = useState(null);

    // Swipe state for mobile image navigation
    const [touchStartX, setTouchStartX] = useState(null);
    const [touchEndX, setTouchEndX] = useState(null);
    const imageRef = useRef(null);

    if (!product) return null;

    const price = Number(selectedVariant?.price?.amount || 0);
    const compare = Number(selectedVariant?.compareAtPrice?.amount || 0);
    const hasDiscount = compare > price && compare > 0;
    const percentage = hasDiscount ? Math.round(((compare - price) / compare) * 100) : null;
    const allImages = product.images || [];
    const displayImage =
        allImages[selectedImageIndex]?.url ||
        product.featuredImage?.url ||
        "/placeholder.jpg";



    const handleViewDetails = () => {
        const slug = product.handle || product.id;
        router.push(`/product/${slug}`);
        onClose();
    };

    // Swipe navigation handlers (from product-details-client)
    const handleTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEndX(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStartX === null || touchEndX === null) return;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                // Swipe left (next)
                setSelectedImageIndex((prev) => (prev + 1) % allImages.length);
            } else {
                // Swipe right (prev)
                setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
            }
        }
        setTouchStartX(null);
        setTouchEndX(null);
    };

    const checkoutFromSelection = async () => {
        if (!selectedVariant) {
            alert("Please select a variant");
            return;
        }

        if (typeof onClose === "function") {
            onClose();
        }

        const { needsVariantHydration, ...item } = buildCheckoutItem(
            product,
            selectedVariant,
            displayImage,
        );
        await addToCartAndOpen(item, Number(quantity) || 1);
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (typeof window !== "undefined") {
            if (window.fbq) window.fbq("track", "AddToCart", { content_name: product.title, content_ids: [product.id], content_type: "product", value: Number(price), currency: "INR" });
            if (window.gtag) window.gtag("event", "add_to_cart", { content_name: product.title, content_ids: [product.id], content_type: "product", value: Number(price), currency: "INR" });
        }
        await checkoutFromSelection();
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
        if (!selectedVariant) {
            alert("Please select a variant");
            return;
        }
        if (typeof onClose === "function") {
            onClose();
        }
        const { needsVariantHydration, ...item } = buildCheckoutItem(
            product,
            selectedVariant,
            displayImage,
        );
        await buyNow(item, Number(quantity) || 1);
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                                {/* CLOSE BUTTON */}
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110 cursor-pointer"
                                >
                                    <X className="h-5 w-5 text-gray-700" />
                                </button>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                                    {/* LEFT: IMAGE SECTION (MATCH PRODUCT DETAILS PAGE) */}
                                    <div className="relative bg-gray-50 p-8">
                                        {hasDiscount && (
                                            <div className="absolute top-8 left-8 z-10">
                                                <span className="bg-red-600 text-white px-4 py-2 text-sm font-bold rounded-full shadow-lg">
                                                    {percentage}% OFF
                                                </span>
                                            </div>
                                        )}
                                        {/* MAIN IMAGE with swipe handlers */}
                                        <div
                                            className="relative group"
                                            ref={imageRef}
                                            onTouchStart={handleTouchStart}
                                            onTouchMove={handleTouchMove}
                                            onTouchEnd={handleTouchEnd}
                                        >
                                            <div className="relative overflow-hidden rounded-xl bg-white p-3 shadow-md">
                                                <img
                                                    src={displayImage}
                                                    alt={product.title}
                                                    className="w-full h-[400px] object-cover rounded-lg select-none"
                                                    draggable={false}
                                                />
                                            </div>
                                            {/* IMAGE NAVIGATION ARROWS */}
                                            {allImages.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={() => setSelectedImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                                    >
                                                        <ChevronLeft className="h-5 w-5 text-gray-700" />
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedImageIndex((prev) => (prev + 1) % allImages.length)}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                                                    >
                                                        <ChevronRight className="h-5 w-5 text-gray-700" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        {/* THUMBNAIL IMAGES (horizontal scroll on mobile, grid on desktop) */}
                                        {allImages.length > 1 && (
                                            <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
                                                {allImages.map((image, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() => setSelectedImageIndex(index)}
                                                        className={`relative overflow-hidden rounded-lg bg-white p-1 cursor-pointer transition-all min-w-[60px] max-w-[80px] border-2 ${selectedImageIndex === index
                                                            ? "border-[#7d4b0e] shadow-lg"
                                                            : "border-transparent hover:shadow-md"
                                                            }`}
                                                        style={{ flex: '0 0 auto' }}
                                                    >
                                                        <img
                                                            src={image.url}
                                                            alt={`${product.title} - ${index + 1}`}
                                                            className="w-full h-16 object-cover rounded select-none"
                                                            draggable={false}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* RIGHT: PRODUCT DETAILS */}
                                    <div className="p-8 max-h-[600px] overflow-y-auto">
                                        {/* TITLE */}
                                        <Dialog.Title as="h2" className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                                            {product.title}
                                        </Dialog.Title>

                                        {/* PRICE */}
                                        <div className="bg-amber-50 rounded-xl p-4 border border-orange-100 shadow-sm mb-6">
                                            {hasDiscount ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-baseline gap-3 flex-wrap">
                                                        <span className="text-4xl font-bold text-orange-600">
                                                            ₹{price.toFixed(2)}
                                                        </span>
                                                        <span className="text-xl line-through text-gray-400 font-medium">
                                                            ₹{compare.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-[#7d4b0e] text-white px-3 py-1 rounded-full text-xs font-semibold">
                                                            {percentage}% OFF
                                                        </span>
                                                        <span className="text-[#7d4b0e] font-semibold text-sm">
                                                            You save ₹{(compare - price).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-4xl font-bold text-orange-600">
                                                    ₹{price.toFixed(2)}
                                                </span>
                                            )}
                                        </div>

                                        {/* VARIANT SELECTOR */}
                                        {product.variants.length > 1 && (
                                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-6">
                                                <h3 className="font-semibold mb-3 text-base text-gray-800">
                                                    Choose Variant:
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {product.variants.map((variant) => (
                                                        <button
                                                            key={variant.id}
                                                            onClick={() => {
                                                                setSelectedVariant(variant);
                                                                setQuantity(1);
                                                            }}
                                                            className={`px-4 py-2 rounded-full border-2 font-medium text-sm transition-all cursor-pointer ${selectedVariant?.id === variant.id
                                                                ? "bg-[#7d4b0e] text-white border-[#7d4b0e]"
                                                                : "border-gray-300 hover:border-[#7d4b0e]"
                                                                }`}
                                                        >
                                                            {variant.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}



                                        {/* SHORT DESCRIPTION */}
                                        {product.description && (
                                            <div className="mb-6">
                                                <p className="text-gray-600 text-sm line-clamp-3">
                                                    {product.description}
                                                </p>
                                            </div>
                                        )}

                                        {/* ACTION GROUP: QUANTITY, ATC, BUY NOW */}
                                        <div className="flex flex-col gap-3 mb-4">
                                            {/* QUANTITY & ADD TO CART */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center bg-amber-50/50 border border-gray-200 rounded-full px-1 py-0.5 shadow-sm h-11">
                                                    <button
                                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                                        disabled={quantity <= 1}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#7d4b0e] hover:bg-[#6a3f0c] disabled:opacity-40 transition shadow-sm text-lg text-white font-bold cursor-pointer"
                                                    >
                                                        –
                                                    </button>
                                                    <span className="mx-3 text-base font-semibold min-w-[24px] text-center">
                                                        {quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => {
                                                            const stock = selectedVariant?.quantityAvailable || 0;
                                                            if (quantity >= stock && stock > 0) {
                                                                setQuantityError(`Only ${stock} left`);
                                                                setTimeout(() => setQuantityError(null), 1000);
                                                                return;
                                                            }
                                                            setQuantity((q) => q + 1);
                                                        }}
                                                        className="relative w-8 h-8 flex items-center justify-center rounded-full bg-[#7d4b0e] hover:bg-[#6a3f0c] text-white transition shadow-sm text-lg font-bold cursor-pointer"
                                                    >
                                                        +
                                                        {quantityError && (
                                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] py-1 px-2 rounded shadow-lg whitespace-nowrap animate-bounce z-50">
                                                                {quantityError}
                                                            </div>
                                                        )}
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={handleAddToCart}
                                                    disabled={!selectedVariant || selectedVariant?.availableForSale === false}
                                                    className={`flex-1 h-11 font-bold px-4 rounded-lg text-sm shadow-sm border-2 transition-all duration-300 ${selectedVariant?.availableForSale === false
                                                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                        : "bg-white border-[#7d4b0e] text-[#7d4b0e] hover:bg-amber-50 active:scale-[0.98] cursor-pointer"
                                                        }`}
                                                >
                                                    {selectedVariant?.availableForSale === false ? "Restocking Soon" : "Add to Cart"}
                                                </button>
                                            </div>

                                            {/* BUY NOW */}
                                            <button
                                                onClick={handleBuyNow}
                                                disabled={!selectedVariant || selectedVariant?.availableForSale === false}
                                                className={`w-full h-11 font-bold px-4 rounded-lg text-base shadow-md transition-all duration-300 ${selectedVariant?.availableForSale === false
                                                    ? "bg-[#7d4b0e9c] text-white cursor-not-allowed"
                                                    : "bg-[#7d4b0e] text-white hover:bg-[#6a3f0c] active:scale-[0.98] cursor-pointer"
                                                    }`}
                                            >
                                                {selectedVariant?.availableForSale === false ? "Restocking Soon" : "Buy Now"}
                                            </button>
                                        </div>

                                        {/* VIEW FULL DETAILS BUTTON */}
                                        <button
                                            onClick={handleViewDetails}
                                            className="w-full border-2 border-[#7d4b0e] text-[#7d4b0e] font-semibold py-3 px-6 rounded-lg hover:bg-[#7d4b0e] hover:text-white transition-all duration-300 cursor-pointer"
                                        >
                                            View Full Details
                                        </button>

                                        {/* TRUST INDICATORS */}
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Free Shipping</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Secure Payment</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>100% Pure</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-700">
                                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>Fast Delivery</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
