import Link from "next/link";
import { Shield } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-background to-background" />
      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-blue-500" />
          <span className="text-2xl font-bold">{SITE_NAME}</span>
        </Link>
        {children}
      </div>
    </div>
  );
}
