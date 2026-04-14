import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllSettings, updateSetting } from "@/lib/settings";
import { createAuditLog } from "@/lib/audit";
import { DEFAULT_SETTINGS } from "@/lib/constants";

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

  const body = await req.json();
  const validKeys = Object.keys(DEFAULT_SETTINGS);
  const old = await getAllSettings();

  for (const key of validKeys) {
    if (body[key] !== undefined && body[key] !== old[key]) {
      await updateSetting(
        key as keyof typeof DEFAULT_SETTINGS,
        body[key],
        admin.id
      );
      await createAuditLog({
        actorId: admin.id,
        action: "setting_changed",
        entityType: "setting",
        entityId: key,
        oldValue: { value: old[key] },
        newValue: { value: body[key] },
      });
    }
  }

  return NextResponse.json({ success: true });
}
