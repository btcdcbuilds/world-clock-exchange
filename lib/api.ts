import type { ExchangeRates } from "./types";

const FRANKFURTER_API_BASE = "https://api.frankfurter.dev/v1";

/**
 * Fetch latest exchange rates from Frankfurter API
 * @param baseCurrency - Base currency code (default: USD)
 * @returns Exchange rates object
 */
export async function fetchExchangeRates(
  baseCurrency: string = "USD"
): Promise<ExchangeRates> {
  try {
    const response = await fetch(
      `${FRANKFURTER_API_BASE}/latest?base=${baseCurrency}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data as ExchangeRates;
  } catch (error) {
    console.error("Failed to fetch exchange rates:", error);
    throw error;
  }
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
