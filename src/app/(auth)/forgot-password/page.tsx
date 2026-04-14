"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
      toast.success("If an account exists, a reset link has been sent.");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription>
          {sent ? "Check your email for a reset link" : "Enter your email to receive a reset link"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              If an account with that email exists, we&apos;ve sent instructions to reset your password.
            </p>
            <Link href="/login">
              <Button variant="outline" className="mt-6 gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Send Reset Link
            </Button>
            <Link href="/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">
              Back to login
            </Link>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
