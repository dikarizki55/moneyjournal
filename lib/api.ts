export type ApiSuccess<T> = { success: true; data: T; message?: string };
export type ApiFailure = { success: false; message: string };

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // non-json response
  }

  if (!res.ok) {
    throw new ApiError(json?.message || `Request failed (${res.status})`, res.status);
  }

  if (json && json.success === false) {
    throw new ApiError(json.message || "Request failed", res.status);
  }

  // Some legacy routes (e.g. /api/monthly-outcome) return a bare payload
  return (json && "data" in json ? json.data : json) as T;
}

export function apiPost<T>(url: string, body: unknown): Promise<T> {
  return apiFetch<T>(url, { method: "POST", body: JSON.stringify(body) });
}

export function apiPut<T>(url: string, body: unknown): Promise<T> {
  return apiFetch<T>(url, { method: "PUT", body: JSON.stringify(body) });
}

export function apiDelete<T>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: "DELETE" });
}

export function formatRupiah(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "Rp 0";

  const number =
    typeof value === "string"
      ? Number(value.replace(/[^\d.-]/g, "")) || 0
      : value;

  if (isNaN(number)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(number)
    .replace("IDR", "Rp");
}

export function formatRupiahPlain(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "0";

  const number =
    typeof value === "string"
      ? Number(value.replace(/[^\d.-]/g, "")) || 0
      : value;

  if (isNaN(number)) return "0";

  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}
