"use client";

import { useEffect, useState } from "react";
import {
  CHECKOUT_PUBLIC_KEY,
  CHECKOUT_UI_URL,
  CHECKOUT_API_BASE,
} from "@/lib/checkout";

function buildProfileIframeUrl() {
  const params = new URLSearchParams({
    publicKey: CHECKOUT_PUBLIC_KEY,
    mode: "iframe",
    baseUrl: CHECKOUT_API_BASE,
    storeOrigin: window.location.hostname,
    layout: "profile",
  });

  const token = localStorage.getItem("mc_platform_token") || "";
  if (token) {
    params.set("platformToken", token);
  }

  return `${CHECKOUT_UI_URL}/profile?${params.toString()}`;
}

export default function MegaCheckoutProfile() {
  const [iframeSrc, setIframeSrc] = useState("");

  useEffect(() => {
    setIframeSrc(buildProfileIframeUrl());

    const onMessage = (event) => {
      const { type, payload } = event.data || {};
      if (type !== "customer_authenticated" && type !== "profile_auth_verified") {
        return;
      }

      if (payload?.platformToken) {
        localStorage.setItem("mc_platform_token", payload.platformToken);
        localStorage.setItem("mc_auth_verified", "true");
      }
      if (payload?.userId) {
        localStorage.setItem("mc_auth_user_id", payload.userId);
      }
      if (payload?.phone) {
        localStorage.setItem("mc_auth_phone", payload.phone);
      }
      if (payload?.email) {
        localStorage.setItem("mc_auth_email", payload.email);
      }

      window.dispatchEvent(new Event("customer-updated"));
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!iframeSrc) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <iframe
        title="Mega Checkout Profile"
        src={iframeSrc}
        className="w-full min-h-[80vh] border-0 bg-white"
        allow="clipboard-write"
      />
    </div>
  );
}
