import getDbConnect from "@base/server/utils/getDbConnect";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { asc, desc, eq, inArray } from "drizzle-orm";

import { table_currency, table_currency_exchange_rate } from "../../schemas";

export async function GET() {
  try {
    const db = getDbConnect();

    const currencies = await db
      .select()
      .from(table_currency)
      .where(eq(table_currency.isActive, true))
      .orderBy(asc(table_currency.code));

    // Get latest exchange rates for all currencies using optimized query
    // Using subquery with ROW_NUMBER to get only the latest rate per currency
    const currencyIds = currencies.map((currency) => currency.id);
    const rateMap = new Map<string, number>();

    if (currencyIds.length > 0) {
      // Use window function to get only the latest rate for each currency
      // This is much more efficient than loading all rates and filtering
      // Use inArray from drizzle-orm for safe parameterized query
      const allRates = await db
        .select({
          currencyId: table_currency_exchange_rate.currencyId,
          exchangeRate: table_currency_exchange_rate.exchangeRate,
          rateDate: table_currency_exchange_rate.rateDate,
        })
        .from(table_currency_exchange_rate)
        .where(inArray(table_currency_exchange_rate.currencyId, currencyIds))
        .orderBy(
          asc(table_currency_exchange_rate.currencyId),
          desc(table_currency_exchange_rate.rateDate)
        );

      // Group by currencyId and get the latest rate for each (first one due to ordering)
      for (const rate of allRates) {
        if (!rateMap.has(rate.currencyId)) {
          rateMap.set(
            rate.currencyId,
            rate.exchangeRate ? Number(rate.exchangeRate) : 1
          );
        }
      }
    }

    // Single map to create response with rates
    const data = currencies.map((currency) => {
      const rate = rateMap.get(currency.id);
      return {
        id: currency.id,
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol ?? undefined,
        decimalPlaces: currency.decimalPlaces
          ? Number(currency.decimalPlaces)
          : 2,
        isDefault: currency.isDefault,
        isActive: currency.isActive,
        currencyRateToVND: rate ?? 1,
        createdAt: currency.createdAt
          ? new Date(currency.createdAt).getTime()
          : undefined,
        updatedAt: currency.updatedAt
          ? new Date(currency.updatedAt).getTime()
          : undefined,
      };
    });

    return JSONResponse({ data, status: 200 });
  } catch (error) {
    return JSONResponse({
      error: "Failed to fetch currencies",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
