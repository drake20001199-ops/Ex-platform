import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(8, "Valid phone number required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  addressStreet: z.string().min(1, "Street address is required"),
  addressCity: z.string().min(1, "City is required"),
  addressState: z.string().min(1, "State is required"),
  addressPostcode: z.string().min(4, "Valid postcode required"),
  countryOfResidence: z.string().min(1, "Country is required"),
  citizenship: z.string().optional(),
  taxStatus: z.string().optional(),
  sourceOfFunds: z.string().optional(),
  purpose: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

const BTC_REGEX = /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/;
const ETH_REGEX = /^0x[a-fA-F0-9]{40}$/;

export const createTransactionSchema = z.object({
  cryptoType: z.enum(["BTC", "ETH"]),
  audAmount: z.number().positive("Amount must be positive").finite("Invalid amount"),
  walletAddress: z.string().min(1, "Wallet address is required"),
  acceptedTerms: z.literal(true, "You must accept the terms"),
  idempotencyKey: z.string().uuid("Invalid idempotency key"),
});

export function validateWalletAddress(
  address: string,
  cryptoType: "BTC" | "ETH"
): boolean {
  if (cryptoType === "BTC") return BTC_REGEX.test(address);
  return ETH_REGEX.test(address);
}

export const settleTransactionSchema = z.object({
  exchangeRate: z.number().positive("Exchange rate must be positive").max(10_000_000, "Exchange rate too high"),
  markupPercentage: z.number().min(0, "Markup cannot be negative").max(20, "Markup cannot exceed 20%"),
  finalCustomerRate: z.number().positive("Final rate must be positive"),
  cryptoAmount: z.number().positive("Crypto amount must be positive"),
  blockchainTxHash: z.string().min(10, "Invalid TX hash").max(100).optional(),
  blockchainTxLink: z.string().url("Invalid URL").optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type SettleTransactionInput = z.infer<typeof settleTransactionSchema>;
