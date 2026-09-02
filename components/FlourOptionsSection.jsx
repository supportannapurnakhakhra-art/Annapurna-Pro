"use client";

import React from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import Link from "next/link";

export default function FlourOptionsSection() {
    const flourOptions = [
        {
            image:
                "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/2.jpg?v=1782792840",
            title: "Wheat Khakhra / Wheat Biscuit Bhakhri",
            keyword: "Wheat",
            desc: "Soft & daily staple flour",
        },
        {
            image:
                "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/9_1.jpg?v=1782792510",
            title: "Ragi Khakhra",
            keyword: "Ragi",
            desc: "Rich in calcium & fiber",
        },
        {
            image:
                "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/3_1.jpg?v=1782792657",
            title: "Bajri Khakhra / Bajra Biscuit Bhakhri",
            keyword: "Bajri",
            desc: "Warm & winter special",
        },
        {
            image:
                "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/4_1.jpg?v=1782792904",
            title: "Juvar Khakhra",
            keyword: "Juvar",
            desc: "Gluten-free energy grain",
        },
        {
            image:
                "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/5_1.jpg?v=1782792567",
            title: "Jav(barley) Khakhra",
            keyword: "Jav",
            desc: "High fiber healthy grain",
        },
        {
            image:
                "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/6.jpg?v=1782793053",
            title: "Mag Khakhra",
            keyword: "Mag",
            desc: "Light, easy to digest",
        },
        {
            image:
                "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/7_1.jpg?v=1782793105",
            title: "Chana Khakhra",
            keyword: "Chana",
            desc: "Protein rich gram flour",
        },
        {
            image:
                "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/8.jpg?v=1782793104",
            title: "Makai Khakhra",
            keyword: "Makai",
            desc: "Naturally sweet corn flour",
        },
        {
            image:
                "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/1_1.jpg?v=1782793104",
            title: "Farali Khakhra / Farali Biscuit Bhakhri",
            keyword: "Farali",
            desc: "Perfect for fasting meals",
        },
    ];

    // Structured Data for SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Premium Flour Options",
        itemListElement: flourOptions.map((flour, index) => ({
            "@type": "Product",
            position: index + 1,
            name: `${flour.title} Flour`,
            description: flour.desc,
            image: flour.image,
            category: "Flour & Atta",
        })),
    };

    return (
        <section className="py-6 md:py-24 bg-[#fff7e5] relative overflow-hidden">
            {/* ✅ Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            <div className="max-w-7xl mx-auto md:px-6 text-center">
                {/* H2 for SEO */}
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="md:text-4xl text-2xl font-extrabold mb-4 bg-[#7C4A0E] bg-clip-text text-transparent"
                >
                    Choose Your Preferred Flour – Fresh & Healthy Atta Options
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="max-w-2xl mx-auto text-[#cc760e] md:mb-16 mb-8 md:text-lg text-sm px-4"
                >
                    Explore nutrient-rich flours including Wheat, Ragi, Bajra, Jowar,
                    Barley, Chana, Makai and Farali flour. Perfect for healthy Indian
                    meals and daily cooking.
                </motion.p>

                {/* 📱 MOBILE SLIDER */}
                <div className="lg:hidden px-4">
                    <Swiper
                        effect="coverflow"
                        grabCursor={true}
                        centeredSlides={true}
                        slidesPerView={1.2}
                        spaceBetween={20}
                        loop={true}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        coverflowEffect={{
                            rotate: 0,
                            stretch: 0,
                            depth: 100,
                            modifier: 2,
                            slideShadows: false,
                        }}
                        modules={[EffectCoverflow, Autoplay]}
                        className="pb-10"
                    >
                        {flourOptions.map((flour, i) => (
                            <SwiperSlide key={i}>
                                <Link href={`/flour/${flour.keyword}`} className="block">
                                    <div className="bg-white rounded-3xl shadow-lg border border-white/40 overflow-hidden cursor-pointer">
                                        <div className="w-full aspect-square flex items-center justify-center">
                                            <img
                                                src={flour.image}
                                                alt={`${flour.title} Flour - Fresh & Healthy Indian Atta`}
                                                className="w-full h-full object-cover rounded-t-2xl"
                                            />
                                        </div>
                                        <div className="p-4 text-center">
                                            <h3 className="text-xl font-bold text-[#7C4A0E] mb-2">
                                                {flour.title}
                                            </h3>
                                            <p className="text-[#cc760e] text-sm leading-relaxed">
                                                {flour.desc}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* 💻 DESKTOP GRID */}
                <div className="hidden lg:grid grid-cols-3 md:gap-10 gap-6">
                    {flourOptions.map((flour, i) => (
                        <Link
                            key={i}
                            href={`/flour/${flour.keyword}`}
                            className="block"
                        >
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: (i % 3) * 0.1 }}
                                className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-white/40 hover:-translate-y-2 group cursor-pointer h-full"
                            >
                                <div className="w-full aspect-square flex items-center justify-center bg-[#fffbf2]">
                                    <img
                                        src={flour.image}
                                        alt={`${flour.title} Flour - Premium Quality Atta`}
                                        className="w-full h-full object-cover rounded-t-2xl transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>

                                <div className="p-4 text-center">
                                    <h3 className="text-2xl font-bold text-[#7C4A0E] mb-3">
                                        {flour.title}
                                    </h3>
                                    <p className="text-[#cc760e] text-sm leading-relaxed">
                                        {flour.desc}
                                    </p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Swiper Custom Styling */}
            <style jsx global>{`
        .swiper-pagination-bullet-active {
          background: #7c4a0e !important;
        }

        .swiper.swiper-coverflow.swiper-3d.swiper-initialized.swiper-horizontal.swiper-watch-progress.pb-10 {
          padding-bottom: 15px !important;
        }
      `}</style>
        </section>
    );
}
