// "use client";

// import Link from "next/link";

// export default function CategoriesGrid({ collections }) {
//     if (!collections || collections.length === 0) return null;

//     // ✅ Force exact order (instead of filter)

//     const leftOrder = [
//         "Khakhra Snack - Pure Ghee",
//         "Khakhra Snack - Oil",
//         "Biscuit Bhakhri Khakhara - Oil",
//     ];

//     const rightOrder = [
//         "Farali - Upwas - Falahari Khakhara",
//         "Holi Special Offer",
//         "Today's Offer",
//     ];

//     const leftCollections = leftOrder
//         .map((title) => collections.find((c) => c.title === title))
//         .filter(Boolean);

//     const rightCollections = rightOrder
//         .map((title) => collections.find((c) => c.title === title))
//         .filter(Boolean);

//     // Combine for mobile layout
//     const mobileCollections = [...leftCollections, ...rightCollections];

//     return (
//         <section className="bg-white">
//             <div className="max-w-7xl mx-auto px-4 py-6 md:py-15">

//                 {/* 📱 MOBILE VIEW (2 columns, 3 rows) */}
//                 <div className="grid grid-cols-2 gap-6 lg:hidden">
//                     {mobileCollections.slice(0, 6).map((collection) => (
//                         <CategoryItem key={collection.id} collection={collection} />
//                     ))}
//                 </div>

//                 {/* 💻 DESKTOP VIEW */}
//                 <div className="hidden lg:grid lg:grid-cols-[1fr_0.6fr_1fr] items-center gap-2">

//                     {/* LEFT SIDE */}
//                     <div className="grid grid-cols-3 gap-6 text-center">
//                         {leftCollections.map((collection) => (
//                             <CategoryItem key={collection.id} collection={collection} />
//                         ))}
//                     </div>

//                     {/* CENTER VIDEO */}
//                     <div className="flex justify-center">
//                         <div className="w-full rounded-2xl overflow-hidden">
//                             <video
//                                 src="https://cdn.shopify.com/videos/c/o/v/1a5e212600fe49878b0c48db287b2e02.mp4"
//                                 autoPlay
//                                 loop
//                                 muted
//                                 playsInline
//                                 className="w-full h-auto object-cover"
//                             />
//                         </div>
//                     </div>

//                     {/* RIGHT SIDE */}
//                     <div className="grid grid-cols-3 gap-6 text-center">
//                         {rightCollections.map((collection) => (
//                             <CategoryItem key={collection.id} collection={collection} />
//                         ))}
//                     </div>

//                 </div>
//             </div>
//         </section>
//     );
// }


// /* 🔹 Category Item */
// function CategoryItem({ collection }) {
//     return (
//         <Link
//             href={`/shopbycollection/${collection.handle}`}
//             className="group flex flex-col items-center text-center"
//         >
//             {/* IMAGE */}
//             <div
//                 className="
//                 relative
//                 w-32 h-32
//                 sm:w-36 sm:h-36
//                 md:w-36 md:h-36
//                 rounded-lg
//                 overflow-hidden
//                 bg-gradient-to-br
//                 from-amber-100
//                 to-orange-100
//                 shadow-md
//                 group-hover:shadow-xl
//                 transition-all duration-300
//             "
//             >
//                 {collection.image && (
//                     <img
//                         src={collection.image.url}
//                         alt={collection.image.altText || collection.title}
//                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                     />
//                 )}
//             </div>

//             {/* TITLE */}
//             <h3
//                 className="
//                 mt-2
//                 text-xs
//                 md:text-sm
//                 font-semibold
//                 text-[#7d4b0e]
//                 group-hover:text-amber-600
//                 transition-colors
//                 line-clamp-2
//                 leading-tight
//             "
//             >
//                 {collection.title}
//             </h3>
//         </Link>
//     );
// }


"use client";

import Link from "next/link";

export default function CategoriesGrid({ collections }) {
    if (!collections || collections.length === 0) return null;

    // ✅ Force exact order (instead of filter)

    const leftOrder = [
        "Khakhra Snack - Pure Ghee",
        "Khakhra Snack - Oil",
        "Biscuit Bhakhri Khakhara - Oil",
    ];

    const rightOrder = [
        "Farali - Upwas - Falahari Khakhara",
        // "Holi Special Offer",
        "Sugar Free Sweets",
        "Today's Offer",
    ];

    const leftCollections = leftOrder
        .map((title) => collections.find((c) => c.title?.trim().toLowerCase() === title.trim().toLowerCase()))
        .filter(Boolean);
    
    const rightCollections = rightOrder
        .map((title) => collections.find((c) => c.title?.trim().toLowerCase() === title.trim().toLowerCase()))
        .filter(Boolean);

    // Combine for mobile layout
    const mobileCollections = [...leftCollections, ...rightCollections];

    return (
        <section className="bg-white">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-15">

                {/* 📱 MOBILE VIEW (2 columns, 3 rows) */}
                <div className="grid grid-cols-2 gap-6 lg:hidden">
                    {mobileCollections.slice(0, 6).map((collection) => (
                        <CategoryItem key={collection.id} collection={collection} />
                    ))}
                </div>

                {/* 💻 DESKTOP VIEW */}
                <div className="hidden lg:grid lg:grid-cols-[1fr_0.6fr_1fr] items-center gap-2">

                    {/* LEFT SIDE */}
                    <div className="grid grid-cols-3 gap-6 text-center">
                        {leftCollections.map((collection) => (
                            <CategoryItem key={collection.id} collection={collection} />
                        ))}
                    </div>

                    {/* CENTER VIDEO */}
                    <div className="flex justify-center">
                        <div className="w-full rounded-2xl overflow-hidden">
                            <video
                                src="https://cdn.shopify.com/videos/c/o/v/1a5e212600fe49878b0c48db287b2e02.mp4"
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="grid grid-cols-3 gap-6 text-center">
                        {rightCollections.map((collection) => (
                            <CategoryItem key={collection.id} collection={collection} />
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}


/* 🔹 Category Item */
function CategoryItem({ collection }) {
    return (
        <Link
            href={`/shopbycollection/${collection.handle}`}
            className="group flex flex-col items-center text-center"
        >
            {/* IMAGE */}
            <div
                className="
                relative
                w-32 h-32
                sm:w-36 sm:h-36
                md:w-36 md:h-36
                rounded-lg
                overflow-hidden
                bg-gradient-to-br
                from-amber-100
                to-orange-100
                shadow-md
                group-hover:shadow-xl
                transition-all duration-300
            "
            >
                {collection.image && (
                    <img
                        src={collection.image.url}
                        alt={collection.image.altText || collection.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                )}
            </div>

            {/* TITLE */}
            <h3
                className="
                mt-2
                text-xs
                md:text-sm
                font-semibold
                text-[#7d4b0e]
                group-hover:text-amber-600
                transition-colors
                line-clamp-2
                leading-tight
            "
            >
                {collection.title}
            </h3>
        </Link>
    );
}
