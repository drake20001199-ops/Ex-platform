import { SITE_NAME } from "@/lib/constants";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-muted-foreground">Last updated: March 2026</p>

      <div className="mt-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
          <p>We collect personal information during registration including your name, email, phone, address, date of birth, and identity documents for KYC verification.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
          <p>Your information is used to verify your identity, process transactions, comply with AUSTRAC regulations, and communicate about your account and orders.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Data Storage & Security</h2>
          <p>All data is encrypted in transit and at rest. KYC documents are stored in secure private storage with signed URLs. Passwords are hashed using bcrypt.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Data Retention</h2>
          <p>As required by AUSTRAC, we retain customer records and transaction data for a minimum of 7 years. You may request access to your personal data at any time.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Third Parties</h2>
          <p>We share data with our KYC verification provider (Sumsub) solely for identity verification purposes. We do not sell your personal information to any third party.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Cookies</h2>
          <p>We use essential cookies for authentication and session management. No tracking or advertising cookies are used.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">7. Your Rights</h2>
          <p>Under the Australian Privacy Act, you have the right to access, correct, and request deletion of your personal information, subject to legal retention requirements.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">8. Contact</h2>
          <p>For privacy inquiries, contact us at privacy@{SITE_NAME.toLowerCase()}.com.au</p>
        </section>
      </div>
    </div>
  );
}
