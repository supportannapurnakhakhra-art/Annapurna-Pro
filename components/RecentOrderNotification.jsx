"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";

const NAMES = ["Rahul", "Priyanka", "Amit", "Sneha", "Jignesh", "Anjali", "Vikram", "Kavita", "Suresh", "Meera"];
const CITIES = ["Surat", "Ahmedabad", "Mumbai", "Pune", "Rajkot", "Vadodara", "Delhi", "Bangalore", "Hyderabad", "Indore"];
const PRODUCTS = [
  {
    name: "Methi Khakhra",
    image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/compressed-1770374961136.webp?v=1770374969"
  },
  {
    name: "Masala Khakhra",
    image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/compressed-1770374987790.webp?v=1770374995"
  },
  {
    name: "Jeera Khakhra",
    image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/compressed-1770375011114.webp?v=1770375020"
  },
  {
    name: "Manchurian Khakhra",
    image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/compressed-1770375094736.webp?v=1770375103"
  },
  {
    name: "Pizza Khakhra",
    image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/compressed-1770375158918.webp?v=1770375169"
  }
];

export default function RecentOrderNotification({ hide }) {
  const { isWishlistOpen } = useWishlist();
  const [currentOrder, setCurrentOrder] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // Combine parent hide prop and wishlist open state
  const shouldHide = hide || isWishlistOpen;

  useEffect(() => {
    const showRandomOrder = () => {
      // Don't trigger new notifications if we're currently hidden by a popup
      if (shouldHide) return;

      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const productObj = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
      
      setCurrentOrder({ 
        name, 
        city, 
        product: productObj.name,
        image: productObj.image
      });
      setIsVisible(true);

      // Hide after 6 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 6000);
    };

    // Initial delay before first notification
    const initialDelay = setTimeout(showRandomOrder, 4000);

    // Show every 20 seconds to be less intrusive but consistent
    const interval = setInterval(showRandomOrder, 20000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [shouldHide]);

  if (!currentOrder) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 z-[100] transition-all duration-700 ease-in-out transform ${
        isVisible && !shouldHide ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div className="bg-white/95 backdrop-blur-md border border-amber-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] rounded-2xl p-3 flex items-center gap-3 w-[280px] sm:w-[320px] group hover:border-amber-300 transition-colors">
        <Link href="/Shop" className="flex items-center gap-3 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={currentOrder.image}
              alt={currentOrder.product}
              className="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute -top-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white shadow-sm" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-800 font-medium leading-tight">
              <span className="font-bold text-gray-900">{currentOrder.name}</span> bought <span className="text-amber-700 font-semibold">{currentOrder.product}</span>
            </p>
            <p className="text-[10px] sm:text-xs text-amber-800 font-semibold uppercase tracking-wider mb-0.5">
              from {currentOrder.city}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">recently</p>
          </div>
        </Link>

        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-300 hover:text-gray-600 transition-colors p-1"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
