import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

async function main() {
  const adapter = new PrismaPg({
    connectionString: "postgresql://user:password@localhost:5432/exchange_platform",
  });
  const prisma = new PrismaClient({ adapter });

  const passwordHash = await bcrypt.hash("test1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "customer@test.com" },
    update: {},
    create: {
      email: "customer@test.com",
      passwordHash,
      firstName: "John",
      lastName: "Smith",
      phone: "+61412345678",
      dateOfBirth: new Date("1995-06-15"),
      addressStreet: "42 George St",
      addressCity: "Sydney",
      addressState: "NSW",
      addressPostcode: "2000",
      countryOfResidence: "Australia",
      role: "CUSTOMER",
      kycStatus: "NOT_STARTED",
      emailVerifiedAt: new Date(),
    },
  });

  console.log("Customer created:", user.email, user.id);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
