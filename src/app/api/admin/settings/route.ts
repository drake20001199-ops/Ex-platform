// ============================================================
// FIX #6: src/app/api/admin/settings/route.ts — Add Validation
// ============================================================
// PROBLEM: Admin can set markup to -50%, min > max, or any garbage value.
//          No validation at all on the settings values.
// FIX:     Validate each setting with proper type/range checks.
// FILE:    src/app/api/admin/settings/route.ts (replace entire file)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllSettings, updateSetting } from "@/lib/settings";
import { createAuditLog } from "@/lib/audit";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { z } from "zod";

// ── Validation schema for admin settings ─────────────────────
const settingsSchema = z
  .object({
    global_markup_percent: z
      .string()
      .refine((v) => !isNaN(Number(v)), "Must be a number")
      .refine((v) => Number(v) >= 0, "Markup cannot be negative")
      .refine((v) => Number(v) <= 50, "Markup cannot exceed 50%")
      .optional(),
    btc_markup_override: z
      .string()
      .refine((v) => v === "" || !isNaN(Number(v)), "Must be a number or empty")
      .refine((v) => v === "" || Number(v) >= 0, "Markup cannot be negative")
      .refine((v) => v === "" || Number(v) <= 50, "Markup cannot exceed 50%")
      .optional(),
    eth_markup_override: z
      .string()
      .refine((v) => v === "" || !isNaN(Number(v)), "Must be a number or empty")
      .refine((v) => v === "" || Number(v) >= 0, "Markup cannot be negative")
      .refine((v) => v === "" || Number(v) <= 50, "Markup cannot exceed 50%")
      .optional(),
    min_transaction_aud: z
      .string()
      .refine((v) => !isNaN(Number(v)), "Must be a number")
      .refine((v) => Number(v) >= 1, "Minimum must be at least $1")
      .refine((v) => Number(v) <= 1000000, "Minimum too high")
      .optional(),
    max_transaction_aud: z
      .string()
      .refine((v) => !isNaN(Number(v)), "Must be a number")
      .refine((v) => Number(v) >= 1, "Maximum must be at least $1")
      .refine((v) => Number(v) <= 10000000, "Maximum too high")
      .optional(),
    ttr_threshold_aud: z
      .string()
      .refine((v) => !isNaN(Number(v)), "Must be a number")
      .refine((v) => Number(v) >= 0, "Threshold cannot be negative")
      .optional(),
    btc_enabled: z
      .string()
      .refine((v) => v === "true" || v === "false", "Must be true or false")
      .optional(),
    eth_enabled: z
      .string()
      .refine((v) => v === "true" || v === "false", "Must be true or false")
      .optional(),
    maintenance_mode: z
      .string()
      .refine((v) => v === "true" || v === "false", "Must be true or false")
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Cross-field validation: min must be <= max
    const min = data.min_transaction_aud ? Number(data.min_transaction_aud) : null;
    const max = data.max_transaction_aud ? Number(data.max_transaction_aud) : null;
    if (min !== null && max !== null && min > max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum transaction amount cannot be greater than maximum",
        path: ["min_transaction_aud"],
      });
    }
  });

export async function GET() {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const settings = await getAllSettings();
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // VALIDATE all settings
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const validKeys = Object.keys(DEFAULT_SETTINGS);
  const old = await getAllSettings();

  for (const key of validKeys) {
    const newValue = (parsed.data as Record<string, string | undefined>)[key];
    if (newValue !== undefined && newValue !== old[key]) {
      await updateSetting(
        key as keyof typeof DEFAULT_SETTINGS,
        newValue,
        admin.id
      );
      await createAuditLog({
        actorId: admin.id,
        action: "setting_changed",
        entityType: "setting",
        entityId: key,
        oldValue: { value: old[key] },
        newValue: { value: newValue },
      });
    }
  }

  return NextResponse.json({ success: true });
}
