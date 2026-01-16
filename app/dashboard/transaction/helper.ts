import { Decimal } from "@prisma/client/runtime/library";

export function serializeData<T>(obj: T): any {
  if (Array.isArray(obj)) {
    return obj.map(serializeData);
  }

  if (obj !== null && typeof obj === "object") {
    // 1. Tangani Decimal Prisma
    if (Decimal.isDecimal(obj)) {
      return obj.toNumber();
    }

    // 2. Tangani Date (Ubah ke string agar aman)
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, serializeData(value)])
    );
  }

  return obj;
}
