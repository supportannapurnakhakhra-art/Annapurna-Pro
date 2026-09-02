// LiveStats.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, ShoppingCart } from "lucide-react";

function hashToNumber(value) {
    if (!value) return 1;
    const str = value.toString();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

export default function LiveStats({ productId }) {
    const seed = useMemo(() => hashToNumber(productId), [productId]);

    const [bought, setBought] = useState(480 + (seed % 60));
    const [viewing, setViewing] = useState(280 + (seed % 40));
    const [active, setActive] = useState(0);

    useEffect(() => {
        const rotate = setInterval(() => {
            setActive((prev) => (prev + 1) % 2);
        }, 3000); // Slower rotation
        return () => clearInterval(rotate);
    }, []);

    useEffect(() => {
        const update = setInterval(() => {
            setBought((p) => p + Math.floor(Math.random() * 2));
            setViewing((p) => Math.max(1, p + (Math.random() > 0.5 ? 1 : -1)));
        }, 4000);
        return () => clearInterval(update);
    }, []);

    return (
        <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 mt-2 mb-4">
            <div key={active} className="flex items-center gap-1.5 animate-fade-in">
                {active === 0 ? (
                    <>
                        <ShoppingCart className="h-3.5 w-3.5 text-orange-600" />
                        <span>
                            <span className="font-bold text-orange-600">{bought}</span> people bought this in last 24 hours
                        </span>
                    </>
                ) : (
                    <>
                        <Eye className="h-3.5 w-3.5 text-orange-600" />
                        <span>
                            <span className="font-bold text-orange-600">{viewing}</span> people viewing right now
                        </span>
                    </>
                )}
            </div>
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
}
