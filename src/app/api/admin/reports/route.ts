import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {};
  if (from) dateFilter.createdAt = { ...dateFilter.createdAt, gte: new Date(from) };
  if (to) dateFilter.createdAt = { ...dateFilter.createdAt, lte: new Date(to + "T23:59:59Z") };

  let data: Record<string, unknown>[] = [];
  let sheetName = "Report";

  switch (type) {
    case "customers": {
      sheetName = "Customers";
      const users = await prisma.user.findMany({
        where: dateFilter.createdAt ? { createdAt: dateFilter.createdAt } : undefined,
        include: {
          transactions: {
            where: { status: "COMPLETED" },
            select: { audAmount: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      data = users.map((u) => ({
        Name: `${u.firstName} ${u.lastName}`,
        Email: u.email,
        Phone: u.phone,
        "Date of Birth": u.dateOfBirth.toISOString().split("T")[0],
        Address: `${u.addressStreet}, ${u.addressCity} ${u.addressState} ${u.addressPostcode}`,
        Country: u.countryOfResidence,
        "KYC Status": u.kycStatus,
        "Registration Date": u.createdAt.toISOString(),
        "Total Transactions": u.transactions.length,
        "Total Volume (AUD)": u.transactions.reduce((sum, t) => sum + Number(t.audAmount), 0),
      }));
      break;
    }

    case "transactions": {
      sheetName = "Transactions";
      const txs = await prisma.transaction.findMany({
        where: dateFilter.createdAt ? { createdAt: dateFilter.createdAt } : undefined,
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
      data = txs.map((t) => ({
        "Transaction ID": t.id,
        Date: t.createdAt.toISOString(),
        Customer: `${t.user.firstName} ${t.user.lastName}`,
        Email: t.user.email,
        "Crypto Type": t.cryptoType,
        "AUD Amount": Number(t.audAmount),
        "Crypto Amount": t.cryptoAmount ? Number(t.cryptoAmount) : "",
        "Exchange Rate": t.exchangeRate ? Number(t.exchangeRate) : "",
        "Markup %": t.markupPercentage ? Number(t.markupPercentage) : "",
        "Final Rate": t.finalCustomerRate ? Number(t.finalCustomerRate) : "",
        Status: t.status,
        "Wallet Address": t.walletAddress,
        "TX Hash": t.blockchainTxHash || "",
        "Admin Notes": t.adminNotes || "",
        "Settled At": t.settledAt?.toISOString() || "",
      }));
      break;
    }

    case "volume": {
      sheetName = "Volume Summary";
      const txs = await prisma.transaction.findMany({
        where: {
          status: "COMPLETED",
          ...(dateFilter.createdAt ? { createdAt: dateFilter.createdAt } : {}),
        },
        orderBy: { createdAt: "asc" },
      });

      // Group by date
      const byDate = new Map<string, { count: number; aud: number; btc: number; eth: number }>();
      for (const t of txs) {
        const date = t.createdAt.toISOString().split("T")[0];
        const entry = byDate.get(date) || { count: 0, aud: 0, btc: 0, eth: 0 };
        entry.count++;
        entry.aud += Number(t.audAmount);
        if (t.cryptoType === "BTC") entry.btc += Number(t.cryptoAmount || 0);
        if (t.cryptoType === "ETH") entry.eth += Number(t.cryptoAmount || 0);
        byDate.set(date, entry);
      }

      data = Array.from(byDate.entries()).map(([date, v]) => ({
        Date: date,
        Transactions: v.count,
        "Total AUD": v.aud,
        "Total BTC": v.btc,
        "Total ETH": v.eth,
      }));
      break;
    }

    case "ttr": {
      sheetName = "TTR Report";
      const threshold = parseFloat(await getSetting("ttr_threshold_aud"));
      const txs = await prisma.transaction.findMany({
        where: {
          audAmount: { gte: threshold },
          ...(dateFilter.createdAt ? { createdAt: dateFilter.createdAt } : {}),
        },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
      data = txs.map((t) => ({
        "Transaction ID": t.id,
        Date: t.createdAt.toISOString(),
        Customer: `${t.user.firstName} ${t.user.lastName}`,
        Email: t.user.email,
        "AUD Amount": Number(t.audAmount),
        "Crypto Type": t.cryptoType,
        Status: t.status,
        "TTR Flag": Number(t.audAmount) >= threshold ? "YES" : "",
      }));
      break;
    }

    default:
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  }

  // Generate Excel
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${type}-report.xlsx"`,
    },
  });
}
