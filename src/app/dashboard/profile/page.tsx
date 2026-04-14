"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    addressStreet: "", addressCity: "", addressState: "", addressPostcode: "",
  });

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setForm({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          addressStreet: data.addressStreet ?? "",
          addressCity: data.addressCity ?? "",
          addressState: data.addressState ?? "",
          addressPostcode: data.addressPostcode ?? "",
        });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setFetching(false));
  }, []);

  function onChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { toast.error("Failed to update profile"); return; }
      toast.success("Profile updated");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>

      <Card className="border-white/10 bg-white/5">
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={form.firstName} onChange={(e) => onChange("firstName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={form.lastName} onChange={(e) => onChange("lastName", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} disabled className="opacity-50" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => onChange("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Street Address</Label>
              <Input value={form.addressStreet} onChange={(e) => onChange("addressStreet", e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={form.addressCity} onChange={(e) => onChange("addressCity", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={form.addressState} onChange={(e) => onChange("addressState", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Postcode</Label>
                <Input value={form.addressPostcode} onChange={(e) => onChange("addressPostcode", e.target.value)} />
              </div>
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
