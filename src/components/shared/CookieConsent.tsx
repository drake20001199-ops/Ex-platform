"use client";

import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function getConsentSnapshot(): string | null {
  if (typeof window === "undefined") return "accepted"; // SSR: hide banner
  return localStorage.getItem("cookie-consent");
}

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export function CookieConsent() {
  const consent = useSyncExternalStore(subscribe, getConsentSnapshot, () => "accepted");

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    window.dispatchEvent(new Event("storage"));
  }

  function decline() {
    localStorage.setItem("cookie-consent", "declined");
    window.dispatchEvent(new Event("storage"));
  }

  if (consent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/95 backdrop-blur p-4">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use essential cookies to keep you logged in and ensure the platform works correctly.
          See our <Link href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</Link> for details.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={decline}>Decline</Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={accept}>Accept</Button>
        </div>
      </div>
    </div>
  );
}
