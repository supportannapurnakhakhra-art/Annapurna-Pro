"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function HoliSpecialOffer() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        // Set target date for Holi Offer (e.g., March 14, 2026)
        const targetDate = new Date("March 4, 2026 23:59:59").getTime();

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000),
                });
            } else {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const TimeUnit = ({ value, label }) => (
        <div className="flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm border border-orange-100 rounded-2xl p-1 sm:p-4 min-w-[50px] sm:min-w-[70px] md:min-w-[90px] shadow-sm hover:shadow-md transition-shadow duration-300">
            <span className="text-2xl sm:text-4xl font-black text-yellow-600 tabular-nums">
                {String(value).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-[#7C4A0E] uppercase tracking-wider mt-1">
                {label}
            </span>
        </div>
    );

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">

            {/* Soft Holi Color Blobs */}
            <div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>

            <div className="absolute -bottom-40 -right-40 w-[450px] h-[450px] bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>

            <div className="absolute top-[25%] right-[10%] w-[300px] h-[300px] bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>

            <div className="absolute bottom-[15%] left-[20%] w-[280px] h-[280px] bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>

            {/* Keep Your Existing Content */}
            <div className="relative z-10">

                <div className="flex flex-col lg:flex-row items-center gap-4 md:gap-12 lg:gap-12">
                    {/* Left Side: Image */}
                    <div className="w-full lg:w-1/2 relative group">
                        <div className="relative overflow-hidden shadow-2xl transition-transform duration-500 ">
                            <Image
                                src="https://cdn.shopify.com/s/files/1/0953/6284/2993/files/Gemini_Generated_Image_kv5mhxkv5mhxkv5m.png?v=1771999127"
                                alt="Holi Special Khakhra Offer"
                                width={800}
                                height={800}
                                className="w-full h-auto object-cover"
                                priority
                            />
                            {/* <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" /> */}
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute -z-10 -top-6 -left-6 w-32 h-32 bg-orange-100 rounded-full blur-3xl opacity-60 animate-pulse" />
                        <div className="absolute -z-10 -bottom-6 -right-6 w-48 h-48 bg-yellow-100 rounded-full blur-3xl opacity-60 animate-pulse delay-700" />
                    </div>

                    {/* Right Side: Content and Countdown */}
                    <div className="w-full lg:w-1/2 space-y-8 text-center lg:text-left pt-10">
                        <div className="space-y-4 mb-2 md:mb-4">
                            {/* <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-bold uppercase tracking-widest animate-bounce">
                                Holi Dhamaka 🌈
                            </span> */}
                            <h2 className="text-2xl md:text-5xl font-heading font-extrabold text-[#7C4A0E] tracking-tight leading-tight mb-1 md:mb-4">
                                Celebrate <span className="text-yellow-600">Holi</span> with <br />
                                Crunch & Colors!
                            </h2>
                            <p className="text-sm md:text-lg text-[#cc760e] font-medium max-w-xl mx-auto lg:mx-0 mb-4">
                                The most colorful sale of the year is here! Grab your favorite flavors
                                at festive prices before the clock runs out.
                            </p>
                        </div>

                        {/* Countdown Timer */}
                        <div className="space-y-4 max-w-fit justify-self-center md:justify-self-start">
                            <p className="text-xs md:text-sm text-left center px-3 font-bold text-[#7C4A0E]/60 uppercase mb-2 md:mb-4 tracking-widest">
                                Offer ends in:
                            </p>
                            <div className="flex items-center justify-center lg:justify-start gap-3 sm:gap-4">
                                <TimeUnit value={timeLeft.days} label="Days" />
                                <span className="md:text-2xl text-xl font-bold text-orange-200 mt-[-20px] hidden sm:block">:</span>
                                <TimeUnit value={timeLeft.hours} label="Hours" />
                                <span className="md:text-2xl text-xl font-bold text-orange-200 mt-[-20px] hidden sm:block">:</span>
                                <TimeUnit value={timeLeft.minutes} label="Mins" />
                                <span className="md:text-2xl text-xl font-bold text-orange-200 mt-[-20px] hidden sm:block">:</span>
                                <TimeUnit value={timeLeft.seconds} label="Secs" />
                            </div>
                        </div>

                        {/* Shop Now Button */}
                        <div className="md:pt-4">
                            <Link
                                href="/shopbycollection/holi-special-offer"
                                className="group inline-flex items-center justify-center md:px-10 px-4 md:py-4 py-2 bg-[#7D4B0E] text-white rounded-full md:text-lg text-md font-bold shadow-xl hover:bg-yellow-600 hover:shadow-orange-200/50 hover:-translate-y-1 transition-all duration-300"
                            >
                                Shop Holi Specials Now
                                <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                            <p className="my-4 text-sm text-[#8B5E2B]/70 italic">
                                *Limited quantity available for special flavors
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
