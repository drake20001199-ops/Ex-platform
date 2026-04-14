"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [message, setMessage] = useState(token ? "Verifying your email..." : "No verification token provided.");

  useEffect(() => {
    if (!token) return;

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage("Your email has been verified! You can now log in.");
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Email Verification</CardTitle>
        <CardDescription>
          {status === "loading" ? "Please wait..." : status === "success" ? "Verified!" : "Verification Failed"}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {status === "loading" && <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500" />}
        {status === "success" && <CheckCircle className="mx-auto h-8 w-8 text-green-500" />}
        {status === "error" && <XCircle className="mx-auto h-8 w-8 text-red-500" />}
        <p className="text-sm text-muted-foreground">{message}</p>
        <Link href="/login">
          <Button variant="outline" className="mt-4">Go to Login</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
