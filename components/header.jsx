"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import TopOfferBar from "./TopOfferBar";
import {
  User,
  ShoppingCart,
  LogOut,
  Package,
  UserCircle,
  Menu,
  X,
  Search,
  Heart
} from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import authStore from "@/lib/api/stores/authStore";
import shopServices from "@/lib/api/services";

export default function Header({ cart, openCart }) {
  const { wishlist, openWishlist } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [customerInitial, setCustomerInitial] = useState("?");
  const [customerName, setCustomerName] = useState("");

  const itemCount = cart?.lines?.edges?.reduce((s, { node }) => s + node.quantity, 0) || 0;

  const headerRef = useRef(null);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/shopbycollection", label: "Collection" },
    { href: "/shopbycollection/todays-offer", label: "Today's Offer" },
    { href: "/Shop", label: "Shop" },
    // { href: "/shopbycollection/holi-special-offer", label: "Holi Special" },
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ];

  const leftNavLinks = navLinks.slice(0, 4);
  const rightNavLinks = navLinks.slice(4);

  useEffect(() => {
    // 1️⃣ Product pages → Collection
    if (pathname.startsWith("/product") || pathname.startsWith("/products") || pathname.startsWith("/collection")) {
      setActiveLink("Collection");
      return;
    }
    if (pathname.startsWith("/blog")) {
      setActiveLink("Blog");
      return;
    }

    // 2️⃣ Try exact match from navLinks
    const current = navLinks.find((link) => link.href === pathname);

    if (current) {
      setActiveLink(current.label);
    } else {
      // 3️⃣ Any unknown route → Home
      setActiveLink("Home");
    }
  }, [pathname]);

  useEffect(() => {
    const handleSetLink = (e) => {
      if (e.detail) {
        setActiveLink(e.detail);
      }
    };
    window.addEventListener("set-active-header-link", handleSetLink);
    return () => window.removeEventListener("set-active-header-link", handleSetLink);
  }, []);

  // Customer data load via authStore
  useEffect(() => {
    const loadCustomerData = async () => {
      if (typeof window === "undefined") return;

      const jwt = localStorage.getItem("userToken");
      const customerId = localStorage.getItem("customerShopifyId");

      if (!jwt && !customerId) {
        setIsLoggedIn(false);
        setCustomerInitial("?");
        setCustomerName("");
        return;
      }

      try {
        const customer = await authStore.getCustomerProfile();

        if (customer) {
          setIsLoggedIn(true);

          const fullName = `${customer.firstName || ""} ${customer.lastName || ""}`.trim();
          setCustomerName(fullName || customer.phone || customer.email || "User");

          if (customer.firstName && customer.firstName.trim()) {
            setCustomerInitial(customer.firstName.trim().charAt(0).toUpperCase());
          } else if (customer.email && customer.email.trim()) {
            setCustomerInitial(customer.email.trim().charAt(0).toUpperCase());
          } else {
            setCustomerInitial("U");
          }
        } else {
          // Invalid state or unauthorized session
          setIsLoggedIn(false);
          setCustomerInitial("?");
          setCustomerName("");
        }
      } catch (err) {
        console.error("Header: Failed to fetch customer data via authStore", err);
        if (jwt || customerId) {
          setIsLoggedIn(true);
          setCustomerInitial("U");
          setCustomerName("User");
        }
      }
    };

    loadCustomerData();

    const handleUpdate = () => loadCustomerData();
    window.addEventListener("customer-updated", handleUpdate);
    window.addEventListener("customer-logout", handleUpdate);

    return () => {
      window.removeEventListener("customer-updated", handleUpdate);
      window.removeEventListener("customer-logout", handleUpdate);
    };
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const toggleUserMenu = () => setIsUserMenuOpen((prev) => !prev);

  const handleNavClick = useCallback((label, href) => {
    setActiveLink(label);
    router.push(href);
    setIsMobileMenuOpen(false);
  }, [router]);

  const handleOpenAccount = () => {
    window.dispatchEvent(new Event("open-login-modal"));
  };

  const handleLogout = () => {
    authStore.logoutCustomer();
    if (typeof window !== 'undefined') {
      localStorage.removeItem("customerEmail");
      localStorage.removeItem("customerFirstName");
    }
    setIsLoggedIn(false);
    setCustomerName("");
    setCustomerInitial("?");
    router.push("/");
    setIsUserMenuOpen(false);
  };

  const handleWishlistClick = () => {
    if (isLoggedIn) {
      openWishlist();
    } else {
      window.dispatchEvent(new Event("open-login-modal"));
    }
  };

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof openCart === "function") {
      openCart();
    }
  };

  useEffect(() => {
    const handleOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState({ products: [], collections: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const desktopSearchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const desktopSuggestionsRef = useRef(null);
  const mobileSuggestionsRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen) {
      // Small delay to ensure render is complete
      setTimeout(() => {
        if (window.innerWidth >= 1024) {
          desktopSearchInputRef.current?.focus();
        } else {
          mobileSearchInputRef.current?.focus();
        }
      }, 50);
    }
  }, [isSearchOpen]);

  // Live Search Effect (Custom Backend Integration)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        setShowSuggestions(true);
        try {
          // Use our new shopServices for live search suggestions
          const products = await shopServices.getProducts({ search: searchQuery.trim(), limit: 6 });
          // Note: If backend has a separate collections search, we could add it here
          setSuggestions({
            products: products || [],
            collections: [] // Placeholder or fetch if needed
          });
        } catch (error) {
          console.error("Search error via shopServices:", error);
          setSuggestions({ products: [], collections: [] });
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions({ products: [], collections: [] });
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideDesktop =
        desktopSuggestionsRef.current &&
        !desktopSuggestionsRef.current.contains(event.target) &&
        desktopSearchInputRef.current &&
        !desktopSearchInputRef.current.contains(event.target);

      const isOutsideMobile =
        mobileSuggestionsRef.current &&
        !mobileSuggestionsRef.current.contains(event.target) &&
        mobileSearchInputRef.current &&
        !mobileSearchInputRef.current.contains(event.target);

      if (isOutsideDesktop && isOutsideMobile) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsSearchOpen(false);
    setShowSuggestions(false);
    setSearchQuery("");
  }, [pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/Shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Format currency helper
  const formatPrice = (amount, currencyCode) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode || 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="w-full bg-gradient-to-b from-gray-50 to-transparent sticky top-0 z-50">
        <div className="pb-3 sm:pb-4">
          <TopOfferBar />
          {/* <div className="w-full bg-[#7d4b0e] text-white py-2 text-center px-4 shadow-sm relative z-[60] overflow-hidden animate-bg-glow">
            <div className="flex flex-row items-center justify-center leading-tight space-y-1">

              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider animate-slow-shine relative">
                Free Shipping on Orders Above{" "}
                <span className="text-sm text-white font-extrabold px-1 animate-price-glow">
                  ₹599
                </span>
              </p>

              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider animate-slow-shine relative">
                Get{" "}
                <span className="text-sm text-white font-extrabold px-1 animate-price-glow">
                  10% Extra Discount
                </span>{" "}
                on Prepaid Orders
              </p>

            </div>
          </div>

          <style>{`
  @keyframes price-glow {
    0% {
      text-shadow: 0 0 4px #fde68a;
      transform: scale(1);
    }
    50% {
      text-shadow: 0 0 10px #ffffff, 0 0 20px #fde68a;
      transform: scale(1.05);
    }
    100% {
      text-shadow: 0 0 4px #ffffff;
      transform: scale(1);
    }
  }

  .animate-price-glow {
    animation: price-glow 1.6s infinite ease-in-out;
  }

  @keyframes slow-shine {
    0% {
      text-shadow: 0 0 4px rgba(255, 255, 255, 0.4);
      background-position: 200% center;
    }

    40% {
      text-shadow:
        0 0 12px rgba(255, 255, 255, 0.9),
        0 0 22px rgba(251, 146, 60, 0.8),
        0 0 32px rgba(251, 146, 60, 0.6);
      background-position: -200% center;
    }

    70% {
      text-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
      background-position: 200% center;
    }

    100% {
      text-shadow: 0 0 4px rgba(255, 255, 255, 0.4);
      background-position: -200% center;
    }
  }

  @keyframes bg-glow {
    0%, 100% {
      background-color: #7d4b0e;
      box-shadow: inset 0 0 20px rgba(251, 146, 60, 0.2);
    }
    50% {
      background-color: #8a5410;
      box-shadow: inset 0 0 40px rgba(251, 146, 60, 0.45),
                  0 0 30px rgba(251, 146, 60, 0.35);
    }
  }

  .animate-slow-shine {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.25) 45%,
      rgba(255, 255, 255, 0.9) 50%,
      rgba(255, 255, 255, 0.25) 55%,
      transparent 100%
    );
    background-size: 200% auto;
    background-clip: text;
    -webkit-background-clip: text;
    color: #ffffff;
    animation: slow-shine 4s ease-in-out infinite;
  }

  .animate-bg-glow {
    animation: bg-glow 4s ease-in-out infinite;
  }
`}</style> */}


          <header ref={headerRef} className="max-w-[1400px] mx-auto md:px-2 px-1 relative">
            {/* Main Rounded Navbar */}
            <div className="relative bg-amber-50/90 backdrop-blur-md rounded-full shadow-xl border border-amber-200">

              {/* FAILSAFE - Click outside to close search */}
              {isSearchOpen && (
                <div
                  className="fixed inset-0 z-[-1]"
                  onClick={() => setIsSearchOpen(false)}
                />
              )}

              {/* LARGE DESKTOP (lg+) - Original Overlapping Layout */}
              <div className="hidden lg:block">
                <div className="px-1 py-3 xl:px-4 xl:py-5">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 xl:gap-6">

                    {/* LEFT NAV - ALWAYS VISIBLE */}
                    <nav className="flex justify-start items-center space-x-1 xl:space-x-2">
                      {leftNavLinks.map((link) => (
                        <button
                          key={link.label}
                          onClick={() => handleNavClick(link.label, link.href)}
                          className={`mr-0 px-3 xl:px-5 py-2 xl:py-2.5 rounded-full text-xs xl:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${activeLink === link.label
                            ? "bg-white text-[#7d4b0e] shadow-md"
                            : "text-gray-700 hover:text-[#7d4b0e] hover:bg-white/50"
                            }`}
                        >
                          {link.label}
                        </button>
                      ))}
                    </nav>

                    <div className="w-60 xl:w-80 transition-all duration-300"></div>

                    <div className="flex justify-end items-center space-x-1 xl:space-x-2">
                      {/* RIGHT NAV - HIDDEN WHEN SEARCH IS OPEN */}
                      {!isSearchOpen && rightNavLinks.map((link) => (
                        <button
                          key={link.label}
                          onClick={() => handleNavClick(link.label, link.href)}
                          className={`mr-0 px-3 xl:px-5 py-2 xl:py-2.5 rounded-full text-xs xl:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${activeLink === link.label
                            ? "bg-white text-[#7d4b0e] shadow-md"
                            : "text-gray-700 hover:text-[#7d4b0e] hover:bg-white/50"
                            }`}
                        >
                          {link.label}
                        </button>
                      ))}

                      {/* SEARCH BAR - VISIBLE WHEN OPEN */}
                      {isSearchOpen && (
                        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl mx-2 xl:mx-4 animate-in fade-in slide-in-from-right-10 duration-200 relative">
                          <div className="relative">
                            <input
                              ref={desktopSearchInputRef}
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onFocus={() => {
                                if (searchQuery.trim().length > 1) setShowSuggestions(true);
                              }}
                              placeholder="Search..."
                              className="w-[300px] xl:w-[400px] pl-4 xl:pl-5 pr-10 xl:pr-12 py-2 xl:py-2.5 rounded-full border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none bg-white/80 transition-all text-[#7d4b0e] placeholder-amber-900/40 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setIsSearchOpen(false);
                                setSearchQuery("");
                                setShowSuggestions(false);
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-amber-100 rounded-full text-amber-800 transition-colors"
                            >
                              <X size={16} className="xl:w-[18px] xl:h-[18px]" />
                            </button>
                          </div>

                          {/* SUGGESTIONS DROPDOWN - DESKTOP */}
                          {showSuggestions && (
                            <div
                              ref={desktopSuggestionsRef}
                              onMouseDown={(e) => e.stopPropagation()}
                              className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-amber-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200"
                            >
                              {isSearching ? (
                                <div className="p-4 text-center text-gray-500 flex items-center justify-center gap-2">
                                  <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                                  <span>Searching...</span>
                                </div>
                              ) : (suggestions.collections?.length > 0 || suggestions.products?.length > 0) ? (
                                <div
                                  className="max-h-[60vh] overflow-y-auto no-scrollbar scroll-lock-target overscroll-contain"
                                >

                                  {/* COLLECTIONS SECTION */}
                                  {suggestions.collections?.length > 0 && (
                                    <>
                                      <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">Collections</div>
                                      {suggestions.collections.map((col) => (
                                        <Link
                                          key={col.id}
                                          href={`/shopbycollection/${col.handle}`}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            router.push(`/shopbycollection/${col.handle}`);
                                          }}
                                          className="flex items-center gap-3 p-3 hover:bg-amber-50 transition-colors border-b border-gray-50 bg-white"
                                        >
                                          {col.image && (
                                            <img
                                              src={col.image.url}
                                              alt={col.image.altText || col.title}
                                              className="w-10 h-10 object-cover rounded-md border border-gray-100"
                                            />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-[#7d4b0e] truncate">{col.title}</h4>
                                          </div>
                                        </Link>
                                      ))}
                                    </>
                                  )}

                                  {/* PRODUCTS SECTION */}
                                  {suggestions.products?.length > 0 && (
                                    <>
                                      <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">Products</div>
                                      {suggestions.products.map((product) => (
                                        <Link
                                          key={product.id}
                                          href={`/product/${product.handle}`}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            router.push(`/product/${product.handle}`);
                                          }}
                                          className="flex items-center gap-3 p-3 hover:bg-amber-50 transition-colors border-b border-gray-50 last:border-0 bg-white"
                                        >
                                          {product.image && (
                                            <img
                                              src={product.image.url}
                                              alt={product.image.altText || product.title}
                                              className="w-10 h-10 object-cover rounded-md border border-gray-100"
                                            />
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium text-[#7d4b0e] truncate">{product.title}</h4>
                                            <p className="text-xs text-gray-500 font-semibold">
                                              {formatPrice(product.price.amount, product.price.currencyCode)}
                                              {product.compareAtPrice && (
                                                <span className="ml-2 text-gray-400 line-through text-[10px]">
                                                  {formatPrice(product.compareAtPrice.amount, product.compareAtPrice.currencyCode)}
                                                </span>
                                              )}
                                            </p>
                                          </div>
                                        </Link>
                                      ))}
                                    </>
                                  )}
                                </div>
                              ) : (
                                <div className="p-8 text-center">
                                  <p className="text-gray-500">No results found for "{searchQuery}"</p>
                                  <p className="text-xs text-gray-400 mt-1">Try checking your spelling or use different keywords.</p>
                                </div>
                              )}
                            </div>
                          )}
                        </form>
                      )}

                      {/* SEARCH ICON TOGGLE */}
                      {!isSearchOpen && (
                        <button
                          onClick={() => setIsSearchOpen(true)}
                          className="p-2 xl:p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer text-[#7d4b0e]"
                        >
                          <Search size={18} className="lg:w-[18px] lg:h-[18px] xl:w-[22px] xl:h-[22px]" />
                        </button>
                      )}

                      {/* CART & USER - HIDDEN WHEN SEARCH IS OPEN */}
                      {!isSearchOpen && (
                        <>


                          <button
                            onClick={handleCartClick}
                            aria-label="Open Cart"
                            className="relative p-2 xl:p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
                          >
                            <ShoppingCart size={18} className="text-[#7d4b0e] xl:w-[22px] xl:h-[22px]" />
                            {itemCount > 0 && (
                              <span className="absolute -top-1 -right-1 xl:-top-2 xl:-right-2 bg-red-600 text-white text-[10px] xl:text-xs font-bold w-5 h-5 xl:w-6 xl:h-6 rounded-full flex items-center justify-center cursor-pointer">
                                {itemCount}
                              </span>
                            )}
                          </button>

                          <button
                            onClick={handleWishlistClick}
                            className="relative p-2 xl:p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
                          >
                            <Heart size={18} className="text-[#7d4b0e] xl:w-[22px] xl:h-[22px]" />
                            {wishlist?.length > 0 && (
                              <span className="absolute -top-1 -right-1 xl:-top-2 xl:-right-2 bg-red-600 text-white text-[10px] xl:text-xs font-bold w-5 h-5 xl:w-6 xl:h-6 rounded-full flex items-center justify-center cursor-pointer">
                                {wishlist?.length || 0}
                              </span>
                            )}
                          </button>

                          {isLoggedIn ? (
                            <div className="relative">
                              <button
                                onClick={toggleUserMenu}
                                className="w-9 h-9 xl:w-12 xl:h-12 bg-gradient-to-br from-[#7d4b0e] to-[#a0682a] text-white rounded-full flex items-center justify-center font-bold text-sm xl:text-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
                              >
                                {customerInitial}
                              </button>
                              {isUserMenuOpen && (
                                <div className="absolute right-0 mt-4 w-64 bg-white rounded-2xl shadow-2xl border border-amber-100 z-50">
                                  <div className="p-4 border-b border-amber-100">
                                    <p className="text-sm text-gray-600">Welcome back!</p>
                                    <p className="font-bold text-[#7d4b0e] text-lg truncate">
                                      {customerName || customerInitial}
                                    </p>
                                  </div>
                                  <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-amber-50 transition">
                                    <UserCircle size={20} className="text-[#7d4b0e] cursor-pointer" />
                                    <span className="font-medium">My Profile</span>
                                  </Link>
                                  <Link href="/order-history" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-amber-50 transition">
                                    <Package size={20} className="text-[#7d4b0e] cursor-pointer" />
                                    <span className="font-medium">Order History</span>
                                  </Link>
                                  <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-4 w-full text-left text-red-600 hover:bg-red-50 transition border-t border-amber-100 cursor-pointer">
                                    <LogOut size={20} />
                                    <span className="font-medium">Logout</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button type="button" onClick={handleOpenAccount} className="px-2 py-3 bg-[#7d4b0e] text-white rounded-full font-semibold hover:bg-[#6b400c] shadow-lg transition cursor-pointer">
                              Login
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Overlapping Logo - Only on Large Screens */}
                <Link
                  href="/"
                  onClick={() => handleNavClick("Home", "/")}
                  className="absolute left-1/2 transform -translate-x-1/2 bottom-0 translate-y-1/2 z-50 hover:scale-105 transition"
                >
                  <img
                    src="https://cdn.shopify.com/s/files/1/0953/6284/2993/files/Megascale_Logo.png?v=1770090966"
                    alt="Megascale Logo"
                    className="h-20 md:h-24 lg:h-28 xl:h-32 w-auto object-contain drop-shadow-2xl"
                  />
                </Link>
              </div>


              {/* TABLET & MOBILE (below lg) - Compact Layout */}
              <div className="lg:hidden">
                <div className="relative flex items-center justify-between px-3 sm:px-4 py-2 sm:py-4 gap-2">

                  {/* Search Overlay for Mobile */}
                  {isSearchOpen ? (
                    <form onSubmit={handleSearchSubmit} className="w-full flex items-center gap-2 animate-in fade-in slide-in-from-right-5 duration-200 relative">
                      <div className="relative flex-1">
                        <input
                          ref={mobileSearchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => {
                            if (searchQuery.trim().length > 1) setShowSuggestions(true);
                          }}
                          placeholder="Search..."
                          className="w-full pl-4 pr-10 py-2 rounded-full border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none bg-gray-50 text-[#7d4b0e] placeholder-amber-900/40 text-sm"
                        />
                        {/* Close Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                            setShowSuggestions(false);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-red-500 rounded-full transition"
                        >
                          <X size={16} />
                        </button>

                        {/* SUGGESTIONS DROPDOWN - MOBILE */}
                        {showSuggestions && (
                          <div
                            ref={mobileSuggestionsRef}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="absolute top-full left-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-amber-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200"
                          >
                            {isSearching ? (
                              <div className="p-4 text-center text-gray-500 flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                                <span>Searching...</span>
                              </div>
                            ) : (suggestions.collections?.length > 0 || suggestions.products?.length > 0) ? (
                              <div className="max-h-[50vh] overflow-y-auto">

                                {/* COLLECTIONS SECTION */}
                                {suggestions.collections?.length > 0 && (
                                  <>
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">Collections</div>
                                    {suggestions.collections.map((col) => (
                                      <Link
                                        key={col.id}
                                        href={`/shopbycollection/${col.handle}`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          router.push(`/shopbycollection/${col.handle}`);
                                        }}
                                        className="flex items-center gap-3 p-3 hover:bg-amber-50 transition-colors border-b border-gray-50 bg-white"
                                      >
                                        {col.image && (
                                          <img
                                            src={col.image.url}
                                            alt={col.image.altText || col.title}
                                            className="w-10 h-10 object-cover rounded-md border border-gray-100"
                                          />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <h4 className="text-sm font-medium text-[#7d4b0e] truncate">{col.title}</h4>
                                        </div>
                                      </Link>
                                    ))}
                                  </>
                                )}

                                {/* PRODUCTS SECTION */}
                                {suggestions.products?.length > 0 && (
                                  <>
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">Products</div>
                                    {suggestions.products.map((product) => (
                                      <Link
                                        key={product.id}
                                        href={`/product/${product.handle}`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          router.push(`/product/${product.handle}`);
                                        }}
                                        className="flex items-center gap-3 p-3 hover:bg-amber-50 transition-colors border-b border-gray-50 last:border-0 bg-white"
                                      >
                                        {product.image && (
                                          <img
                                            src={product.image.url}
                                            alt={product.image.altText || product.title}
                                            className="w-10 h-10 object-cover rounded-md border border-gray-100"
                                          />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <h4 className="text-sm font-medium text-[#7d4b0e] truncate">{product.title}</h4>
                                          <p className="text-xs text-gray-500 font-semibold">
                                            {formatPrice(product.price.amount, product.price.currencyCode)}
                                          </p>
                                        </div>
                                      </Link>
                                    ))}
                                  </>
                                )}


                              </div>
                            ) : (
                              <div className="p-6 text-center">
                                <p className="text-sm text-gray-500">No results found.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </form>
                  ) : (
                    <>
                      {/* LEFT: Menu Button */}
                      <div className="flex-shrink-0">
                        <button
                          onClick={toggleMobileMenu}
                          aria-label="Toggle Menu"
                          className="p-2 sm:p-2.5 rounded-full hover:bg-white/60 transition cursor-pointer"
                        >
                          {isMobileMenuOpen ? (
                            <X size={26} className="text-[#7d4b0e]" />
                          ) : (
                            <Menu size={26} className="text-[#7d4b0e]" />
                          )}
                        </button>
                      </div>

                      {/* CENTER: LOGO */}
                      <div className="flex-1 flex justify-center min-w-0 mx-2">
                        <Link
                          href="/"
                          className="flex items-center"
                        >
                          <img
                            src="https://cdn.shopify.com/s/files/1/0953/6284/2993/files/Megascale_Logo.png?v=1770090966"
                            alt="Megascale Logo"
                            className="h-8 xs:h-9 sm:h-12 w-auto object-contain drop-shadow-md"
                          />
                        </Link>
                      </div>

                      {/* RIGHT: Search + Cart + User */}
                      <div className="flex-shrink-0 flex items-center gap-1.5 sm:gap-3">

                        {/* Mobile Search Toggle */}
                        <button
                          onClick={() => setIsSearchOpen(true)}
                          className="p-1 sm:p-2.5 bg-white rounded-full shadow-md hover:shadow-lg transition cursor-pointer text-[#7d4b0e]"
                        >
                          <Search className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
                        </button>



                        {/* Cart */}
                        <button
                          onClick={handleCartClick}
                          aria-label="Open Cart"
                          className="relative p-1 sm:p-2.5 bg-white rounded-full shadow-md hover:shadow-lg transition cursor-pointer"
                        >
                          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-[#7d4b0e]" />
                          {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center cursor-pointer">
                              {itemCount}
                            </span>
                          )}
                        </button>

                        {/* Wishlist */}
                        <button
                          onClick={handleWishlistClick}
                          aria-label="Open Wishlist"
                          className="relative p-1 sm:p-2.5 bg-white rounded-full shadow-md hover:shadow-lg transition cursor-pointer"
                        >
                          <Heart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-[#7d4b0e]" />
                          {wishlist?.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] sm:text-xs font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center cursor-pointer">
                              {wishlist?.length || 0}
                            </span>
                          )}
                        </button>

                        {/* User / Login */}
                        {isLoggedIn ? (
                          <div className="relative">
                            <button
                              onClick={toggleUserMenu}
                              aria-label="User Menu"
                              className="w-6 h-6 sm:w-9 sm:h-9 bg-gradient-to-br from-[#7d4b0e] to-[#a0682a] text-white rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition cursor-pointer"
                            >
                              {customerInitial}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleOpenAccount}
                            className="px-3 sm:px-6 py-1.5 sm:py-2 bg-[#7d4b0e] text-white rounded-full text-xs sm:text-sm font-medium whitespace-nowrap cursor-pointer"
                          >
                            Login
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>


            {isLoggedIn && isUserMenuOpen && (
              <div className="lg:hidden fixed top-20 right-4  w-72  sm:w-172 max-w-sm bg-white rounded-2xl shadow-2xl border border-amber-100 z-[9999]">

                <div className="p-4 border-b border-amber-100">
                  <p className="text-sm text-gray-600">Welcome back!</p>
                  <p className="font-bold text-[#7d4b0e] text-lg truncate">
                    {customerName || customerInitial}
                  </p>
                </div>
                <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-amber-50 transition cursor-pointer">
                  <UserCircle size={20} className="text-[#7d4b0e]" />
                  <span className="font-medium">My Profile</span>
                </Link>
                <Link href="/order-history" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-4 px-6 py-4 hover:bg-amber-50 transition cursor-pointer">
                  <Package size={20} className="text-[#7d4b0e]" />
                  <span className="font-medium">Order History</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-4 px-6 py-4 w-full text-left text-red-600 hover:bg-red-50 transition border-t border-amber-100 cursor-pointer">
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <div className="lg:hidden mt-4 bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden">
                <nav className="py-3">
                  {navLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => handleNavClick(link.label, link.href)}
                      className={`block w-full text-left px-8 py-4 text-base font-medium transition-all cursor-pointer ${activeLink === link.label
                        ? "bg-[#7d4b0e] text-white"
                        : "text-gray-700 hover:bg-amber-50"
                        }`}
                    >
                      {link.label}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </header>
        </div>
      </div>
    </>
  );
}
