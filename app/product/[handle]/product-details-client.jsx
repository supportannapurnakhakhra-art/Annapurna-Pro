"use client";

import React, { useState, useEffect, useRef } from "react";
import { HandCoins, Award, Package, Lock, FlaskConical, Leaf, Truck, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Star, Heart } from "lucide-react";
import AskExpert from "@/components/AskExpert";
import Breadcrumbs from "@/components/Breadcrumbs";
import LiveStats from "@/components/LiveStats";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { buildCheckoutItem } from "@/lib/checkoutItemMapper";

export default function ProductDetailsClient({ product }) {
  const [openIndexes, setOpenIndexes] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants?.edges?.[0]?.node || product?.variants?.nodes?.[0] || product?.variants?.[0] || null
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [quantityError, setQuantityError] = useState(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const reviewsSummary = {
    average: product.avg_rating || 0,
    total: product.total_reviews || 0
  };

  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCartAndOpen, buyNow } = useCart();
  const isWishlisted = isInWishlist(product.id);

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

  // Swipe state for mobile image navigation
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);
  const imageRef = useRef(null);

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;

    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && selectedImageIndex < allImages.length - 1) {
        // Swipe left - next image
        setSelectedImageIndex((prev) => prev + 1);
      } else if (diff < 0 && selectedImageIndex > 0) {
        // Swipe right - previous image
        setSelectedImageIndex((prev) => prev - 1);
      }
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  if (!product) {
    return <div className="text-center py-20">Product not found</div>;
  }

  // Dynamic price calculation based on selected variant
  const price = selectedVariant?.price?.amount
    ? Number(selectedVariant.price.amount)
    : 0;

  const compare = selectedVariant?.compareAtPrice?.amount
    ? Number(selectedVariant.compareAtPrice.amount)
    : 0;

  const isTodaysOffer = product?.collections?.edges?.some(
    (edge) =>
      edge.node.title === "Today's Offer" ||
      edge.node.handle === "todays-offer"
  );

  const isHolioffer = product?.collections?.edges?.some(
    (edge) =>
      edge.node.title === "Holi Special Offer" ||
      edge.node.handle === "holi-special-offer"
  );

  useEffect(() => {
    if (isTodaysOffer) {
      window.dispatchEvent(new CustomEvent("set-active-header-link", { detail: "Today's Offer" }));
    }
  }, [isTodaysOffer]);

  const hasDiscount = compare > price && compare > 0;

  const percentage = hasDiscount
    ? Math.round(((compare - price) / compare) * 100)
    : null;

  // Standardize allImages array safely to support flat arrays, edge objects, and root fallbacks
  let rawAllImages = product?.images?.edges || product?.images?.nodes || product?.images || [];
  let allImages = [];
  if (Array.isArray(rawAllImages)) {
    allImages = rawAllImages.map((img) => {
      let nodeObj = img.node || img;
      let urlStr = typeof nodeObj === "string" ? nodeObj : nodeObj.url || nodeObj.src || nodeObj.originalSrc || nodeObj.image_url || nodeObj.imageUrl || "";
      if (urlStr && urlStr.includes("/media/") && !urlStr.includes("/api/media/")) {
        urlStr = urlStr.replace("/media/", "/api/media/");
      }
      return {
        ...nodeObj,
        url: urlStr
      };
    }).filter(img => img.url);
  }

  // Fallback if images array is empty
  if (allImages.length === 0) {
    let fallbackUrl =
      product?.featuredImage?.url ||
      (typeof product?.featuredImage === "string" ? product.featuredImage : null) ||
      product?.featuredImageUrl ||
      product?.image_url ||
      product?.imageUrl ||
      product?.image ||
      null;

    if (fallbackUrl && typeof fallbackUrl === "string") {
      if (fallbackUrl.includes("/media/") && !fallbackUrl.includes("/api/media/")) {
        fallbackUrl = fallbackUrl.replace("/media/", "/api/media/");
      }
      allImages = [{ url: fallbackUrl }];
    }
  }

  const displayImage =
    allImages[selectedImageIndex]?.url ||
    allImages[0]?.url ||
    "/placeholder.jpg";

  const checkoutFromSelection = async () => {
    if (!selectedVariant) {
      alert("Please select a variant");
      return;
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

    const { needsVariantHydration, ...item } = buildCheckoutItem(
      product,
      selectedVariant,
      displayImage,
    );
    await buyNow(item, Number(quantity) || 1);
  };

  // Standardize variants array safely
  let rawVariants = product?.variants?.edges || product?.variants?.nodes || product?.variants || [];
  let variantsList = Array.isArray(rawVariants) ? rawVariants.map(v => v.node || v) : [];

  // LIVE COUNTDOWN TIMER - "Order in next 7h 20m 51s"
  function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
      const timer = setInterval(() => {
        const now = new Date();
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);

        const diff = midnight - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);

        if (diff < 0) {
          setTimeLeft("0h 0m 0s");
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }, []);

    return <span className="font-bold text-orange-600 text-lg">{timeLeft}</span>;
  }






  useEffect(() => {
    if (!product?.id) return;

    let viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];

    // Remove existing ID to avoid duplicates
    viewed = viewed.filter((id) => id !== product.id);

    viewed.unshift(product.id);

    // limit
    viewed = viewed.slice(0, 10);

    localStorage.setItem("recentlyViewed", JSON.stringify(viewed));
  }, [product]);



  // VIEW CONTENT TRACKING (New)
  useEffect(() => {
    if (!product) return;

    if (typeof window.fbq !== "undefined") {
      window.fbq("track", "ViewContent", {
        content_name: product.title,
        content_ids: [product.id],
        content_type: "product",
        value: Number(product.priceRange?.minVariantPrice?.amount || selectedVariant?.price?.amount || 0),
        currency: product.priceRange?.minVariantPrice?.currencyCode || selectedVariant?.price?.currencyCode || "INR",
      });
    }
  }, [product]);

  // Truncation logic for mobile description
  const getTruncatedHtml = (html, wordLimit) => {
    if (!html) return "";
    // Strip HTML tags to count words accurately
    const stripped = html.replace(/<[^>]*>/g, " ");
    const words = stripped.split(/\s+/).filter((w) => w.length > 0);
    if (words.length <= wordLimit) return null;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const truncatedDescription = getTruncatedHtml(product.descriptionHtml, 50);

  return (
    <>
      <Breadcrumbs currentTitle={product.title} />
      <div className="min-h-screen bg-white py-1 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 md:gap-12 items-start">
            {/* IMAGE SECTION - Mobile/Tablet Slider + Desktop Grid */}
            <div className="space-y-2 md:space-y-6">
              <div className="relative group">
                {hasDiscount && (
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-red-600 text-white px-4 py-1.5 text-sm font-bold rounded-full shadow-lg">
                      {percentage}% OFF
                    </span>
                  </div>
                )}

                {/* Featured Image with Swipe Support */}
                <div
                  ref={imageRef}
                  className="relative overflow-hidden rounded-2xl shadow-2xl bg-white p-2 sm:p-4"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={displayImage}
                    alt={product.title}
                    className="rounded-xl w-full object-cover aspect-square transform group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  />

                  {/* Navigation Buttons - Mobile & Tablet */}
                  {allImages.length > 1 && (
                    <>
                      {/* Left Button */}
                      <button
                        onClick={() => setSelectedImageIndex((prev) => Math.max(0, prev - 1))}
                        disabled={selectedImageIndex === 0}
                        className="lg:hidden absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-6 h-6 text-gray-800" />
                      </button>

                      {/* Right Button */}
                      <button
                        onClick={() => setSelectedImageIndex((prev) => Math.min(allImages.length - 1, prev + 1))}
                        disabled={selectedImageIndex === allImages.length - 1}
                        className="lg:hidden absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-6 h-6 text-gray-800" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {allImages.length > 1 && (
                <div className="space-y-3 px-1">
                  {/* Mobile & Tablet: Horizontal Scrollable Thumbnails */}
                  <div className="lg:hidden">
                    <div className="flex gap-2 overflow-x-auto p-2 pl-2 snap-x snap-mandatory scrollbar-hide">
                      {allImages.map((image, index) => {
                        const isSelected = selectedImageIndex === index;
                        return (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`
                              relative flex-shrink-0 w-8 h-8 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden 
                              ${isSelected
                                ? "ring-1 ring-[#7d4b0e] shadow-md scale-105"
                                : "ring-1 ring-gray-200 hover:ring-[#7d4b0e]/40"
                              }
                            `}
                          >
                            <img
                              src={image.url}
                              alt={`View ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Selected indicator */}
                            {isSelected && (
                              <div className="absolute inset-0 bg-[#7d4b0e]/10 flex items-center justify-center">
                                <div className="w-2 h-2 bg-[#7d4b0e] rounded-full shadow-sm"></div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Desktop: Grid of 2 thumbnails */}
                  <div className="hidden lg:grid grid-cols-2 gap-4 pb-6 pt-4">
                    {allImages.map((image, index) => {
                      const isSelected = selectedImageIndex === index;

                      let buttonClasses = `
                        relative w-full aspect-square rounded-lg cursor-pointer transition-all duration-200 overflow-hidden
                        ${isSelected
                          ? "ring-2 ring-[#7d4b0e] shadow-md"
                          : "ring-1 ring-gray-200 hover:ring-[#7d4b0e]/40"
                        }
                      `;

                      return (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={buttonClasses}
                        >
                          <img
                            src={image.url}
                            alt={`View ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {/* Selected indicator */}
                          {isSelected && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#7d4b0e] rounded-full shadow-sm bg-white"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* DETAILS SECTION */}
            <div
              className="space-y-4 md:space-y-6 md:pb-28"
            >
              <h1 className="text-lg md:text-2xl lg:text-4xl font-bold text-black md:mt-2 mb-1 md:mb-2 mt-0 leading-tight">
                {product.title}
              </h1>

              <div className="flex gap-2 flex-wrap hidden">
                {product.tags && product.tags.map((tag, idx) => (
                  <span key={idx} className="inline-block bg-yellow-500 text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-full shadow-md">
                    {tag}
                  </span>
                ))}
              </div>
              {/* PRICE - Now dynamic based on selected variant */}
              <div className="mb-0 md:mb-2">
                {hasDiscount ? (
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-4 flex-wrap">
                      <span className="text-lg md:text-xl lg:text-2xl line-through text-gray-400 font-medium">
                        ₹{compare.toFixed(2)}
                      </span>
                      <span className="text-2xl md:text-3xl lg:text-5xl font-bold text-orange-600">
                        ₹{price.toFixed(2)}
                      </span>
                      <span className="bg-[#7d4b0e] text-white px-4 py-1.5 rounded-full text-[10px] md:text-sm font-semibold shadow-sm">
                        {percentage}% OFF
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="text-2xl md:text-4xl lg:text-6xl font-bold text-orange-600">
                    ₹{price.toFixed(2) === "0.00" ? "Free" : price.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-black text-[9px] md:text-[12px] text-gray-400 mb-0">
                Tax Included.{" "}
                <a
                  href="/shipping-policy"
                  className="font-medium text-[#7d4b0e] hover:underline"
                >
                  Shipping
                </a> calculated at checkout.
              </p>

              <div className="flex flex-col mb-1">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= Math.round(reviewsSummary.average)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {reviewsSummary.total > 0 ? reviewsSummary.average.toFixed(1) : "0.0"}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({reviewsSummary.total} reviews)
                  </span>
                </div>
                <LiveStats productId={product.id} />
              </div>

              {/* VARIANT SELECTOR */}
              {variantsList.length > 1 && (
                <div className="pt-0 pb-1 md:pb-2">
                  <h3 className="font-bold text-xs md:text-sm text-[#7d4b0e] mb-2 md:mb-3">
                    Choose Variant
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {variantsList.map((variant) => {
                      const isActive = selectedVariant?.id === variant.id;

                      return (
                        <button
                          key={variant.id}
                          onClick={() => {
                            setSelectedVariant(variant);
                            setQuantity(1);
                          }}
                          className={`
                            relative rounded-lg px-3 py-1.5 md:px-4 md:py-2 text-center text-xs md:text-sm font-bold
                            border transition-all duration-200 cursor-pointer flex items-center gap-2
                            ${isActive
                              ? "border-[#7d4b0e] bg-[#7d4b0e] text-white shadow-sm"
                              : "border-gray-300 bg-white text-gray-700 hover:border-[#7d4b0e]"
                            }
                          `}
                        >
                          {variant.title}
                          {isActive && (
                            <span className="w-4 h-4 rounded-full bg-white text-[#7d4b0e] flex items-center justify-center text-[10px] border border-white">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}


              {/* ACTION GROUP: QUANTITY, ATC, BUY NOW, WISHLIST */}
              <div className="flex flex-col gap-3 md:gap-4 pt-1 md:pt-2">
                {(isTodaysOffer || isHolioffer) && selectedVariant?.quantityAvailable > 0 && (
                  <div className="flex items-center gap-2 text-red-600 font-bold text-xs md:text-sm mb-1 animate-pulse">
                    <Package className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                    <span>Limited stock — only {selectedVariant.quantityAvailable} items left</span>
                  </div>
                )}

                {/* QUANTITY & ADD TO CART */}
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="flex items-center bg-amber-50/50 border border-gray-200 rounded-full px-1 py-0.5 shadow-sm h-10 md:h-12">
                    {/* — BUTTON */}
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#7d4b0e] hover:bg-[#6a3f0c] disabled:opacity-40 transition shadow-sm text-lg md:text-xl text-white font-bold cursor-pointer"
                    >
                      –
                    </button>
                    <span className="md:mx-3 mx-1.5 text-base md:text-lg font-semibold min-w-[30px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => {
                        const stock = selectedVariant?.quantityAvailable || 0;
                        if (quantity >= stock && stock > 0) {
                          setQuantityError(`Only ${stock} qty in stock`);
                          setTimeout(() => setQuantityError(null), 1000);
                          return;
                        }
                        setQuantity((q) => q + 1);
                      }}
                      className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#7d4b0e] hover:bg-[#6a3f0c] text-white transition shadow-sm text-lg md:text-xl font-bold cursor-pointer"
                    >
                      +
                      {quantityError && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] md:text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap animate-bounce z-50">
                          {quantityError}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-red-600"></div>
                        </div>
                      )}
                    </button>
                  </div>

                  <div className="flex-1">
                    <button
                      onClick={handleAddToCart}
                      disabled={!selectedVariant || selectedVariant?.availableForSale === false}
                      className={`w-full h-10 md:h-12 font-bold px-4 rounded-lg text-xs md:text-base shadow-sm ring-1 ring-[#7d4b0e]/30 transition-all duration-300 ${selectedVariant?.availableForSale === false
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white border-2 border-[#7d4b0e] text-[#7d4b0e] hover:bg-amber-50 active:scale-[0.98] cursor-pointer"
                        }`}
                    >
                      {selectedVariant?.availableForSale === false ? "Restocking Soon" : "Add to Cart"}
                    </button>
                  </div>
                </div>

                {/* BUY NOW & WISHLIST */}
                <div className="flex gap-3">
                  <button
                    onClick={handleBuyNow}
                    disabled={!selectedVariant || selectedVariant?.availableForSale === false}
                    className={`flex-1 h-10 md:h-12 font-bold px-4 rounded-lg text-sm md:text-lg shadow-lg ring-1 ring-[#7d4b0e]/10 transition-all duration-300 ${selectedVariant?.availableForSale === false
                      ? "bg-[#7d4b0e9c] text-white cursor-not-allowed"
                      : "bg-[#7d4b0e] text-white hover:bg-[#6a3f0c] active:scale-[0.98] cursor-pointer"
                      }`}
                  >
                    {selectedVariant?.availableForSale === false ? "Restocking Soon" : "Buy Now"}
                  </button>

                  <button
                    onClick={handleWishlistClick}
                    className={`h-10 md:h-12 w-10 md:w-12 flex items-center justify-center rounded-lg border-2 transition-all active:scale-95 cursor-pointer ${isWishlisted
                      ? "border-[#7d4b0e] bg-amber-50 text-red-500"
                      : "border-[#7d4b0e] text-gray-400 hover:border-[#7d4b0e]/30 hover:text-[#7d4b0e]"
                      }`}
                    title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>
                </div>
              </div>

              <AskExpert />

              {/* DELIVERY TIMELINE & COUNTDOWN - EXACTLY LIKE YOUR IMAGE */}
              <div className="bg-amber-50 rounded-2xl md:p-6 p-2 md:mt-8 mt-4 border border-amber-200">
                {/* Timeline */}
                <div className="relative">
                  <div className="flex items-center justify-between relative">
                    {/* Line */}
                    <div className="absolute top-6 left-12 right-12 h-0.5 bg-amber-300"></div>

                    {/* Helper function for dates */}
                    {(() => {
                      const today = new Date();
                      const oneDay = 24 * 60 * 60 * 1000;

                      const orderDate = today;
                      const dispatchStart = new Date(today.getTime() + oneDay);
                      const dispatchEnd = new Date(today.getTime() + 2 * oneDay);

                      const deliveryStartCandidate = new Date(today.getTime() + 3 * oneDay);
                      const endOfDay = new Date(today);
                      endOfDay.setHours(23, 59, 59, 999);

                      const deliveryStart =
                        deliveryStartCandidate.getTime() > endOfDay.getTime()
                          ? new Date(today.getTime() + 4 * oneDay)
                          : deliveryStartCandidate;

                      const deliveryEnd = new Date(today.getTime() + 7 * oneDay);

                      // Format: 11/12
                      const format = (d) =>
                        d.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "2-digit",
                        });

                      return (
                        <>
                          {/* Step 1 - Order */}
                          <div className="flex flex-col items-center z-10">
                            <div className="w-12 h-12 bg-[#7d4b0e] rounded-full flex items-center justify-center shadow-lg">
                              🛍️
                            </div>
                            <p className="mt-3 text-sm font-semibold text-gray-700">Order</p>
                            <p className="text-xs text-gray-600">{format(orderDate)}</p>
                          </div>

                          {/* Step 2 - Dispatch */}
                          <div className="flex flex-col items-center z-10">
                            <div className="w-12 h-12 bg-[#7d4b0e] rounded-full flex items-center justify-center shadow-lg">
                              ✈️
                            </div>
                            <p className="mt-3 text-sm font-semibold text-gray-700">Order Dispatch</p>
                            <p className="text-xs text-gray-600">
                              {format(dispatchStart)} – {format(dispatchEnd)}
                            </p>
                          </div>

                          {/* Step 3 - Delivery */}
                          <div className="flex flex-col items-center z-10">
                            <div className="w-12 h-12 bg-[#7d4b0e] rounded-full flex items-center justify-center shadow-lg">
                              📦
                            </div>
                            <p className="mt-3 text-sm font-semibold text-gray-700">Delivery</p>
                            <p className="text-xs text-gray-600">
                              {format(deliveryStart)} – {format(deliveryEnd)}
                            </p>
                          </div>
                        </>
                      );
                    })()}

                  </div>
                </div>

                {/* Countdown Message */}
                <div className="md:mt-8 mt-4 space-y-3">
                  <div className="flex flex-col gap-1.5 md:gap-2 bg-white rounded-xl px-4 py-3 md:px-5 md:py-4 shadow-md">
                    {/* Point 1 - Free Shipping */}
                    <div className="flex items-start gap-2 md:gap-3">
                      <span className="text-xl md:text-2xl">👉</span>
                      <p className="text-gray-800 font-medium text-xs md:text-base">
                        Free Shipping on Orders Above <b>₹599</b>
                      </p>
                    </div>
                    <div className="flex items-start gap-2 md:gap-3">
                      <span className="text-xl md:text-2xl">👉</span>
                      <p className="text-gray-800 font-medium text-xs md:text-base">
                        Get <span className="font-bold">10% Discount</span> on prepaid orders
                      </p>
                    </div>

                    {/* Point 2 - Countdown & Delivery */}
                    <div className="flex items-start gap-2 md:gap-3">
                      <span className="text-xl md:text-2xl">👉</span>
                      <p className="text-gray-800 font-medium text-xs md:text-base leading-relaxed">
                        Order within the next <CountdownTimer /> for <strong>dispatch today</strong>, and you'll receive your package between{" "}
                        <strong>
                          {new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric' })}
                          {" – "}
                          {new Date(Date.now() + 7 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'numeric' })}
                        </strong>
                      </p>
                    </div>


                  </div>
                </div>

              </div>




              <div className="flex flex-col gap-3 md:gap-4 mt-4 md:mt-6">
                {/* Free Shipping */}
                <div className="flex items-center gap-2 md:gap-3">
                  <Package className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                  <span className="text-gray-800 text-xs md:text-base">
                    Free Shipping & Exchanges
                  </span>
                </div>

                {/* Secure Payment */}
                <div className="flex items-center gap-2 md:gap-3">
                  <Lock className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                  <span className="text-gray-800 text-xs md:text-base">
                    Flexible and secure payment, pay on delivery
                  </span>
                </div>

                {/* Happy Customers */}
                <div className="flex items-center gap-2 md:gap-3">
                  <Award className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
                  <span className="text-gray-800 text-xs md:text-base">
                    800,000+ Happy customers
                  </span>
                </div>
              </div>



              {/* metafeilds */}
              <div className="space-y-3">
                {product.metafields && product.metafields
                  .filter(mf => mf.value && mf.value.trim() !== "" && mf.value !== "[]" && mf.value !== "{}")
                  .map((mf, index) => {
                    const isOpen = openIndexes.includes(index);

                    const toggle = () => {
                      setOpenIndexes(prev =>
                        isOpen ? prev.filter(i => i !== index) : [...prev, index]
                      );
                    };

                    // Friendly label mapping
                    const labelMap = {
                      "usp": "USP",
                      "info": "Product Information",
                      "faq": "Frequently Asked Questions",
                      "benefits": "Key Benefits",
                      "shelf_life": "Shelf Life",
                      "allergy_advice": "Allergy Advice"
                    };

                    const displayLabel = labelMap[mf.key] || mf.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                    // Render content based on key or type
                    let content;
                    const multilineKeys = ["usp", "info", "faq", "benefits", "allergy_advice", "shelf_life"];

                    if (mf.key === "ingredients") {
                      // Handle ingredients (previously index 0)
                      try {
                        const values = Array.isArray(mf.value) ? mf.value : JSON.parse(mf.value);
                        content = (
                          <ul className="list-none space-y-1 text-gray-700">
                            {values.map((val, i) => (
                              <li key={i}>{val}</li>
                            ))}
                          </ul>
                        );
                      } catch (e) {
                        content = <span className="text-gray-700">{mf.value}</span>;
                      }
                    } else if (multilineKeys.includes(mf.key)) {
                      content = mf.value.split("\n").map((line, i) => (
                        line.trim() && <p key={i} className="text-gray-700 mb-1">{line}</p>
                      ));
                    } else {
                      content = <span className="text-gray-700">{mf.value}</span>;
                    }

                    return (
                      <div
                        key={`${mf.namespace}.${mf.key}`}
                        className="overflow-hidden rounded-xl bg-white shadow-md border border-gray-200 transition-all duration-300 hover:shadow-xl"
                      >
                        <button
                          onClick={toggle}
                          className="flex w-full items-center justify-between px-4 py-3 md:px-6 md:py-4 text-left font-semibold text-gray-800 transition-all hover:bg-gradient-to-r hover:from-amber-100/80 hover:to-yellow-50/50 focus:outline-none cursor-pointer"
                        >
                          <span className="text-sm md:text-base lg:text-lg">
                            <span className="text-black">{displayLabel}</span>
                          </span>
                          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                            {isOpen ? (
                              <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-[#7d4b0e]" />
                            ) : (
                              <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-[#7d4b0e]" />
                            )}
                          </div>
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-500 ease-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                          <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white px-4 py-3 md:px-6 md:py-5 text-xs md:text-sm">
                            {content}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>


              {/* TRUST BADGES */}
              <div className="flex flex-nowrap justify-between gap-2 sm:gap-6 py-3">

                {/* 1. 100% Pure */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 md:w-20 md:h-20 rounded-full bg-black border border-yellow-500 md:border-4 flex items-center justify-center">
                    <Leaf className="text-yellow-400 w-4 h-4 md:w-10 md:h-10" />
                  </div>
                  <p className="mt-0.5 md:mt-2 text-[8px] md:text-sm font-semibold text-black text-center leading-tight">
                    100% Pure
                  </p>
                </div>

                {/* 2. Secure Payment */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 md:w-20 md:h-20 rounded-full bg-black border border-yellow-500 md:border-4 flex items-center justify-center">
                    <Lock className="text-yellow-400 w-4 h-4 md:w-10 md:h-10" />
                  </div>
                  <p className="mt-0.5 md:mt-2 text-[8px] md:text-sm font-semibold text-black text-center leading-tight">
                    Secure Pay
                  </p>
                </div>

                {/* 3. Zero Preservative */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 md:w-20 md:h-20 rounded-full bg-black border border-yellow-500 md:border-4 flex items-center justify-center">
                    <FlaskConical className="text-yellow-400 w-4 h-4 md:w-10 md:h-10" />
                  </div>
                  <p className="mt-0.5 md:mt-2 text-[8px] md:text-sm font-semibold text-black text-center leading-tight">
                    No Preserv.
                  </p>
                </div>

                {/* 4. Freshly Made */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 md:w-20 md:h-20 rounded-full bg-black border border-yellow-500 md:border-4 flex items-center justify-center">
                    <Leaf className="text-yellow-400 w-4 h-4 md:w-10 md:h-10" />
                  </div>
                  <p className="mt-0.5 md:mt-2 text-[8px] md:text-sm font-semibold text-black text-center leading-tight">
                    Fresh Made
                  </p>
                </div>

                {/* 5. Fast Shipping */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 md:w-20 md:h-20 rounded-full bg-black border border-yellow-500 md:border-4 flex items-center justify-center">
                    <Truck className="text-yellow-400 w-4 h-4 md:w-10 md:h-10" />
                  </div>
                  <p className="mt-0.5 md:mt-2 text-[8px] md:text-sm font-semibold text-black text-center leading-tight">
                    Fast Ship
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* DESCRIPTION */}
          {product.descriptionHtml && (
            <div className="md:mt-16 mt-2 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-3 md:p-12 shadow-lg border border-gray-200">
                <h3 className="font-bold md:mb-6 mb-2 text-2xl text-gray-800 text-center">
                  Product Details
                </h3>

                {/* Mobile View with Truncation */}
                <div className="md:hidden">
                  <div className="text-xs text-gray-700 text-left leading-relaxed text-center">
                    {isDescriptionExpanded || !truncatedDescription ? (
                      <>
                        <div
                          className="inline"
                          dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                        />
                        <button
                          onClick={() => setIsDescriptionExpanded(false)}
                          className="mt-3 text-[#7d4b0e] font-bold text-xs uppercase tracking-wider block mx-auto hover:underline cursor-pointer"
                        >
                          Read Less
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="inline">{truncatedDescription}</span>
                        <button
                          onClick={() => setIsDescriptionExpanded(true)}
                          className="ml-1 text-[#7d4b0e] font-bold text-xs uppercase tracking-wider hover:underline cursor-pointer"
                        >
                          Read More
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Desktop View (Full) */}
                <div className="hidden md:block">
                  <div
                    className="prose prose-sm max-w-none text-gray-700 text-left leading-relaxed text-center"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>




    </>
  );
}
