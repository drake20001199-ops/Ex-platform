"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PersonalFields, AddressFields } from "@/components/auth/RegisterFormFields";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const INITIAL = {
  firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "",
  password: "", addressStreet: "", addressCity: "", addressState: "",
  addressPostcode: "", countryOfResidence: "Australia",
};

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(INITIAL);
  const [step, setStep] = useState<1 | 2>(1);

  function onChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Registration failed"); return; }
      toast.success("Account created! Check your email to verify.");
      router.push("/login");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Step {step} of 2 — {step === 1 ? "Personal Details" : "Address"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {step === 1 ? (
            <PersonalFields form={form} onChange={onChange} />
          ) : (
            <AddressFields form={form} onChange={onChange} />
          )}
          <div className="flex gap-3">
            {step === 2 && (
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
            )}
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {step === 1 ? "Next" : "Create Account"}
            </Button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link>
        </p>
      </CardContent>
    </Card>
  );
}
