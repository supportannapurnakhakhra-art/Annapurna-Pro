"use client";

import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="w-full bg-[#fcfbf7]">
      <div className="relative w-full aspect-[16/9] sm:aspect-[4/3] md:aspect-[16/9]">
        <Image
          src="https://cdn.shopify.com/s/files/1/0953/6284/2993/files/banner.png?v=1770090973"
          alt="Annapurna Khakhra Banner"
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-contain"
        />
      </div>
    </section>
  );
}

