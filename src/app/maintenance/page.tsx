import { Shield } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-background to-background" />
      <div className="relative z-10 text-center space-y-6 max-w-md">
        <Shield className="mx-auto h-16 w-16 text-blue-500" />
        <h1 className="text-3xl font-bold">{SITE_NAME}</h1>
        <h2 className="text-xl text-muted-foreground">Under Maintenance</h2>
        <p className="text-muted-foreground">
          We&apos;re performing scheduled maintenance to improve our services.
          Please check back shortly.
        </p>
        <p className="text-sm text-muted-foreground">
          If you have any urgent questions, please contact us at support@coinvault.com.au
        </p>
      </div>
    </div>
  );
}
