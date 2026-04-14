"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  if (!token) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Invalid or missing reset token.</p>
          <Link href="/forgot-password">
            <Button variant="outline" className="mt-4">Request New Link</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to reset password");
        return;
      }
      setDone(true);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur">
        <CardContent className="py-8 text-center space-y-4">
          <CheckCircle className="mx-auto h-8 w-8 text-green-500" />
          <p className="font-medium">Password reset successfully!</p>
          <Link href="/login">
            <Button className="bg-blue-600 hover:bg-blue-700">Go to Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Set New Password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" type="password" required minLength={8}
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input id="confirm" type="password" required minLength={8}
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password" />
          </div>
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Reset Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
