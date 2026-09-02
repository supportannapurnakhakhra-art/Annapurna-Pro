// "use client";

// import React from "react";
// import { motion } from "framer-motion";

// export default function ShopByOilPreferenceSection({
//   title = "Choose Your Oil. Choose Your Lifestyle.",
//   oils = [
//     {
//       name: "Oil Khakhra",
//       desc: "Light, crisp, and perfect for daily snacking.",
//       image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/7_d43757f8-76c6-4254-8edb-931c88d194ae.png?v=1770090982",
//       cta: "Shop Now",
//       link: "/shop/veg-oil",
//     },
//     {
//       name: "Pure Ghee Khakhra",
//       desc: "Luxurious, aromatic, and truly divine.",
//       image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/9_9d267641-0b3a-4283-bf31-719c12be27fa.png?v=1770090969",
//       cta: "Shop Now",
//       link: "/shop/pure-ghee",
//     },
//   ],
// }) {
//   return (
//     <section className="relative bg-[#fdfbf7] py-6 md:py-20">
//       <div className="max-w-6xl mx-auto md:px-6 px-2">
//         {/* Title */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5 }}
//           className="text-center mb-6 md:mb-14"
//         >
//           <h2 className="text-xl md:text-2xl md:text-4xl font-extrabold text-[#7C4A0E]">
//             {title}
//           </h2>
//         </motion.div>

//         {/* Cards */}
//         <div className="grid grid-cols-2 sm:grid-cols-2 gap-2fixed right-4 z-[99] w-10 h-10 md:w-14 md:h-14 rounded-full bg-[#7d4b0e] hover:bg-yellow-600 text-white flex items-center justify-center shadow-lg transition-all gt-pulse-shadow
//           bottom-25 md:gap-10">
//           {oils.map((oil, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.5, delay: index * 0.1 }}
//               whileHover={{ y: -6 }}
//               className="bg-white md:rounded-3xl rounded-xl border border-amber-100 shadow-sm hover:shadow-xl transition overflow-hidden"
//             >
//               {/* Image */}
//               <div className="bg-[#fff7ec] p-0 ">
//                 <img
//                   src={oil.image}
//                   alt={oil.name}
//                   className="w-auto h-full object-contain"
//                 />
//               </div>

//               {/* Content */}
//               <div className="p-1 md:p-6 text-center">
//                 <h3 className="md:text-xl text-sm font-bold text-[#7C4A0E] mb-2">
//                   {oil.name}
//                 </h3>

//                 <p className="md:text-sm text-xs text-[#9c6b2f] mb-2 md:mb-5">
//                   {oil.desc}
//                 </p>

//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }
"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ShopByOilPreferenceSection({
  title = "Choose Your Oil. Choose Your Lifestyle.",
  oils = [
    {
      name: "Oil Khakhra",
      desc: "Light, crisp, and perfect for daily snacking.",
      image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/7_d43757f8-76c6-4254-8edb-931c88d194ae.png?v=1770090982",
      cta: "Shop Now",
      link: "/shop/veg-oil",
    },
    {
      name: "Pure Ghee Khakhra",
      desc: "Luxurious, aromatic, and truly divine.",
      image: "https://cdn.shopify.com/s/files/1/0953/6284/2993/files/9_9d267641-0b3a-4283-bf31-719c12be27fa.png?v=1770090969",
      cta: "Shop Now",
      link: "/shop/pure-ghee",
    },
  ],
}) {
  return (
    <section className="relative bg-[#fdfbf7] py-6 md:py-20">
      <div className="max-w-6xl mx-auto md:px-6 px-2">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 md:mb-14"
        >
          <h2 className="text-xl md:text-2xl md:text-4xl font-extrabold text-[#7C4A0E]">
            {title}
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 md:gap-10">
          {oils.map((oil, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className="bg-white md:rounded-3xl rounded-xl border border-amber-100 shadow-sm hover:shadow-xl transition overflow-hidden"
            >
              {/* Image */}
              <div className="bg-[#fff7ec] p-0 ">
                <img
                  src={oil.image}
                  alt={oil.name}
                  className="w-auto h-full object-contain"
                />
              </div>

              {/* Content */}
              <div className="p-1 md:p-6 text-center">
                <h3 className="md:text-xl text-sm font-bold text-[#7C4A0E] mb-2">
                  {oil.name}
                </h3>

                <p className="md:text-sm text-xs text-[#9c6b2f] mb-2 md:mb-5">
                  {oil.desc}
                </p>

              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
