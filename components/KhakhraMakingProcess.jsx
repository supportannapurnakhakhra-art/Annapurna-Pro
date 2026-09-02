"use client";

import React from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
// import { EffectCoverflow, Pagination } from "swiper/modules";
import { EffectCoverflow, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

export default function KhakhraMakingProcess() {
  const steps = [
    {
      image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/k5.png?v=1770090973",
      title: "Premium Ingredients",
      desc: "Finest wheat, spices, and oils carefully selected for rich authentic taste."
    },
    {
      image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/k6.png?v=1770090971",
      title: "Perfect Dough",
      desc: "Soft, smooth dough kneaded with precision for ideal texture."
    },
    {
      image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/k7.png?v=1770090973",
      title: "Hand Rolling",
      desc: "Each khakhra is rolled evenly for thin, uniform crispness."
    },
    {
      image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/k8.png?v=1770090975",
      title: "Slow Roasting",
      desc: "Roasted on low flame to achieve a golden, crunchy perfection."
    },
    {
      image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/9_9d267641-0b3a-4283-bf31-719c12be27fa.png?v=1770090969",
      title: "Flavor Seasoning",
      desc: "Balanced seasoning added for consistent, delightful taste."
    },
    {
      image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/k10.png?v=1770090972",
      title: "Fresh Packing",
      desc: "Packed with hygiene and care so freshness stays locked in."
    }
  ];

  return (
    <section className="py-4 md:py-20 bg-[#fff7e5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto md:px-6 text-center">

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="md:text-4xl text-2xl font-extrabold mb-4 bg-[#7C4A0E] bg-clip-text text-transparent"
        >
          How Our Khakhra is Made
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-2xl mx-auto text-[#cc760e] md:mb-14 mb-6 md:text-lg text-sm"
        >
          Traditional techniques blended with modern hygiene. Each Khakhra is handmade with care, purity and love.
        </motion.p>

        {/* 📱 MOBILE SLIDER */}
        {/* 📱 MOBILE SLIDER */}
        <div className="lg:hidden">
          <Swiper
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={1.3}
            spaceBetween={20}
            loop={true}
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 120,
              modifier: 2,
              slideShadows: false,
            }}
            modules={[EffectCoverflow, Autoplay]}
            className="pb-6"
          >
            {steps.map((step, i) => (
              <SwiperSlide key={i}>
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                  <div className="w-full">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full object-contain"
                    />
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="text-lg font-semibold text-[#7C4A0E] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[#cc760e] text-sm">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>


        {/* 💻 DESKTOP GRID (unchanged) */}
        <div className="hidden lg:grid grid-cols-3 md:gap-12 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/40 hover:-translate-y-2"
            >
              <div className="w-full flex items-center justify-center">
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full object-contain"
                />
              </div>

              <div className="md:p-7 p-4 text-center">
                <h3 className="md:text-2xl text-xl font-semibold text-[#7C4A0E] mb-2">
                  {step.title}
                </h3>
                <p className="text-[#cc760e] md:text-sm text-xs leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
      <style>{`
        .swiper.swiper-coverflow.swiper-3d.swiper-initialized.swiper-horizontal.swiper-watch-progress.pb-6{
          padding-bottom: 15px;
        }
      `}</style>
    </section>
  );
}



// "use client";

// import React from "react";
// import { motion } from "framer-motion";

// export default function KhakhraMakingProcess() {
//   const steps = [
//     {
//       image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/k5.png?v=1770090973k5.webp",
//       title: "Premium Ingredients",
//       desc: "Finest wheat, spices, and oils carefully selected for rich authentic taste."
//     },
//     {
//       image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/k6.png?v=1770090971",
//       title: "Perfect Dough",
//       desc: "Soft, smooth dough kneaded with precision for ideal texture."
//     },
//     {
//       image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/k7.png?v=1770090973",
//       title: "Hand Rolling",
//       desc: "Each khakhra is rolled evenly for thin, uniform crispness."
//     },
//     {
//       image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/k8.png?v=1770090975",
//       title: "Slow Roasting",
//       desc: "Roasted on low flame to achieve a golden, crunchy perfection."
//     },
//     {
//       image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/9_9d267641-0b3a-4283-bf31-719c12be27fa.png?v=17700909699.webp",
//       title: "Flavor Seasoning",
//       desc: "Balanced seasoning added for consistent, delightful taste."
//     },
//     {
//       image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/k10.png?v=1770090972",
//       title: "Fresh Packing",
//       desc: "Packed with hygiene and care so freshness stays locked in."
//     }
//   ];

//   return (
//     <section className="py-4 md:py-20 bg-[#fff7e5] relative overflow-hidden">

//       {/* Soft Background Pattern */}
//       <div className="max-w-7xl mx-auto px-6 text-center relative z-10">

//         {/* Title */}
//         <motion.h2
//           initial={{ opacity: 0, y: -20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7 }}
//           className="md:text-4xl text-2xl font-extrabold mb-4 bg-[#7C4A0E] font-heading bg-clip-text text-transparent"
//         >
//           How Our Khakhra is Made
//         </motion.h2>

//         {/* Subtitle */}
//         <motion.p
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.7, delay: 0.2 }}
//           className="max-w-2xl mx-auto text-[#cc760e] font-body md:mb-14 mb-6 md:text-lg text-sm"
//         >
//           Traditional techniques blended with modern hygiene. Each Khakhra is handmade with care, purity and love.
//         </motion.p>

//         {/* Cards Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:gap-12 gap-6">
//           {steps.map((step, i) => (
//             <motion.div
//               key={i}
//               initial={{ opacity: 0, y: 40 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.7, delay: i * 0.15 }}
//               className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/40 hover:-translate-y-2"
//             >
//               {/* Image */}
//               <div className="h-auto w-full overflow-hidden flex items-center justify-center">
//                 <img
//                   src={step.image}
//                   alt={step.title}
//                   className="w-full object-contain"
//                 />
//               </div>

//               {/* Text */}
//               <div className="md:p-7 p-4 text-center">
//                 <h3 className="md:text-2xl text-xl font-semibold font-heading text-[#7C4A0E] mb-2">
//                   {step.title}
//                 </h3>
//                 <p className="text-[#cc760e] font-body md:text-sm text-xs leading-relaxed">
//                   {step.desc}
//                 </p>
//               </div>
//             </motion.div>
//           ))}
//         </div>

//       </div>
//     </section>
//   );
// }
