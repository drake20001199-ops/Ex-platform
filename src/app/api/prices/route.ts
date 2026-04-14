import { NextResponse } from "next/server";
import { getPrices } from "@/lib/crypto-price";

export async function GET() {
  try {
    const prices = await getPrices();
    return NextResponse.json(prices);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}
