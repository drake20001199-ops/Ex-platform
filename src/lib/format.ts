// ============================================================
// src/lib/format.ts
// DESIGN DECISION:
//   - formatAUD()     → "$5,000.00 AUD"  — always includes AUD suffix.
//                       Use for standalone displays where currency context isn't obvious.
//                       This is the default — use it everywhere unless you have a reason not to.
//   - formatAUDShort() → "$5,000.00"     — no AUD suffix.
//                       Use ONLY when AUD is obvious from surrounding UI
//                       (e.g., column header "AUD Amount", or table labeled in AUD).
//   - formatUSD()     → "$74,467.00"     — plain, USD label added in UI where needed.
// ============================================================

function formatAUDNumber(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "$0.00";
  // en-AU + AUD returns "A$5,000.00" — strip the "A" prefix
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(num).replace(/^A\$/, "$");
}

/**
 * Default: "$5,000.00 AUD"
 * Always use this unless you have a specific reason to omit the AUD label.
 */
export function formatAUD(amount: number | string): string {
  return `${formatAUDNumber(amount)} AUD`;
}

/**
 * Short version: "$5,000.00" (no AUD suffix)
 * Use ONLY when the surrounding context makes it clear the currency is AUD.
 */
export function formatAUDShort(amount: number | string): string {
  return formatAUDNumber(amount);
}

export function formatUSD(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
}

export function formatCrypto(amount: number | string, decimals = 8): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return (0).toFixed(decimals);
  return num.toFixed(decimals);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Australia/Sydney",
  }).format(d);
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeZone: "Australia/Sydney",
  }).format(d);
}

export function truncateWallet(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatPercent(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `${num >= 0 ? "+" : ""}${num.toFixed(2)}%`;
}
