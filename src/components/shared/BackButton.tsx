"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Props {
  /** Fallback href if there's no browser history (e.g. user opened link directly) */
  fallback?: string;
  label?: string;
}

export function BackButton({ fallback = "/", label = "Back" }: Props) {
  const router = useRouter();

  function handleBack() {
    // If there's history to go back to, use it
    if (window.history.length > 1) {
      router.back();
    } else {
      // No history (opened tab directly) — go to fallback
      router.push(fallback);
    }
  }

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
