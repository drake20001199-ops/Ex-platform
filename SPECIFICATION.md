# [PLATFORM_NAME] — Cryptocurrency Exchange Platform

## System Specification Document

**Version 2.1 (Revised)** | March 2026
Australian Market | AUSTRAC Registered

> This document is the single source of truth for the entire platform build.
> It incorporates the original v2 specification plus all revisions identified during technical review.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture & Technology Stack](#2-architecture--technology-stack)
3. [Data Model](#3-data-model)
4. [User Flows](#4-user-flows)
5. [Pricing & Exchange Rate Logic](#5-pricing--exchange-rate-logic)
6. [Customer Dashboard](#6-customer-dashboard)
7. [Admin Panel — Full Specification](#7-admin-panel--full-specification)
8. [Homepage / Landing Page](#8-homepage--landing-page)
9. [KYC Provider Comparison](#9-kyc-provider-comparison)
10. [Security Considerations](#10-security-considerations)
11. [Regulatory & Compliance Notes](#11-regulatory--compliance-notes)
12. [Third-Party Services Summary](#12-third-party-services-summary)
13. [Design System & UI Standards (2026)](#13-design-system--ui-standards-2026)
14. [Error Handling & Edge Cases](#14-error-handling--edge-cases)
15. [Future Considerations (Out of Scope v1)](#15-future-considerations-out-of-scope-v1)
16. [Development Deliverables](#16-development-deliverables)

---

## 1. Executive Summary

| Parameter               | Detail                                      |
|--------------------------|----------------------------------------------|
| Platform Name            | [PLATFORM_NAME]                              |
| Target Market            | Australia (AUD)                              |
| Supported Pairs          | AUD → BTC, AUD → ETH                        |
| Payment Method           | Bank Transfer (BSB/Account Number)           |
| Expected Users           | Up to a few hundred                          |
| Concurrent Users         | Low (not simultaneous)                       |
| AUSTRAC License          | Active                                       |
| Mobile App               | No — responsive web only                     |
| Reverse Exchange         | Not in scope (no crypto → AUD)               |
| Language                 | English only                                 |

[PLATFORM_NAME] is a web-based cryptocurrency exchange platform targeting the Australian market. The platform enables verified customers to purchase BTC and ETH using AUD via bank transfer. The system prioritises regulatory compliance (AUSTRAC), simplicity of operation, and cost efficiency.

---

## 2. Architecture & Technology Stack

Given the small user base (a few hundred customers, not concurrent), the system can be built as a lean, cost-effective monolithic application. There is no need for a dedicated database server or complex infrastructure.

### 2.1 Recommended Stack

| Layer            | Technology                          | Rationale                                     |
|-------------------|--------------------------------------|-----------------------------------------------|
| Frontend          | Next.js (React) + TypeScript         | SSR for SEO, fast, modern UI framework        |
| Backend / API     | Next.js API Routes                   | Single codebase, serverless-friendly          |
| Database          | Supabase (Postgres)                  | Managed, no server needed, free tier          |
| Hosting           | Vercel                               | Auto deploys, SSL, CDN, serverless            |
| File Storage      | Supabase Storage or Cloudflare R2    | KYC documents, cheap object storage           |
| KYC Provider      | Sumsub (recommended)                 | API-based identity verification               |
| Price Feed        | CoinGecko API (free tier)            | Crypto market rates                           |
| Email             | Resend                               | Transactional emails                          |
| Authentication    | NextAuth.js or custom JWT            | Session management                            |
| UI Framework      | Tailwind CSS + shadcn/ui             | Modern component library                      |
| Animations        | Framer Motion                        | Micro-interactions and transitions            |
| ORM               | Prisma or Drizzle                    | Type-safe database queries                    |

### 2.2 Why No Dedicated Database Server?

With only a few hundred users and low concurrent traffic, a managed serverless database is more than sufficient:

- No server maintenance or patching
- Automatic backups
- Free or near-free tier covers this scale
- Scales if needed without migration
- A full dedicated database (AWS RDS, etc.) would be overkill and unnecessarily expensive

### 2.3 Monthly Cost Estimate

| Service                        | Estimated Cost                         |
|---------------------------------|----------------------------------------|
| Vercel Hosting (Pro)            | ~$20/mo                                |
| Database (Supabase)             | $0–25/mo (free tier likely sufficient) |
| File Storage (R2/Supabase)      | $0–5/mo                                |
| KYC Provider                    | Per-verification ($1–3 per check)      |
| Domain + SSL                    | ~$15/year (SSL free via Vercel)        |
| CoinGecko API                   | Free tier (30 calls/min)               |
| Email (Resend)                  | Free tier (100 emails/day)             |
| **Total (excl. KYC per-use)**   | **~$25–50/mo**                         |

---

## 3. Data Model

### 3.1 Users Table

| Field                | Type / Notes                                                                 |
|-----------------------|------------------------------------------------------------------------------|
| id                    | UUID, primary key                                                            |
| email                 | Unique, indexed                                                              |
| email_verified_at     | Timestamp, nullable — **[ADDED]** email verification tracking                |
| password_hash         | bcrypt hashed                                                                |
| first_name            | String, required                                                             |
| last_name             | String, required                                                             |
| phone                 | String, required                                                             |
| date_of_birth         | Date, required                                                               |
| address_street        | String, required — **[CHANGED]** split from JSON for better querying         |
| address_city          | String, required                                                             |
| address_state         | String, required                                                             |
| address_postcode      | String, required                                                             |
| country_of_residence  | String, required                                                             |
| citizenship           | String, optional                                                             |
| tax_status            | String, optional                                                             |
| source_of_funds       | String, optional                                                             |
| purpose               | String, optional                                                             |
| kyc_status            | Enum: `not_started` / `in_review` / `approved` / `rejected` / `need_more_docs` |
| kyc_provider_ref      | External KYC reference ID                                                    |
| kyc_rejection_reason  | String, nullable                                                             |
| role                  | Enum: `customer` / `admin`                                                   |
| created_at            | Timestamp                                                                    |
| updated_at            | Timestamp                                                                    |

### 3.2 KYC Documents Table

| Field          | Type / Notes                                                     |
|-----------------|------------------------------------------------------------------|
| id              | UUID, primary key                                                |
| user_id         | FK to users                                                      |
| document_type   | Enum: `passport` / `id_card` / `selfie` / `proof_of_address`    |
| file_url        | URL to stored file (signed, private)                             |
| uploaded_at     | Timestamp                                                        |
| status          | Enum: `pending` / `accepted` / `rejected`                       |

### 3.3 Transactions Table

| Field                | Type / Notes                                                              |
|-----------------------|---------------------------------------------------------------------------|
| id                    | UUID, primary key                                                         |
| user_id               | FK to users                                                               |
| crypto_type           | Enum: `BTC` / `ETH`                                                      |
| aud_amount            | Decimal, minimum defined by settings (default 2000)                       |
| crypto_amount         | Decimal, filled at settlement                                             |
| exchange_rate         | Decimal, rate applied at settlement                                       |
| markup_percentage     | Decimal, admin-defined spread                                             |
| final_customer_rate   | Decimal — **[ADDED]** the actual rate charged (exchange_rate × (1+markup)) |
| wallet_address        | String, customer crypto wallet (validated format)                         |
| status                | Enum: `created` / `awaiting_payment` / `payment_received` / `crypto_sent` / `completed` / `cancelled` |
| bsb_sent_at           | Timestamp, nullable — **[ADDED]** when BSB details were sent              |
| blockchain_tx_hash    | String, nullable                                                          |
| blockchain_tx_link    | String, nullable (block explorer URL)                                     |
| admin_notes           | Text, nullable                                                            |
| cancelled_reason      | Text, nullable — **[ADDED]** reason for cancellation                      |
| cancelled_at          | Timestamp, nullable — **[ADDED]**                                         |
| idempotency_key       | String, unique — **[ADDED]** prevents duplicate order submission          |
| created_at            | Timestamp                                                                 |
| settled_at            | Timestamp, nullable                                                       |
| updated_at            | Timestamp                                                                 |

> **[ADDED STATUS]**: `awaiting_payment` — inserted between `created` and `payment_received` to track that BSB details have been sent to the customer.

### 3.4 Admin Settings Table — **[NEW]**

| Field                    | Type / Notes                                            |
|---------------------------|--------------------------------------------------------|
| id                        | UUID, primary key                                      |
| key                       | String, unique (e.g. `global_markup`, `btc_enabled`)   |
| value                     | String (parsed per key type)                           |
| updated_at                | Timestamp                                              |
| updated_by                | FK to users (admin)                                    |

Default settings keys:

| Key                        | Default Value | Description                             |
|-----------------------------|---------------|-----------------------------------------|
| global_markup_percent       | 3.0           | Default markup on all conversions       |
| btc_markup_override         | null          | Optional separate BTC markup            |
| eth_markup_override         | null          | Optional separate ETH markup            |
| min_transaction_aud         | 2000          | Minimum order amount                    |
| max_transaction_aud         | 50000         | **[ADDED]** Maximum order amount        |
| btc_trading_enabled         | true          | Toggle BTC purchases                    |
| eth_trading_enabled         | true          | Toggle ETH purchases                    |
| maintenance_mode            | false         | Show maintenance page to customers      |
| ttr_threshold_aud           | 10000         | **[ADDED]** TTR alert threshold         |
| order_timeout_hours         | 72            | **[ADDED]** Auto-cancel stale orders    |

### 3.5 Audit Logs Table — **[NEW]**

| Field          | Type / Notes                                                    |
|-----------------|----------------------------------------------------------------|
| id              | UUID, primary key                                              |
| actor_id        | FK to users (who performed the action)                         |
| action          | String (e.g. `kyc_approved`, `transaction_status_changed`)     |
| entity_type     | String (e.g. `user`, `transaction`, `setting`)                 |
| entity_id       | UUID of the affected record                                    |
| old_value       | JSON, nullable                                                 |
| new_value       | JSON, nullable                                                 |
| ip_address      | String                                                         |
| created_at      | Timestamp                                                      |

### 3.6 Activity Events Table — **[NEW]**

| Field          | Type / Notes                                                       |
|-----------------|-------------------------------------------------------------------|
| id              | UUID, primary key                                                 |
| event_type      | Enum: `user_registered` / `kyc_status_changed` / `transaction_created` / `transaction_status_changed` |
| user_id         | FK to users (the subject of the event)                            |
| entity_id       | UUID, nullable (transaction ID, etc.)                             |
| description     | String (human-readable summary)                                   |
| created_at      | Timestamp                                                         |

### 3.7 Email Verification Tokens Table — **[NEW]**

| Field          | Type / Notes                         |
|-----------------|--------------------------------------|
| id              | UUID, primary key                    |
| user_id         | FK to users                          |
| token           | String, unique, indexed              |
| expires_at      | Timestamp                            |
| used_at         | Timestamp, nullable                  |
| created_at      | Timestamp                            |

### 3.8 Password Reset Tokens Table — **[NEW]**

| Field          | Type / Notes                         |
|-----------------|--------------------------------------|
| id              | UUID, primary key                    |
| user_id         | FK to users                          |
| token           | String, unique, indexed              |
| expires_at      | Timestamp                            |
| used_at         | Timestamp, nullable                  |
| created_at      | Timestamp                            |

### 3.9 Price Cache Table — **[NEW]**

| Field          | Type / Notes                                     |
|-----------------|--------------------------------------------------|
| id              | UUID, primary key                                |
| crypto_type     | Enum: `BTC` / `ETH`                             |
| aud_rate        | Decimal                                          |
| change_24h      | Decimal (percentage)                             |
| fetched_at      | Timestamp                                        |

> Server-side cache for CoinGecko rates. Refreshed every 30–60 seconds. All client requests served from cache to avoid rate limit issues (free tier = 30 req/min).

---

## 4. User Flows

### 4.1 Registration Flow

| Step               | Description                                                                                              |
|---------------------|----------------------------------------------------------------------------------------------------------|
| 1. Landing Page     | Customer visits homepage, sees live BTC/ETH prices                                                       |
| 2. Click Register   | Opens registration form                                                                                  |
| 3. Fill Form        | Required: first name, last name, email, phone, DOB, address, country, password. Optional: citizenship, tax status, source of funds, purpose |
| 4. Submit           | Validates input, checks duplicate email, hashes password                                                 |
| 5. Account Created  | User saved with `kyc_status = not_started`, `email_verified_at = null`                                   |
| 6. Email Sent       | **[ADDED]** Verification email sent with unique token link                                               |
| 7. Email Verified   | **[ADDED]** User clicks link, `email_verified_at` is set, redirected to KYC screen                      |

### 4.2 KYC Verification Flow

| Step                  | Description                                                          |
|------------------------|----------------------------------------------------------------------|
| 1. Verification Screen | User sees required documents list                                   |
| 2. Upload Documents    | ID/passport, selfie, proof of address (if required)                 |
| 3. API Submission      | System sends docs + data to KYC provider                            |
| 4. Status: in_review   | User sees pending message, cannot trade                             |
| 5a. Approved           | KYC provider returns approved — user can trade                      |
| 5b. Rejected           | Rejection reason displayed, user can retry                          |
| 5c. Need More Docs     | User prompted to upload additional documents                        |
| 6. Manual Override     | Admin can manually approve/reject from admin panel                  |

### 4.3 Forgot Password Flow — **[NEW]**

| Step                   | Description                                                       |
|-------------------------|-------------------------------------------------------------------|
| 1. Click "Forgot?"      | Link on login page opens forgot password form                    |
| 2. Enter Email           | User enters registered email                                    |
| 3. Token Sent            | System sends reset link (valid 1 hour) — always shows success message (no email enumeration) |
| 4. Reset Page            | User clicks link, enters new password (with confirmation)        |
| 5. Password Updated      | Hash updated, all existing sessions invalidated                  |
| 6. Redirect to Login     | User logs in with new password                                   |

### 4.4 Transaction Flow (AUD → Crypto)

Core business flow. **Key principle: the exchange rate is NOT locked at order creation. It is determined only when AUD payment is received and the conversion is executed.**

| Step                    | Description                                                                              |
|--------------------------|------------------------------------------------------------------------------------------|
| 1. New Transaction       | Verified user clicks 'Buy Crypto'                                                       |
| 2. Fill Details          | Selects BTC or ETH, enters AUD amount (min/max per settings), enters wallet address, accepts T&C |
| 3. Wallet Validation     | **[ADDED]** System validates wallet address format (BTC or ETH checksum)                 |
| 4. Indicative Price      | System shows current market rate + markup as reference only (**not binding**)             |
| 5. Submit Order          | Transaction created with `status = created`, `idempotency_key` prevents duplicates       |
| 6. Confirmation          | Message: "Bank transfer details will be sent to your email shortly"                      |
| 7. Admin Sends BSB       | Admin sends BSB/account details to customer (via email), sets `status = awaiting_payment`, records `bsb_sent_at` |
| 8. Customer Transfers    | Customer makes bank transfer                                                             |
| 9. Admin Confirms        | Admin updates status to `payment_received`                                               |
| 10. Admin Converts       | Admin converts AUD to crypto via liquidity provider (outside the system)                 |
| 11. Admin Sends Crypto   | Admin sends crypto to customer wallet address (outside the system)                       |
| 12. Admin Enters TX      | Admin enters: exchange rate, crypto amount, TX hash + link                               |
| 13. Status: completed    | Customer sees completed transaction with blockchain receipt                              |

> **[ADDED]** At each status change, an automated email notification is sent to the customer.

### 4.5 Transaction Statuses

| Status              | Meaning                                                              |
|----------------------|----------------------------------------------------------------------|
| `created`            | Order submitted, awaiting BSB details from admin                    |
| `awaiting_payment`   | **[ADDED]** BSB details sent, waiting for AUD transfer              |
| `payment_received`   | AUD received, confirmed by admin                                    |
| `crypto_sent`        | Crypto sent to wallet, TX hash recorded                             |
| `completed`          | Transaction fully settled                                            |
| `cancelled`          | Cancelled by admin (with reason) or auto-cancelled after timeout     |

### 4.6 Automated Emails — **[NEW]**

| Trigger                    | Email To  | Content                                                   |
|-----------------------------|-----------|-----------------------------------------------------------|
| Registration                | Customer  | Welcome + email verification link                         |
| KYC Approved                | Customer  | Verification approved, you can now trade                  |
| KYC Rejected                | Customer  | Verification rejected with reason, how to retry           |
| Order Created               | Admin     | New order notification with customer details              |
| BSB Sent (awaiting_payment) | Customer  | Payment instructions with BSB details                     |
| Payment Received            | Customer  | AUD received, processing your order                       |
| Crypto Sent                 | Customer  | Crypto sent, TX hash and blockchain link                  |
| Transaction Completed       | Customer  | Transaction complete, summary and receipt                 |
| Transaction Cancelled       | Customer  | Transaction cancelled with reason                         |
| Password Reset              | Customer  | Reset link (1 hour expiry)                                |
| TTR Threshold Exceeded      | Admin     | **[ADDED]** Alert: transaction ≥ AUD 10,000              |
| Stale Order Warning         | Admin     | **[ADDED]** Orders approaching timeout                    |

---

## 5. Pricing & Exchange Rate Logic

- **Market Rate Source**: CoinGecko API (free tier). Aggregates from multiple exchanges — rates tend to be higher, benefiting margin.
- **Server-Side Cache**: **[ADDED]** Rates cached every 30–60 seconds in `price_cache` table. All client requests read from cache. Prevents CoinGecko rate limit issues.
- **Admin Markup**: Percentage set by admin (e.g., 3%, 5%). Applied on top of market rate.
- **Display Rate (Homepage)**: Market rate + markup shown as indicative only. **Not binding.**
- **Settlement Rate**: `Current Market Rate × (1 + Markup%)`. Applied only when admin executes the conversion.
- **No Rate Locking**: Due to volatility and bank transfer delays, no rate is locked at order creation. Customer is clearly informed.
- **Stored on Transaction**: `exchange_rate`, `markup_percentage`, and `final_customer_rate` are all saved on each transaction for auditability.

**Example:**
- Customer orders 5,000 AUD of BTC
- Market rate at settlement: 1 BTC = 100,000 AUD
- Admin markup: 3%
- Customer rate: 103,000 AUD/BTC
- Customer receives: 5,000 / 103,000 = **0.04854 BTC**

---

## 6. Customer Dashboard

### 6.1 Dashboard Elements

- Welcome banner with name and KYC status badge
- "Buy Crypto" button (prominent CTA) — disabled if KYC not approved
- Transaction History table: Date, Type (BTC/ETH), AUD Amount, Crypto Amount, Status, Blockchain Link
- Each row expandable/clickable for full details
- Profile section for viewing/editing personal details
- **[ADDED]** Empty state: friendly message + CTA for new users with no transactions

### 6.2 Transaction Detail View

- Transaction ID
- Date created and date settled
- Crypto type and amount
- AUD amount paid
- Exchange rate applied
- Final customer rate — **[ADDED]**
- Wallet address
- Status with visual indicator (color-coded badge)
- Blockchain transaction link (clickable, opens in new tab) — visible only after crypto is sent

---

## 7. Admin Panel — Full Specification

The admin panel is the operational command center of the platform. It is accessible only to the single admin user via a separate `/admin` route with its own authentication and `role === admin` middleware check on every route.

### 7.1 Admin Dashboard (Home Screen)

**Statistics Cards (Top Row)**

| Card                            | Content                                                  |
|----------------------------------|----------------------------------------------------------|
| Total Users                      | Count of all registered users                            |
| Verified Users                   | Count of users with `kyc_status = approved`              |
| Pending KYC                      | Count of `in_review` or `need_more_docs`                 |
| Active Transactions              | Count of `created`, `awaiting_payment`, or `payment_received` |
| Completed Transactions (Today)   | Count of completed in last 24 hours                      |
| Total Volume (AUD)               | Sum of `aud_amount` for all completed transactions       |
| Total Volume (Today)             | Sum of `aud_amount` for today's completed                |
| Current BTC Rate                 | Live BTC/AUD rate (from cache)                           |
| Current ETH Rate                 | Live ETH/AUD rate (from cache)                           |

**Quick Action Buttons**

- View Pending KYC → navigates to Users filtered by pending KYC
- View New Orders → navigates to Transactions filtered by `status = created`
- View Awaiting Payment → navigates to Transactions filtered by `status = awaiting_payment`

**Recent Activity Feed**

Chronological list of the last 20 events (from `activity_events` table), showing:
- New user registrations
- KYC status changes
- New transaction created
- Transaction status changes
- Each entry: timestamp, event type, user name/email, link to relevant record

### 7.2 User Management Screen

**Users List View**

| Column              | Details                                                            |
|----------------------|--------------------------------------------------------------------|
| Name                 | First + Last, clickable to open detail view                       |
| Email                | User email address                                                |
| Phone                | Phone number                                                      |
| KYC Status           | Color-coded badge: green (approved), yellow (in_review), red (rejected), grey (not_started), orange (need_more_docs) |
| Registration Date    | When the account was created                                      |
| Total Transactions   | Count of transactions for this user                               |
| Total Volume (AUD)   | Sum of completed transactions AUD                                 |

**Filters & Search**

- Search by name or email (text input, real-time filter)
- Filter by KYC status (dropdown: All / Not Started / In Review / Approved / Rejected / Need More Docs)
- Filter by registration date range (date picker)
- Sort by: name, date registered, total volume
- Export to Excel — exports the current filtered list to .xlsx file

#### 7.2.1 User Detail Screen

**Section A: Personal Information**
Displays all user fields in an editable form. Admin can modify any field and click "Save Changes".

- First name, Last name, Email, Phone
- Date of birth
- Address (street, city, state, postcode)
- Country of residence
- Citizenship, Tax status, Source of funds, Purpose

**Section B: KYC Status & Documents**

| Element                  | Description                                                        |
|---------------------------|--------------------------------------------------------------------|
| KYC Status Badge          | Large color-coded badge showing current status                    |
| KYC Provider Reference    | External ID from KYC provider (read-only)                        |
| Rejection Reason          | Shown if status = rejected                                        |
| Manual Override Buttons   | "Approve KYC" (green) / "Reject KYC" (red) — each with confirmation dialog. Reject requires reason. |
| Request More Documents    | Button that sets status to `need_more_docs`                      |

**Uploaded Documents List**

| Column         | Details                                             |
|-----------------|-----------------------------------------------------|
| Document Type   | passport / id_card / selfie / proof_of_address     |
| Upload Date     | When it was uploaded                                |
| Status          | pending / accepted / rejected                      |
| Actions         | Preview (modal/new tab), Download, Accept, Reject  |

**Section C: Transaction History**
Table of all transactions for this user (same as main transactions table, filtered). Clicking a transaction opens Transaction Detail.

### 7.3 Transaction Management Screen

**Status Tabs** (top of screen, each with count badge):

- **All** — all transactions
- **New Orders** (`created`) — orders waiting for admin to send BSB details
- **Awaiting Payment** (`awaiting_payment`) — **[ADDED]** BSB sent, waiting for AUD
- **Ready to Process** (`payment_received`) — AUD arrived, ready to convert
- **Crypto Sent** (`crypto_sent`) — crypto sent, awaiting confirmation
- **Completed** — settled transactions
- **Cancelled** — cancelled transactions

**Transaction List Table**

| Column           | Details                                              |
|-------------------|------------------------------------------------------|
| Transaction ID    | Short UUID, clickable                               |
| Date              | Created timestamp                                    |
| Customer          | Name + email, clickable to user detail              |
| Crypto Type       | BTC or ETH icon + label                             |
| AUD Amount        | Formatted with $ sign and commas                    |
| Crypto Amount     | Filled after settlement, otherwise "—"              |
| Wallet Address    | Truncated with copy button                          |
| Status            | Color-coded badge                                    |
| TTR Flag          | **[ADDED]** ⚠️ indicator if AUD ≥ 10,000            |
| Actions           | Quick action buttons (see below)                    |

**Quick Action Buttons (per row)**

| Current Status        | Available Actions                                              |
|------------------------|----------------------------------------------------------------|
| `created`              | "Send BSB & Mark Awaiting Payment" button                     |
| `awaiting_payment`     | "Mark Payment Received" button                                |
| `payment_received`     | "Enter Settlement Details" button (opens settlement form)     |
| `crypto_sent`          | "Mark Completed" button                                       |
| Any (except completed) | "Cancel" button (opens confirmation + reason dialog)          |

**Filters**: status (via tabs), crypto type, date range, search by name/email/transaction ID, sort by date/amount/status.

**Export**: to Excel (.xlsx) with all columns + exchange rate, markup, TX hash, admin notes.

#### 7.3.1 Transaction Detail Screen

**Section A: Transaction Info (Read-Only)**

| Field            | Notes                                        |
|-------------------|----------------------------------------------|
| Transaction ID    | Full UUID                                    |
| Created At        | Timestamp                                    |
| Customer Name     | Clickable link to user detail                |
| Customer Email    | With copy button                             |
| Crypto Type       | BTC or ETH                                   |
| AUD Amount        | Formatted                                    |
| Wallet Address    | Full address with copy button                |
| Current Status    | Large color-coded badge                      |
| TTR Flag          | **[ADDED]** Warning if ≥ threshold           |

**Section B: Settlement Details (Editable)**
Active when admin processes conversion:

| Field                | Notes                                                                         |
|-----------------------|-------------------------------------------------------------------------------|
| Exchange Rate         | Admin enters the rate used for conversion                                    |
| Markup %              | Pre-filled from settings, editable for this transaction                      |
| Final Customer Rate   | Auto-calculated: Exchange Rate × (1 + Markup%)                               |
| Crypto Amount         | Auto-calculated: AUD Amount / Final Customer Rate. Also manually editable.   |
| Blockchain TX Hash    | Admin pastes hash after sending crypto                                       |
| Blockchain TX Link    | Full URL to block explorer (auto-generated from hash when possible)          |

**Section C: Admin Notes**
Free-text area for internal notes. Only visible to admin. Saved per transaction.

**Section D: Status Timeline**
Visual timeline showing history of status changes:

`created → awaiting_payment → payment_received → crypto_sent → completed`

Each step shows timestamp, creating a clear audit trail.

**Action Buttons (Bottom)**

| Button                    | Behaviour                                                                     |
|----------------------------|-------------------------------------------------------------------------------|
| Send BSB & Mark Awaiting   | **[ADDED]** Sets status to `awaiting_payment`, records `bsb_sent_at`         |
| Mark Payment Received      | Sets status to `payment_received`. Visible when `awaiting_payment`.          |
| Save Settlement Details    | Saves rate, crypto amount, TX hash. Visible when `payment_received`.         |
| Mark Crypto Sent           | Sets status to `crypto_sent`. Requires TX hash. Visible when `payment_received`. |
| Mark Completed             | Sets status to `completed`. Visible when `crypto_sent`.                      |
| Cancel Transaction         | Opens confirmation dialog with reason. Available except on `completed`.      |
| Save Notes                 | Saves admin notes without changing status.                                   |

### 7.4 Admin Daily Workflow

**Morning Routine**
1. Login to admin panel
2. Check Dashboard — review statistics, note any pending KYC or new orders
3. Review Pending KYC — click "View Pending KYC", review uploaded documents, approve or reject each user

**Processing New Orders**
4. Go to Transactions → "New Orders" tab
5. For each new order: review customer details and wallet address
6. Send BSB/account details to the customer via email
7. Click "Send BSB & Mark Awaiting Payment" — status moves to `awaiting_payment`

**Processing Payments**
8. Check bank account for incoming transfers
9. When AUD arrives: go to matching transaction, click "Mark Payment Received"
10. Execute conversion via liquidity provider (outside the system)
11. Send crypto to customer wallet address (outside the system)
12. Return to transaction detail, enter: exchange rate, crypto amount, TX hash, TX link
13. Click "Mark Crypto Sent"
14. Once confirmed on blockchain, click "Mark Completed"

**End of Day**
15. Review completed transactions for the day
16. Check for any stuck/pending items (system highlights stale orders)
17. Export reports if needed

### 7.5 Settings Screen

| Setting                  | Details                                                             |
|---------------------------|---------------------------------------------------------------------|
| Global Markup %           | Default markup on all conversions. Number input with decimals.     |
| BTC Markup Override       | Optional separate markup for BTC. If empty, uses global.           |
| ETH Markup Override       | Optional separate markup for ETH. If empty, uses global.           |
| Minimum Transaction (AUD) | Default: 2000. Prevents orders below this amount.                 |
| Maximum Transaction (AUD) | **[ADDED]** Default: 50000. Prevents extremely large orders.      |
| BTC Trading Enabled       | Toggle switch. If off, customers cannot select BTC.                |
| ETH Trading Enabled       | Toggle switch. If off, customers cannot select ETH.                |
| Maintenance Mode          | Toggle switch. If on, customer-facing site shows maintenance page. |
| TTR Threshold (AUD)       | **[ADDED]** Default: 10000. Orders ≥ this trigger admin alert.    |
| Order Timeout (Hours)     | **[ADDED]** Default: 72. Auto-cancel stale `created` orders.      |

All setting changes are logged in the audit_logs table with timestamp.

### 7.6 Reports Screen

**Report Types**

| Report               | Content                                                                            |
|------------------------|------------------------------------------------------------------------------------|
| Customer Report        | All user data: name, email, phone, DOB, address, KYC status, registration date, total volume |
| Transaction Report     | All transaction data: ID, customer, crypto type, AUD amount, crypto amount, rate, markup, final rate, status, TX hash, dates |
| Volume Summary         | Aggregated totals by day/week/month: number of transactions, total AUD, total BTC, total ETH |
| TTR Report             | **[ADDED]** Transactions ≥ TTR threshold for regulatory reporting                 |

**Filters** (applied before export): date range, status, crypto type, specific user.

**Export**: Generate & Download — creates .xlsx file and triggers browser download.

### 7.7 Admin Navigation Structure

| Menu Item      | Screen                                         |
|-----------------|-------------------------------------------------|
| Dashboard       | 7.1 — Statistics, quick actions, activity feed |
| Users           | 7.2 — User list with search/filter            |
| Transactions    | 7.3 — Transaction queue with status tabs       |
| Settings        | 7.5 — Markup, limits, toggles                 |
| Reports         | 7.6 — Excel report generation                 |
| Logout          | Logs admin out, returns to public site         |

---

## 8. Homepage / Landing Page

### 8.1 Design Direction

- Dark theme with accent colors (dark navy/black background, blue/gold accents)
- Live-updating BTC and ETH prices in AUD (prominent hero section)
- Animated price tickers with subtle crypto-themed animations
- Clean typography, modern 2026 web aesthetics
- Mobile-responsive design
- Glassmorphism elements and bento-grid layout sections — **[ADDED]**
- Skeleton loaders while data fetches — **[ADDED]**

### 8.2 Page Sections

| Section         | Content                                                                            |
|------------------|------------------------------------------------------------------------------------|
| Hero Section     | Large headline (e.g., "Buy Bitcoin & Ethereum with AUD"), live prices, prominent "Get Started" CTA |
| How It Works     | 3-step visual: 1) Create Account, 2) Verify Identity, 3) Buy Crypto              |
| Live Prices      | Real-time BTC and ETH prices in AUD with 24h change %                             |
| Trust Signals    | AUSTRAC registered badge, security features, Australian-owned                     |
| FAQ Section      | Common questions about service, fees, security                                     |
| Footer           | Links, legal disclaimers, contact info, ABN, Privacy Policy link, T&C link        |

---

## 9. KYC Provider Comparison

| Provider | Pros                                                          | Cons                                 |
|----------|---------------------------------------------------------------|--------------------------------------|
| Sumsub   | AU support, AUSTRAC-friendly, good pricing for low volume, dashboard included | Slightly complex setup              |
| Veriff   | Fast integration, good UX, strong facial recognition          | Higher per-check cost               |
| Onfido   | Well-known, comprehensive checks, AU coverage                 | More expensive, enterprise-oriented |

**Recommendation**: Sumsub — best balance of price, Australian document coverage, AUSTRAC compliance support, and built-in case management. Pricing starts ~$1–2 per verification for low volumes.

---

## 10. Security Considerations

- All passwords hashed with bcrypt (min 12 rounds)
- HTTPS enforced (automatic via Vercel)
- JWT tokens with short expiry (15 min) + refresh tokens (7 days)
- Rate limiting on login, registration, **and transaction creation endpoints** — **[ADDED]**
- CSRF protection on all forms
- KYC documents stored in private bucket with signed URLs (not publicly accessible)
- Admin panel behind separate auth with strong password + `role === admin` middleware on every `/admin/*` route — **[CLARIFIED]**
- Input validation and sanitization on all endpoints
- SQL injection prevention via parameterized queries (ORM)
- Regular dependency updates
- **[ADDED]** Wallet address format validation (BTC: base58/bech32, ETH: checksum)
- **[ADDED]** Idempotency keys on transaction creation to prevent duplicate orders
- **[ADDED]** Server-side KYC status check on every sensitive operation (not just client-side)
- **[ADDED]** Session invalidation on password change
- **[ADDED]** No email enumeration on forgot password (always show generic success message)
- **[ADDED]** Content Security Policy (CSP) headers
- **[ADDED]** XSS prevention via React's built-in escaping + CSP

---

## 11. Regulatory & Compliance Notes

As an AUSTRAC-registered Digital Currency Exchange (DCE), [PLATFORM_NAME] must maintain:

| Requirement                     | Implementation                                                              |
|----------------------------------|-----------------------------------------------------------------------------|
| KYC/AML Program                  | Identity verification before allowing transactions. KYC provider API.      |
| Transaction Records              | All transactions recorded and retained for 7 years.                        |
| Suspicious Matter Reports (SMR)  | Admin can flag suspicious transactions via notes field. Consider `flagged` status. |
| Threshold Transaction Reports    | Transactions ≥ AUD 10,000 trigger admin alert + TTR report. **[IMPLEMENTED]** |
| Customer Records                 | Full customer details retained. Users table with KYC documents.            |
| Terms & Conditions               | Customer must accept T&C and risk disclosure before each transaction.      |
| Privacy Policy                   | **[ADDED]** Required by Australian Privacy Act. Dedicated page.            |
| Cookie Consent                   | **[ADDED]** Required. Banner with accept/decline.                          |
| Audit Trail                      | **[ADDED]** All admin actions logged in audit_logs table.                  |

---

## 12. Third-Party Services Summary

| Service             | Provider                          | Cost                  |
|----------------------|------------------------------------|-----------------------|
| Hosting + Deploy     | Vercel                            | ~$20/mo               |
| Database             | Supabase                          | Free – $25/mo         |
| File Storage         | Supabase Storage or Cloudflare R2 | ~$0–5/mo              |
| KYC Verification     | Sumsub (recommended)              | $1–3 per check        |
| Price Data           | CoinGecko API                     | Free (30 req/min)     |
| Transactional Email  | Resend                            | Free tier             |
| Domain               | (existing)                        | ~$15/year             |
| SSL Certificate      | Vercel (automatic)                | Free                  |

No dedicated server, no Docker, no Kubernetes, no Redis, no message queue. The entire system runs as a serverless application with managed services.

---

## 13. Design System & UI Standards (2026) — **[NEW SECTION]**

### 13.1 Visual Language

| Aspect          | Specification                                                     |
|------------------|-------------------------------------------------------------------|
| Theme            | Dark mode primary, with light mode toggle                        |
| Background       | Deep navy (#0a0e1a) to black gradients                           |
| Primary Accent   | Electric blue (#3b82f6) for CTAs and interactive elements        |
| Secondary Accent | Gold (#f59e0b) for highlights and success states                 |
| Error            | Red (#ef4444)                                                     |
| Success          | Green (#22c55e)                                                   |
| Typography       | Inter or Geist Sans (system-like, modern)                        |
| Border Radius    | Rounded-lg (8px) to rounded-xl (12px) for cards                 |
| Shadows          | Subtle glow effects instead of traditional box-shadows           |

### 13.2 Component Patterns

- **Cards**: Glassmorphism with backdrop-blur and semi-transparent backgrounds
- **Tables**: Zebra striping with hover highlights, sticky headers
- **Badges**: Pill-shaped, color-coded by status
- **Buttons**: Gradient fills for primary, ghost/outline for secondary
- **Loading**: Skeleton loaders (pulse animation) — never spinners
- **Transitions**: Framer Motion for page transitions, list animations, and micro-interactions
- **Layout**: Bento grid for dashboard cards, responsive CSS Grid / Flexbox
- **Empty States**: Illustration + helpful message + primary action CTA

### 13.3 Formatting Standards — **[NEW]**

| Data Type         | Format                                          |
|--------------------|--------------------------------------------------|
| AUD Currency       | `Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' })` — e.g., A$5,000.00 |
| BTC Amount         | 8 decimal places (satoshi precision)            |
| ETH Amount         | 8 decimal places (display)                       |
| Dates              | Stored as UTC, displayed in AEST/AEDT           |
| Timezone           | `Australia/Sydney` as default display timezone   |
| Wallet (truncated) | First 6 + "..." + last 4 characters             |

---

## 14. Error Handling & Edge Cases — **[NEW SECTION]**

### 14.1 API/Service Failures

| Scenario                    | Handling                                                          |
|------------------------------|-------------------------------------------------------------------|
| CoinGecko API down           | Serve last cached rate with "Last updated X min ago" notice      |
| CoinGecko API rate limited   | Server-side cache prevents this (refresh every 30-60s)           |
| Sumsub API down              | Show "Verification temporarily unavailable, try again later"     |
| KYC document upload fails    | Retry with exponential backoff, show clear error to user         |
| Database connection error     | Generic error page, alert admin                                  |
| Resend email fails           | Queue for retry, log failure                                     |

### 14.2 User Edge Cases

| Scenario                               | Handling                                                    |
|------------------------------------------|-------------------------------------------------------------|
| Duplicate order submission (double-click) | Idempotency key rejects duplicate                          |
| Browser back after form submit            | Post-Redirect-Get pattern prevents resubmission            |
| Invalid wallet address format             | Inline validation error, form does not submit              |
| Session expired mid-action                | Redirect to login, preserve intended destination           |
| KYC rejected while user is logged in      | Server-side check blocks trading, UI updates on next load  |
| Order timeout (no payment after 72h)      | Auto-cancel with status `cancelled`, reason "Payment timeout" |

### 14.3 Admin Edge Cases

| Scenario                                 | Handling                                                   |
|-------------------------------------------|-------------------------------------------------------------|
| Admin enters wrong exchange rate           | Confirmation dialog showing calculated crypto amount       |
| Admin tries to complete without TX hash    | Validation prevents status change                          |
| Two admins editing same record (future)    | Optimistic locking via `updated_at` version check          |

---

## 15. Future Considerations (Out of Scope v1)

- Reverse exchange (crypto → AUD)
- Additional cryptocurrencies beyond BTC/ETH
- Automated bank transfer detection (Open Banking API)
- Automated crypto sending (exchange API integration)
- Mobile app (native iOS/Android)
- Multi-admin with role-based access
- SMS notifications for status updates
- Two-factor authentication (2FA) for customers
- Referral program
- Advanced reporting dashboard with charts
- Dark/Light mode toggle (homepage ships dark-only in v1, toggle is v2)

---

## 16. Development Deliverables

| Deliverable            | Description                                                              |
|-------------------------|--------------------------------------------------------------------------|
| Landing Page            | Modern, responsive homepage with live prices                            |
| Registration System     | Sign-up form with validation + email verification                       |
| Forgot Password         | **[ADDED]** Reset flow with email token                                 |
| KYC Integration         | Document upload + Sumsub API integration                                |
| Customer Dashboard      | Transaction history, profile, buy crypto flow                           |
| Transaction System      | Order creation, status management, wallet validation, blockchain receipt |
| Admin Panel             | Dashboard, user mgmt, KYC review, transaction processing, settings, reports |
| Database Schema         | Users, KYC documents, transactions, settings, audit logs, events, tokens |
| API Layer               | REST API endpoints for all operations with rate limiting                |
| Email System            | **[ADDED]** Automated transactional emails for all status changes       |
| Responsive Design       | Full mobile/tablet/desktop support                                      |
| Legal Pages             | **[ADDED]** Terms & Conditions, Privacy Policy, Cookie consent          |

---

## Appendix A: Pages & Routes Map — **[NEW]**

### Public Routes

| Route                  | Page                          |
|-------------------------|-------------------------------|
| `/`                     | Homepage / Landing Page       |
| `/login`                | Login page                    |
| `/register`             | Registration form             |
| `/verify-email`         | Email verification handler    |
| `/forgot-password`      | Forgot password form          |
| `/reset-password`       | Reset password form           |
| `/terms`                | Terms & Conditions            |
| `/privacy`              | Privacy Policy                |

### Customer Routes (authenticated + verified)

| Route                      | Page                        |
|-----------------------------|-----------------------------|
| `/dashboard`                | Customer dashboard          |
| `/dashboard/buy`            | Buy crypto form             |
| `/dashboard/transactions`   | Transaction history         |
| `/dashboard/transactions/[id]` | Transaction detail       |
| `/dashboard/profile`        | Profile settings            |
| `/dashboard/kyc`            | KYC verification            |

### Admin Routes (authenticated + role=admin)

| Route                          | Page                       |
|---------------------------------|----------------------------|
| `/admin`                        | Admin dashboard            |
| `/admin/users`                  | User management list       |
| `/admin/users/[id]`            | User detail                |
| `/admin/transactions`           | Transaction management     |
| `/admin/transactions/[id]`     | Transaction detail         |
| `/admin/settings`               | Platform settings          |
| `/admin/reports`                | Report generation          |

---

> **Document Status**: Ready for development.
> All items marked **[ADDED]**, **[NEW]**, **[CHANGED]**, or **[CLARIFIED]** are revisions added during technical review (v2 → v2.1).
