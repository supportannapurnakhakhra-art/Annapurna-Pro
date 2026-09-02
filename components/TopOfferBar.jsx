

"use client";

import { useEffect, useState } from "react";

export default function TopOfferBar() {
  const offers = [
    <>
      Free Shipping on Orders Above{" "}
      <span className="highlight">₹599</span>
    </>,
    <>
      Get <span className="highlight">10% Discount</span> on Prepaid Orders
    </>
  ];

  const [currentOffer, setCurrentOffer] = useState(0);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimate(false); // trigger exit animation

      setTimeout(() => {
        setCurrentOffer((prev) => (prev + 1) % offers.length);
        setAnimate(true); // trigger enter animation
      }, 400);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="offer-wrapper">
        <div className={`offer-text ${animate ? "slide-in" : "slide-out"}`}>
          {offers[currentOffer]}
        </div>
      </div>

      <style>{`

        .offer-wrapper {
          width: 100%;
          background: #7d4b0e;
          color: white;
          padding: 8px 16px;
          text-align: center;
          font-size: 12px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          overflow: hidden;
          position: relative;
        }

        .offer-text {
          transition: all 0.4s ease;
        }

        .slide-in {
          opacity: 1;
          transform: translateY(0);
        }

        .slide-out {
          opacity: 0;
          transform: translateY(-20px);
        }

        .highlight {
          font-size: 14px;
          font-weight: 800;
          padding: 0 4px;
          animation: glow 1.6s infinite ease-in-out;
        }

        @media (max-width: 768px) {
          .offer-wrapper {
            font-size: 10px;
          }
            .highlight {
              font-size: 12px;
            }
        }

        @keyframes glow {
          0% {
            text-shadow: 0 0 4px #fde68a;
          }
          50% {
            text-shadow: 0 0 12px #fff, 0 0 20px #fde68a;
          }
          100% {
            text-shadow: 0 0 4px #fde68a;
          }
        }

      `}</style>
    </>
  );
}




// "use client";

// import { useEffect, useState } from "react";

// export default function TopOfferBar() {
//     const offers = [
//         <>
//             Free Shipping on Orders Above{" "}
//             <span className="text-sm text-white font-extrabold px-1 animate-price-glow">
//                 ₹499
//             </span>
//         </>,
//         <>
//             Get{" "}
//             <span className="text-sm text-white font-extrabold px-1 animate-price-glow">
//                 10% Discount
//             </span>{" "}
//             on Prepaid Orders
//         </>
//     ];

//     const [currentOffer, setCurrentOffer] = useState(0);

//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCurrentOffer((prev) => (prev + 1) % offers.length);
//         }, 3000); // 3 seconds

//         return () => clearInterval(interval);
//     }, []);

//     return (
//         <>
//             <div className="w-full bg-[#7d4b0e] text-white py-2 text-center px-4 shadow-sm relative z-[60] overflow-hidden animate-bg-glow">
//                 <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider animate-slow-shine relative transition-opacity duration-500">
//                     {offers[currentOffer]}
//                 </p>
//             </div>

//             <style>{`
//         @keyframes price-glow {
//           0% {
//             text-shadow: 0 0 4px #fde68a;
//             transform: scale(1);
//           }
//           50% {
//             text-shadow: 0 0 10px #ffffff, 0 0 20px #fde68a;
//             transform: scale(1.05);
//           }
//           100% {
//             text-shadow: 0 0 4px #ffffff;
//             transform: scale(1);
//           }
//         }

//         .animate-price-glow {
//           animation: price-glow 1.6s infinite ease-in-out;
//         }

//         @keyframes slow-shine {
//           0% {
//             text-shadow: 0 0 4px rgba(255, 255, 255, 0.4);
//             background-position: 200% center;
//           }
//           40% {
//             text-shadow:
//               0 0 12px rgba(255, 255, 255, 0.9),
//               0 0 22px rgba(251, 146, 60, 0.8),
//               0 0 32px rgba(251, 146, 60, 0.6);
//             background-position: -200% center;
//           }
//           70% {
//             text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
//             background-position: 200% center;
//           }
//           100% {
//             text-shadow: 0 0 4px rgba(255, 255, 255, 0.4);
//             background-position: -200% center;
//           }
//         }

//         @keyframes bg-glow {
//           0%, 100% {
//             background-color: #7d4b0e;
//             box-shadow: inset 0 0 20px rgba(251, 146, 60, 0.2);
//           }
//           50% {
//             background-color: #8a5410;
//             box-shadow: inset 0 0 40px rgba(251, 146, 60, 0.45),
//                         0 0 30px rgba(251, 146, 60, 0.35);
//           }
//         }

//         .animate-slow-shine {
//           background: linear-gradient(
//             90deg,
//             transparent 0%,
//             rgba(255, 255, 255, 0.25) 45%,
//             rgba(255, 255, 255, 0.9) 50%,
//             rgba(255, 255, 255, 0.25) 55%,
//             transparent 100%
//           );
//           background-size: 200% auto;
//           background-clip: text;
//           -webkit-background-clip: text;
//           color: #ffffff;
//           animation: slow-shine 4s ease-in-out infinite;
//         }

//         .animate-bg-glow {
//           animation: bg-glow 4s ease-in-out infinite;
//         }
//       `}</style>
//         </>
//     );
// }
