import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";

async function main() {
  const adapter = new PrismaPg({
    connectionString: "postgresql://user:password@localhost:5432/exchange_platform",
  });
  const prisma = new PrismaClient({ adapter });

  // ── 1. Update customer to KYC APPROVED (so they can trade) ──
  const customer = await prisma.user.update({
    where: { email: "customer@test.com" },
    data: { kycStatus: "APPROVED" },
  });
  console.log(`✅ ${customer.email} — KYC approved`);

  // ── 2. Create a few more fake customers ──
  const passwordHash = await bcrypt.hash("test1234", 12);

  const sarah = await prisma.user.upsert({
    where: { email: "sarah.jones@test.com" },
    update: {},
    create: {
      email: "sarah.jones@test.com",
      passwordHash,
      firstName: "Sarah",
      lastName: "Jones",
      phone: "+61498765432",
      dateOfBirth: new Date("1990-03-22"),
      addressStreet: "15 Collins St",
      addressCity: "Melbourne",
      addressState: "VIC",
      addressPostcode: "3000",
      countryOfResidence: "Australia",
      kycStatus: "APPROVED",
      emailVerifiedAt: new Date(),
    },
  });

  const mike = await prisma.user.upsert({
    where: { email: "mike.chen@test.com" },
    update: {},
    create: {
      email: "mike.chen@test.com",
      passwordHash,
      firstName: "Mike",
      lastName: "Chen",
      phone: "+61487654321",
      dateOfBirth: new Date("1988-11-05"),
      addressStreet: "88 Queen St",
      addressCity: "Brisbane",
      addressState: "QLD",
      addressPostcode: "4000",
      countryOfResidence: "Australia",
      kycStatus: "IN_REVIEW",
      emailVerifiedAt: new Date(),
    },
  });

  const emma = await prisma.user.upsert({
    where: { email: "emma.wilson@test.com" },
    update: {},
    create: {
      email: "emma.wilson@test.com",
      passwordHash,
      firstName: "Emma",
      lastName: "Wilson",
      phone: "+61456789012",
      dateOfBirth: new Date("1992-07-18"),
      addressStreet: "5 King William St",
      addressCity: "Adelaide",
      addressState: "SA",
      addressPostcode: "5000",
      countryOfResidence: "Australia",
      kycStatus: "NOT_STARTED",
      emailVerifiedAt: new Date(),
    },
  });

  console.log(`✅ Created users: ${sarah.email}, ${mike.email}, ${emma.email}`);

  // ── 3. Create transactions for John Smith (customer@test.com) ──
  const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

  // Transaction 1: COMPLETED — BTC purchase 12 days ago
  await prisma.transaction.create({
    data: {
      userId: customer.id,
      cryptoType: "BTC",
      audAmount: 5000,
      cryptoAmount: 0.05123456,
      exchangeRate: 95200.00,
      markupPercentage: 3.0,
      finalCustomerRate: 98056.00,
      walletAddress: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
      status: "COMPLETED",
      blockchainTxHash: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      blockchainTxLink: "https://mempool.space/tx/a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2",
      idempotencyKey: crypto.randomUUID(),
      createdAt: daysAgo(12),
      settledAt: daysAgo(11),
      bsbSentAt: daysAgo(12),
    },
  });

  // Transaction 2: COMPLETED — ETH purchase 8 days ago
  await prisma.transaction.create({
    data: {
      userId: customer.id,
      cryptoType: "ETH",
      audAmount: 3000,
      cryptoAmount: 0.89543210,
      exchangeRate: 3280.50,
      markupPercentage: 3.0,
      finalCustomerRate: 3378.92,
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
      status: "COMPLETED",
      blockchainTxHash: "0xdeadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
      blockchainTxLink: "https://etherscan.io/tx/0xdeadbeef1234567890abcdef1234567890abcdef1234567890abcdef12345678",
      idempotencyKey: crypto.randomUUID(),
      createdAt: daysAgo(8),
      settledAt: daysAgo(7),
      bsbSentAt: daysAgo(8),
    },
  });

  // Transaction 3: COMPLETED — BTC big purchase 5 days ago (TTR flag!)
  await prisma.transaction.create({
    data: {
      userId: customer.id,
      cryptoType: "BTC",
      audAmount: 15000,
      cryptoAmount: 0.15432100,
      exchangeRate: 95100.00,
      markupPercentage: 3.0,
      finalCustomerRate: 97953.00,
      walletAddress: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
      status: "COMPLETED",
      blockchainTxHash: "f9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a43210",
      blockchainTxLink: "https://mempool.space/tx/f9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a4f9e8d7c6b5a43210",
      idempotencyKey: crypto.randomUUID(),
      createdAt: daysAgo(5),
      settledAt: daysAgo(4),
      bsbSentAt: daysAgo(5),
    },
  });

  // Transaction 4: AWAITING_PAYMENT — ETH, 2 days ago
  await prisma.transaction.create({
    data: {
      userId: customer.id,
      cryptoType: "ETH",
      audAmount: 2500,
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
      status: "AWAITING_PAYMENT",
      idempotencyKey: crypto.randomUUID(),
      createdAt: daysAgo(2),
      bsbSentAt: daysAgo(2),
    },
  });

  // Transaction 5: CREATED — BTC, today (new order)
  await prisma.transaction.create({
    data: {
      userId: customer.id,
      cryptoType: "BTC",
      audAmount: 4000,
      walletAddress: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
      status: "CREATED",
      idempotencyKey: crypto.randomUUID(),
      createdAt: daysAgo(0),
    },
  });

  console.log(`✅ Created 5 transactions for ${customer.email}`);

  // ── 4. Create transactions for Sarah Jones ──
  // COMPLETED
  await prisma.transaction.create({
    data: {
      userId: sarah.id,
      cryptoType: "BTC",
      audAmount: 10000,
      cryptoAmount: 0.10234567,
      exchangeRate: 95500.00,
      markupPercentage: 3.0,
      finalCustomerRate: 98365.00,
      walletAddress: "bc1q9h7lfkvy5lnw9re59gtzzwf5mdqar0srrr7xfk",
      status: "COMPLETED",
      blockchainTxHash: "1234abcd5678ef901234abcd5678ef901234abcd5678ef901234abcd5678ef90",
      blockchainTxLink: "https://mempool.space/tx/1234abcd5678ef901234abcd5678ef901234abcd5678ef901234abcd5678ef90",
      idempotencyKey: crypto.randomUUID(),
      createdAt: daysAgo(6),
      settledAt: daysAgo(5),
      bsbSentAt: daysAgo(6),
    },
  });

  // PAYMENT_RECEIVED — ready to process
  await prisma.transaction.create({
    data: {
      userId: sarah.id,
      cryptoType: "ETH",
      audAmount: 7500,
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
      status: "PAYMENT_RECEIVED",
      idempotencyKey: crypto.randomUUID(),
      createdAt: daysAgo(1),
      bsbSentAt: daysAgo(1),
    },
  });

  console.log(`✅ Created 2 transactions for ${sarah.email}`);

  // ── 5. Activity events ──
  const events = [
    { eventType: "user_registered", userId: customer.id, description: "John Smith registered", createdAt: daysAgo(20) },
    { eventType: "kyc_submitted", userId: customer.id, description: "John Smith submitted KYC documents", createdAt: daysAgo(19) },
    { eventType: "kyc_approved", userId: customer.id, description: "John Smith KYC approved", createdAt: daysAgo(18) },
    { eventType: "transaction_created", userId: customer.id, description: "New BTC order for A$5,000", createdAt: daysAgo(12) },
    { eventType: "transaction_status_changed", userId: customer.id, description: "Transaction completed", createdAt: daysAgo(11) },
    { eventType: "user_registered", userId: sarah.id, description: "Sarah Jones registered", createdAt: daysAgo(10) },
    { eventType: "kyc_approved", userId: sarah.id, description: "Sarah Jones KYC approved", createdAt: daysAgo(9) },
    { eventType: "transaction_created", userId: customer.id, description: "New ETH order for A$3,000", createdAt: daysAgo(8) },
    { eventType: "transaction_created", userId: customer.id, description: "New BTC order for A$15,000 (TTR)", createdAt: daysAgo(5) },
    { eventType: "transaction_created", userId: sarah.id, description: "New BTC order for A$10,000", createdAt: daysAgo(6) },
    { eventType: "user_registered", userId: mike.id, description: "Mike Chen registered", createdAt: daysAgo(3) },
    { eventType: "kyc_submitted", userId: mike.id, description: "Mike Chen submitted KYC documents", createdAt: daysAgo(3) },
    { eventType: "transaction_created", userId: customer.id, description: "New ETH order for A$2,500", createdAt: daysAgo(2) },
    { eventType: "user_registered", userId: emma.id, description: "Emma Wilson registered", createdAt: daysAgo(1) },
    { eventType: "transaction_created", userId: sarah.id, description: "New ETH order for A$7,500", createdAt: daysAgo(1) },
    { eventType: "transaction_created", userId: customer.id, description: "New BTC order for A$4,000", createdAt: daysAgo(0) },
  ];

  for (const ev of events) {
    await prisma.activityEvent.create({ data: ev });
  }

  console.log(`✅ Created ${events.length} activity events`);

  // ── 6. Price cache ──
  await prisma.priceCache.upsert({
    where: { cryptoType: "BTC" },
    update: { audRate: 95800.50, change24h: 2.34, fetchedAt: new Date() },
    create: { cryptoType: "BTC", audRate: 95800.50, change24h: 2.34, fetchedAt: new Date() },
  });
  await prisma.priceCache.upsert({
    where: { cryptoType: "ETH" },
    update: { audRate: 3310.25, change24h: -1.12, fetchedAt: new Date() },
    create: { cryptoType: "ETH", audRate: 3310.25, change24h: -1.12, fetchedAt: new Date() },
  });

  console.log("✅ Price cache seeded (BTC: A$95,800, ETH: A$3,310)");
  console.log("\n🎉 All fake data created! You can now log in and explore.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
