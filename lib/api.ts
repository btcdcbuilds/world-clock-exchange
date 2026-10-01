import type { ExchangeRates } from "./types";

const FRANKFURTER_API_BASE = "https://api.frankfurter.dev/v1";

/**
 * Second, key-less rate source (ExchangeRate-API open access, about 160 currencies).
 * Frankfurter only publishes the European Central Bank's ~30 currencies, so cities
 * using AED, VND, COP, NGN and so on would otherwise always read "No rate".
 */
const OPEN_ER_API_BASE = "https://open.er-api.com/v6/latest";

/** How long the second source may take before it is ignored (milliseconds). */
const SECOND_SOURCE_TIMEOUT_MS = 8000;

/**
 * Fetch latest exchange rates from Frankfurter API only.
 * @param baseCurrency - Base currency code (default: USD)
 */
async function fetchFrankfurterRates(baseCurrency: string): Promise<Record<string, number>> {
  const response = await fetch(`${FRANKFURTER_API_BASE}/latest?base=${baseCurrency}`);
  if (!response.ok) {
    throw new Error(`Frankfurter error: ${response.status}`);
  }
  const data = await response.json();
  return (data?.rates ?? {}) as Record<string, number>;
}

/**
 * Fetch latest exchange rates from the open ExchangeRate-API endpoint.
 * Returns the rates exactly as published, together with the base they are quoted in.
 */
async function fetchOpenErRates(
  baseCurrency: string
): Promise<{ base: string; rates: Record<string, number> }> {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), SECOND_SOURCE_TIMEOUT_MS) : null;
  try {
    const response = await fetch(`${OPEN_ER_API_BASE}/${baseCurrency}`, {
      signal: controller?.signal,
    });
    if (!response.ok) {
      throw new Error(`open.er-api error: ${response.status}`);
    }
    const data = await response.json();
    if (data?.result !== "success" || !data?.rates) {
      throw new Error("open.er-api returned no rates");
    }
    return { base: String(data.base_code ?? baseCurrency), rates: data.rates as Record<string, number> };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Merge the two sources for one base currency.
 * Frankfurter values win wherever Frankfurter has the currency; every other currency
 * is filled from the second source, converted to the chosen base when that source
 * quoted its rates against a different base. The base itself is left out, as
 * Frankfurter does (the World Clock shows a city in the base currency as 1).
 */
export function mergeRates(
  baseCurrency: string,
  primary: Record<string, number> | null,
  secondary: { base: string; rates: Record<string, number> } | null
): Record<string, number> {
  const merged: Record<string, number> = { ...(primary ?? {}) };
  if (!secondary) return merged;

  // Value of one unit of the chosen base, in the second source's own base.
  const baseInSecondary =
    secondary.base === baseCurrency ? 1 : secondary.rates[baseCurrency];
  if (!baseInSecondary || !Number.isFinite(baseInSecondary) || baseInSecondary <= 0) {
    return merged;
  }

  for (const [code, value] of Object.entries(secondary.rates)) {
    if (code === baseCurrency || code in merged) continue;
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) continue;
    merged[code] = value / baseInSecondary;
  }
  return merged;
}

/**
 * Fetch latest exchange rates for the chosen base currency from both sources and merge them.
 * A failure of the second source is quiet: Frankfurter's rates still come back.
 * Only when both sources fail does this throw (the caller then falls back to its cache).
 * @param baseCurrency - Base currency code (default: USD)
 * @returns Exchange rates object (1 base = X currency)
 */
export async function fetchExchangeRates(
  baseCurrency: string = "USD"
): Promise<ExchangeRates["rates"]> {
  const [primary, secondary] = await Promise.allSettled([
    fetchFrankfurterRates(baseCurrency),
    fetchOpenErRates(baseCurrency),
  ]);

  if (primary.status === "rejected" && secondary.status === "rejected") {
    console.error("Failed to fetch exchange rates:", primary.reason);
    throw primary.reason;
  }

  return mergeRates(
    baseCurrency,
    primary.status === "fulfilled" ? primary.value : null,
    secondary.status === "fulfilled" ? secondary.value : null
  );
}

/**
 * Fetch available currencies from Frankfurter API
 * @returns Object with currency codes as keys and names as values
 */
export async function fetchAvailableCurrencies(): Promise<
  Record<string, string>
> {
  try {
    const response = await fetch(`${FRANKFURTER_API_BASE}/currencies`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data as Record<string, string>;
  } catch (error) {
    console.error("Failed to fetch currencies:", error);
    throw error;
  }
}

/**
 * Get exchange rate for a specific currency pair
 * @param from - Source currency code
 * @param to - Target currency code
 * @returns Exchange rate (1 from = X to)
 */
export async function getExchangeRate(
  from: string,
  to: string
): Promise<number> {
  try {
    const response = await fetch(
      `${FRANKFURTER_API_BASE}/latest?base=${from}&symbols=${to}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.rates[to] as number;
  } catch (error) {
    console.error(`Failed to fetch exchange rate ${from}/${to}:`, error);
    throw error;
  }
}
