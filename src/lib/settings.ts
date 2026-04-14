import { prisma } from "@/lib/db";
import { DEFAULT_SETTINGS } from "@/lib/constants";

type SettingKey = keyof typeof DEFAULT_SETTINGS;

export async function getSetting(key: SettingKey): Promise<string> {
  const setting = await prisma.adminSetting.findUnique({
    where: { key },
  });
  return setting?.value ?? DEFAULT_SETTINGS[key];
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const settings = await prisma.adminSetting.findMany();
  const result: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const s of settings) {
    result[s.key] = s.value;
  }
  return result;
}

export async function updateSetting(
  key: SettingKey,
  value: string,
  updatedBy: string
) {
  return prisma.adminSetting.upsert({
    where: { key },
    update: { value, updatedBy },
    create: { key, value, updatedBy },
  });
}

export async function getMarkup(cryptoType: "BTC" | "ETH"): Promise<number> {
  const override = await getSetting(
    cryptoType === "BTC" ? "btc_markup_override" : "eth_markup_override"
  );
  if (override && override.trim() !== "") return parseFloat(override);
  const global = await getSetting("global_markup_percent");
  return parseFloat(global);
}
