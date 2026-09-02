
"use client";

import { useState } from "react";
import Link from "next/link";

export default function BestSellerSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const products = [
    { name: "Chat Khakhra", img: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/Single_Chat_Khakhra.png?v=1770090985", href: "chaat-khakhra-made-with-pure-ghee" },
    { name: "Palak Khakhra", img: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/Single_Palak_Khakhra.png?v=1770090986", href: "palak-khakhra-made-with-pure-ghee" },
    { name: "Manchurian Khakhra", img: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/Single_Manchurian_Khakhra.png?v=1770090982", href: "manchurian-khakhra-made-with-pure-ghee" },
    { name: "Panipuri Khakhra", img: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/Single_Panipuri_Khakhra.png?v=1770090987", href: "panipuri-khakhra-made-with-pure-ghee" },
    { name: "Makai Khakhra", img: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/Single_Makai_Khakhra.png?v=1770090988", href: "makai-khakhra-made-with-pure-ghee" },
    { name: "Ragi Khakhra", img: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/Single_Ragi_Khakhra.png?v=1770090983", href: "ragi-khakhra-made-with-pure-ghee" },
  ];

  // Mobile products
  const mobileProducts = isExpanded ? products : products.slice(0, 2);

  return (
    <section className="py-4 sm:py-12 md:py-16 px-4">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-10 text-[#013348]">
        Best Seller
      </h2>

      {/* MOBILE: STACKED (< 768px) */}
      <div className="flex flex-col items-center md:gap-8 gap-4 md:hidden">
        {/* Video First on Mobile */}
        <div className="w-64 h-64">
          <video
            src="https://cdn.shopify.com/videos/c/o/v/1a5e212600fe49878b0c48db287b2e02.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-contain rounded-xl"
          />
        </div>

        {/* Products Grid Below Video */}
        <div className="grid grid-cols-2 gap-6 w-full max-w-md">
          {mobileProducts.map((p, i) => (
            <Link key={i} href={`/product/${p.href}`} className="text-center cursor-pointer">
              <img
                src={p.img}
                alt={p.name}
                className="w-28 h-28 rounded-full object-cover mx-auto hover:scale-105 transition"
              />
              <p className="mt-2 text-sm font-medium">{p.name}</p>
            </Link>
          ))}
        </div>

        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="mt-2 px-8 py-2.5 bg-[#7d4b0e] text-white rounded-full font-bold text-sm shadow-md hover:bg-yellow-600 transition cursor-pointer"
          >
            LOAD MORE
          </button>
        )}
      </div>

      {/* TABLET: 2 ROWS LAYOUT (768px - 1024px) */}
      <div className="hidden md:block lg:hidden">
        {/* Video Centered */}
        <div className="w-64 h-64 md:w-72 md:h-72 mx-auto mb-8">
          <video
            src="https://cdn.shopify.com/videos/c/o/v/1a5e212600fe49878b0c48db287b2e02.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-contain rounded-xl"
          />
        </div>

        {/* Products in 2 Rows */}
        <div className="space-y-8">
          {/* First Row - 3 Products */}
          <div className="flex justify-center gap-8">
            {products.slice(0, 3).map((p, i) => (
              <Link key={i} href={`/product/${p.href}`} className="text-center cursor-pointer">
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover mx-auto hover:scale-105 transition"
                />
                <p className="mt-2 font-medium">{p.name}</p>
              </Link>
            ))}
          </div>

          {/* Second Row - 3 Products */}
          <div className="flex justify-center gap-8">
            {products.slice(3, 6).map((p, i) => (
              <Link key={i} href={`/product/${p.href}`} className="text-center cursor-pointer">
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover mx-auto hover:scale-105 transition"
                />
                <p className="mt-2 font-medium">{p.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* DESKTOP: HORIZONTAL LAYOUT (≥ 1024px) */}
      <div className="hidden lg:flex lg:items-center lg:justify-center gap-10">
        {/* LEFT SIDE - 3 Products */}
        <div className="flex gap-10">
          {products.slice(0, 3).map((p, i) => (
            <Link key={i} href={`/product/${p.href}`} className="text-center cursor-pointer">
              <img
                src={p.img}
                alt={p.name}
                className="w-36 h-36 rounded-full object-cover mx-auto hover:scale-105 transition"
              />
              <p className="mt-2 font-medium">{p.name}</p>
            </Link>
          ))}
        </div>

        {/* CENTER - Video */}
        <div className="w-64 h-64">
          <video
            src="https://cdn.shopify.com/videos/c/o/v/1a5e212600fe49878b0c48db287b2e02.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-contain rounded-xl"
          />
        </div>

        {/* RIGHT SIDE - 3 Products */}
        <div className="flex gap-10">
          {products.slice(3, 6).map((p, i) => (
            <Link key={i} href={`/product/${p.href}`} className="text-center cursor-pointer">
              <img
                src={p.img}
                alt={p.name}
                className="w-36 h-36 rounded-full object-cover mx-auto hover:scale-105 transition"
              />
              <p className="mt-2 font-medium">{p.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}