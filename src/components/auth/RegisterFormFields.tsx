"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  form: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export function PersonalFields({ form, onChange }: Props) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" required value={form.firstName}
            onChange={(e) => onChange("firstName", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" required value={form.lastName}
            onChange={(e) => onChange("lastName", e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" required placeholder="you@example.com"
          value={form.email} onChange={(e) => onChange("email", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone *</Label>
        <Input id="phone" required placeholder="+61..."
          value={form.phone} onChange={(e) => onChange("phone", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <Input id="dateOfBirth" type="date" required
          value={form.dateOfBirth} onChange={(e) => onChange("dateOfBirth", e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <Input id="password" type="password" required placeholder="Min 8 chars, 1 uppercase, 1 number"
          value={form.password} onChange={(e) => onChange("password", e.target.value)} />
      </div>
    </>
  );
}

export function AddressFields({ form, onChange }: Props) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="addressStreet">Street Address *</Label>
        <Input id="addressStreet" required
          value={form.addressStreet} onChange={(e) => onChange("addressStreet", e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="addressCity">City *</Label>
          <Input id="addressCity" required
            value={form.addressCity} onChange={(e) => onChange("addressCity", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addressState">State *</Label>
          <Input id="addressState" required placeholder="NSW, VIC..."
            value={form.addressState} onChange={(e) => onChange("addressState", e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="addressPostcode">Postcode *</Label>
          <Input id="addressPostcode" required
            value={form.addressPostcode} onChange={(e) => onChange("addressPostcode", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="countryOfResidence">Country *</Label>
          <Input id="countryOfResidence" required value={form.countryOfResidence}
            onChange={(e) => onChange("countryOfResidence", e.target.value)} />
        </div>
      </div>
    </>
  );
}
