import { SITE_NAME } from "@/lib/constants";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>
      <h1 className="text-3xl font-bold">Terms & Conditions</h1>
      <p className="mt-2 text-muted-foreground">Last updated: March 2026</p>

      <div className="mt-8 space-y-6 text-sm text-muted-foreground leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Service Overview</h2>
          <p>{SITE_NAME} is an AUSTRAC-registered Digital Currency Exchange that enables the purchase of Bitcoin (BTC) and Ethereum (ETH) using Australian Dollars (AUD) via bank transfer.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">2. Eligibility</h2>
          <p>You must be at least 18 years old and an Australian resident. You must complete identity verification (KYC) before making any purchases.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Exchange Rates</h2>
          <p>Rates shown on the platform are indicative only and are not binding. The final exchange rate is determined at the time of settlement after your AUD payment is confirmed. A markup percentage is applied on top of the market rate.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Payments</h2>
          <p>Payments are made via AUD bank transfer only. You are responsible for ensuring the correct amount is transferred to the provided BSB/account details. Minimum transaction amounts apply.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Risk Disclosure</h2>
          <p>Cryptocurrency is volatile. The value of BTC and ETH can go up or down significantly. This service is not financial advice. You should consider your financial situation before purchasing cryptocurrency.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Wallet Responsibility</h2>
          <p>You are solely responsible for providing a correct wallet address. Once crypto is sent to the address you provided, transactions cannot be reversed.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-foreground">7. AML/CTF Compliance</h2>
          <p>{SITE_NAME} complies with Australian AML/CTF laws. We may request additional documentation or refuse service at our discretion for compliance reasons.</p>
        </section>
      </div>
    </div>
  );
}
