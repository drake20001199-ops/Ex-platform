import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

async function main() {
  const adapter = new PrismaPg({
    connectionString: "postgresql://user:password@localhost:5432/exchange_platform",
  });
  const prisma = new PrismaClient({ adapter });

  const passwordHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@coinvault.com" },
    update: {},
    create: {
      email: "admin@coinvault.com",
      passwordHash,
      firstName: "Admin",
      lastName: "User",
      phone: "+61400000000",
      dateOfBirth: new Date("1990-01-01"),
      addressStreet: "1 Admin St",
      addressCity: "Sydney",
      addressState: "NSW",
      addressPostcode: "2000",
      countryOfResidence: "AU",
      role: "ADMIN",
      kycStatus: "APPROVED",
      emailVerifiedAt: new Date(),
    },
  });

  console.log("Admin user created:", admin.email);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
