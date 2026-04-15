import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const DEFAULT_SETTINGS = [
  { key: "global_markup_percent", value: "3.0" },
  { key: "btc_markup_override",   value: "" },
  { key: "eth_markup_override",   value: "" },
  { key: "min_transaction_aud",   value: "2000" },
  { key: "max_transaction_aud",   value: "50000" },
  { key: "btc_trading_enabled",   value: "true" },
  { key: "eth_trading_enabled",   value: "true" },
  { key: "maintenance_mode",      value: "false" },
  { key: "ttr_threshold_aud",     value: "10000" },
  { key: "order_timeout_hours",   value: "72" },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const setting of DEFAULT_SETTINGS) {
    await db.adminSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: { key: setting.key, value: setting.value },
    });
  }
  console.log("✅ Admin settings seeded");

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@yourplatform.com.au";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123!ChangeMe";
  const existing = await db.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await db.user.create({
      data: {
        email: adminEmail,
        emailVerifiedAt: new Date(),
        passwordHash,
        firstName: "Admin",
        lastName: "User",
        phone: "0400000000",
        dateOfBirth: new Date("1990-01-01"),
        addressStreet: "1 Admin Street",
        addressCity: "Sydney",
        addressState: "NSW",
        addressPostcode: "2000",
        countryOfResidence: "Australia",
        kycStatus: "approved",
        role: "admin",
      },
    });
    console.log("✅ Admin user created: " + adminEmail);
  } else {
    console.log("ℹ️  Admin already exists: " + adminEmail);
  }

  console.log("🎉 Seed complete");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());