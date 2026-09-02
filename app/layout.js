import "./globals.css";
import Script from "next/script";
import Footer from "@/components/Footer";
import ClientLayout from "@/components/ClientLayout";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
import GoToTopButton from "@/components/GoToTopButton";
import PixelEvents from "@/components/PixelEvents";
import ClientSafetyWrapper from "@/components/ClientSafetyWrapper";
import { CartProvider } from "@/context/CartContext";

export const dynamic = "force-dynamic";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Script
          src="https://app-checkout-bhagvatprasadam.megascale.co.in/v1/checkout.js"
          strategy="afterInteractive"
        />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BWC85W6WHQ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BWC85W6WHQ');
          `}
        </Script>

        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1226926032689901');
          `}
        </Script>

        {/* Razorpay Script - Pre-loaded for Checkout */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />

        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;
              t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];
              y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "uz4dudvfuk");
          `}
        </Script>

        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1226926032689901&ev=PageView&noscript=1"
          />
        </noscript>

        {/* ✅ CLIENT SAFETY WRAPPER */}
        <CartProvider>
          <ClientSafetyWrapper>
            <ClientLayout>
              {children}
              <PixelEvents />
              <WhatsAppFloatingButton />
              <GoToTopButton />
            </ClientLayout>
            <Footer />
          </ClientSafetyWrapper>
        </CartProvider>
      </body>
    </html>
  );
}

// // app/layout.js — CORRECT & SAFE (SERVER COMPONENT)

// import "./globals.css";
// import Script from "next/script";
// import Footer from "@/components/Footer";
// import ClientLayout from "@/components/ClientLayout";
// import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
// import GoToTopButton from "@/components/GoToTopButton";
// import PixelEvents from "@/components/PixelEvents";
// import ClientSafetyWrapper from "@/components/ClientSafetyWrapper";

// export const dynamic = "force-dynamic";

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className="min-h-screen bg-gray-50">
//         <Script
//           src="http://10.27.4.14:5174/checkout-embed.js"
//           strategy="afterInteractive"
//         />

//         <Script id="checkout-embed-init" strategy="afterInteractive">
//           {`
//             (function () {
//               function tryInit(triesLeft) {
//                 if (window.CheckoutCurrenciesEmbed && typeof window.CheckoutCurrenciesEmbed.init === "function") {
//                   window.CheckoutCurrenciesEmbed.init({
//                     iframeUrl: "http://10.27.4.14:5173",
//                     apiBaseUrl: "http://10.27.4.14:5050",
//                     storeId: "6a03fba0692906d5c13d169c"
//                   });
//                   return;
//                 }
//                 if (triesLeft <= 0) {
//                   console.error("[CheckoutCurrenciesEmbed] not available. Check script URL / mixed-content blocking.");
//                   return;
//                 }
//                 setTimeout(function () { tryInit(triesLeft - 1); }, 50);
//               }
//               tryInit(100);
//             })();
//           `}
//         </Script>

//         {/* Google Analytics */}
//         <Script
//           src="https://www.googletagmanager.com/gtag/js?id=G-BWC85W6WHQ"
//           strategy="afterInteractive"
//         />
//         <Script id="google-analytics" strategy="afterInteractive">
//           {`
//             window.dataLayer = window.dataLayer || [];
//             function gtag(){dataLayer.push(arguments);}
//             gtag('js', new Date());
//             gtag('config', 'G-BWC85W6WHQ');
//           `}
//         </Script>

//         {/* Meta Pixel */}
//         <Script id="meta-pixel" strategy="afterInteractive">
//           {`
//             !function(f,b,e,v,n,t,s)
//             {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
//             n.callMethod.apply(n,arguments):n.queue.push(arguments)};
//             if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
//             n.queue=[];t=b.createElement(e);t.async=!0;
//             t.src=v;s=b.getElementsByTagName(e)[0];
//             s.parentNode.insertBefore(t,s)}(window, document,'script',
//             'https://connect.facebook.net/en_US/fbevents.js');
//             fbq('init', '1226926032689901');
//           `}
//         </Script>

//         {/* Razorpay Script - Pre-loaded for Checkout */}
//         <Script
//           src="https://checkout.razorpay.com/v1/checkout.js"
//           strategy="afterInteractive"
//         />

//         {/* Microsoft Clarity */}
//         <Script id="microsoft-clarity" strategy="afterInteractive">
//           {`
//             (function(c,l,a,r,i,t,y){
//               c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
//               t=l.createElement(r);t.async=1;
//               t.src="https://www.clarity.ms/tag/"+i;
//               y=l.getElementsByTagName(r)[0];
//               y.parentNode.insertBefore(t,y);
//             })(window, document, "clarity", "script", "uz4dudvfuk");
//           `}
//         </Script>

//         <noscript>
//           <img
//             height="1"
//             width="1"
//             style={{ display: "none" }}
//             src="https://www.facebook.com/tr?id=1226926032689901&ev=PageView&noscript=1"
//           />
//         </noscript>

//         {/* ✅ CLIENT SAFETY WRAPPER */}
//         <ClientSafetyWrapper>
//           <ClientLayout>
//             {children}
//             <PixelEvents />
//             <WhatsAppFloatingButton />
//             <GoToTopButton />
//           </ClientLayout>
//           <Footer />
//         </ClientSafetyWrapper>

//       </body>
//     </html>
//   );
// }

// app/layout.js — CORRECT & SAFE (SERVER COMPONENT)

// import "./globals.css";
// import Script from "next/script";
// import Footer from "@/components/Footer";
// import ClientLayout from "@/components/ClientLayout";
// import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";
// import GoToTopButton from "@/components/GoToTopButton";
// import PixelEvents from "@/components/PixelEvents";
// import ClientSafetyWrapper from "@/components/ClientSafetyWrapper";

// export const dynamic = "force-dynamic";

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body className="min-h-screen bg-gray-50">
//         <Script
//           src="https://checkout-ui.annapurna.org.in/checkout-embed.js"
//           strategy="afterInteractive"
//         />

//         <Script id="checkout-embed-init" strategy="afterInteractive">
//           {`
//             (function () {
//               function tryInit(triesLeft) {
//                 if (window.CheckoutCurrenciesEmbed && typeof window.CheckoutCurrenciesEmbed.init === "function") {
//                   window.CheckoutCurrenciesEmbed.init({
//                     iframeUrl: "app-checkout-annapurna.megascale.co.in",
//                     apiBaseUrl: "api-checkout-annapurna.megascale.co.in",
//                     storeId: "6a03fba0692906d5c13d169c"
//                   });
//                   return;
//                 }
//                 if (triesLeft <= 0) {
//                   console.error("[CheckoutCurrenciesEmbed] not available. Check script URL / mixed-content blocking.");
//                   return;
//                 }
//                 setTimeout(function () { tryInit(triesLeft - 1); }, 50);
//               }
//               tryInit(100);
//             })();
//           `}
//         </Script>

//         {/* Google Analytics */}
//         <Script
//           src="https://www.googletagmanager.com/gtag/js?id=G-BWC85W6WHQ"
//           strategy="afterInteractive"
//         />
//         <Script id="google-analytics" strategy="afterInteractive">
//           {`
//             window.dataLayer = window.dataLayer || [];
//             function gtag(){dataLayer.push(arguments);}
//             gtag('js', new Date());
//             gtag('config', 'G-BWC85W6WHQ');
//           `}
//         </Script>

//         {/* Meta Pixel */}
//         <Script id="meta-pixel" strategy="afterInteractive">
//           {`
//             !function(f,b,e,v,n,t,s)
//             {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
//             n.callMethod.apply(n,arguments):n.queue.push(arguments)};
//             if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
//             n.queue=[];t=b.createElement(e);t.async=!0;
//             t.src=v;s=b.getElementsByTagName(e)[0];
//             s.parentNode.insertBefore(t,s)}(window, document,'script',
//             'https://connect.facebook.net/en_US/fbevents.js');
//             fbq('init', '1226926032689901');
//           `}
//         </Script>

//         {/* Razorpay Script - Pre-loaded for Checkout */}
//         <Script
//           src="https://checkout.razorpay.com/v1/checkout.js"
//           strategy="afterInteractive"
//         />

//         {/* Microsoft Clarity */}
//         <Script id="microsoft-clarity" strategy="afterInteractive">
//           {`
//             (function(c,l,a,r,i,t,y){
//               c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
//               t=l.createElement(r);t.async=1;
//               t.src="https://www.clarity.ms/tag/"+i;
//               y=l.getElementsByTagName(r)[0];
//               y.parentNode.insertBefore(t,y);
//             })(window, document, "clarity", "script", "uz4dudvfuk");
//           `}
//         </Script>

//         <noscript>
//           <img
//             height="1"
//             width="1"
//             style={{ display: "none" }}
//             src="https://www.facebook.com/tr?id=1226926032689901&ev=PageView&noscript=1"
//           />
//         </noscript>

//         {/* ✅ CLIENT SAFETY WRAPPER */}
//         <ClientSafetyWrapper>
//           <ClientLayout>
//             {children}
//             <PixelEvents />
//             <WhatsAppFloatingButton />
//             <GoToTopButton />
//           </ClientLayout>
//           <Footer />
//         </ClientSafetyWrapper>

//       </body>
//     </html>
//   );
// }
