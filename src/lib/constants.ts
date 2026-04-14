export const SITE_NAME = "CoinVault";
export const SITE_DESCRIPTION =
  "Buy Bitcoin & Ethereum with AUD. AUSTRAC registered. Secure, simple, Australian.";

export const DEFAULT_SETTINGS = {
  global_markup_percent: "3.0",
  btc_markup_override: "",
  eth_markup_override: "",
  min_transaction_aud: "2000",
  max_transaction_aud: "50000",
  btc_trading_enabled: "true",
  eth_trading_enabled: "true",
  maintenance_mode: "false",
  ttr_threshold_aud: "10000",
  order_timeout_hours: "72",
} as const;

export const TRANSACTION_STATUS_LABELS: Record<string, string> = {
  CREATED: "New Order",
  AWAITING_PAYMENT: "Awaiting Payment",
  PAYMENT_RECEIVED: "Payment Received",
  CRYPTO_SENT: "Crypto Sent",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const KYC_STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: "Not Started",
  IN_REVIEW: "In Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  NEED_MORE_DOCS: "Need More Docs",
};

export const KYC_STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: "bg-gray-500/20 text-gray-400",
  IN_REVIEW: "bg-yellow-500/20 text-yellow-400",
  APPROVED: "bg-green-500/20 text-green-400",
  REJECTED: "bg-red-500/20 text-red-400",
  NEED_MORE_DOCS: "bg-orange-500/20 text-orange-400",
};

export const TX_STATUS_COLORS: Record<string, string> = {
  CREATED: "bg-blue-500/20 text-blue-400",
  AWAITING_PAYMENT: "bg-yellow-500/20 text-yellow-400",
  PAYMENT_RECEIVED: "bg-purple-500/20 text-purple-400",
  CRYPTO_SENT: "bg-cyan-500/20 text-cyan-400",
  COMPLETED: "bg-green-500/20 text-green-400",
  CANCELLED: "bg-red-500/20 text-red-400",
};
