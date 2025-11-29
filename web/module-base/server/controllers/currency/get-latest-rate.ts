import getDbConnect from "@base/server/utils/getDbConnect";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { asc, desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

import {
  table_currency,
  table_currency_exchange_rate,
} from "../../schemas";

export async function GET(request: NextRequest) {
  try {
    const db = getDbConnect();
    const { searchParams } = new URL(request.url);
    const currencyId = searchParams.get("currencyId");
    const currencyCode = searchParams.get("currencyCode");

    // If currencyId or currencyCode is provided, get latest rate for that currency
    if (currencyId || currencyCode) {
      let currency;
      
      if (currencyId) {
        currency = await db
          .select()
          .from(table_currency)
          .where(eq(table_currency.id, currencyId))
          .limit(1);
      } else if (currencyCode) {
        currency = await db
          .select()
          .from(table_currency)
          .where(eq(table_currency.code, currencyCode.toUpperCase()))
          .limit(1);
      }

      if (!currency || currency.length === 0) {
        return JSONResponse({
          error: "Currency not found",
          status: 404,
        });
      }

      const latestRate = await db
        .select({
          id: table_currency_exchange_rate.id,
          currencyId: table_currency_exchange_rate.currencyId,
          currencyCode: table_currency.code,
          currencyName: table_currency.name,
          currencySymbol: table_currency.symbol,
          rateDate: table_currency_exchange_rate.rateDate,
          exchangeRate: table_currency_exchange_rate.exchangeRate,
          source: table_currency_exchange_rate.source,
          note: table_currency_exchange_rate.note,
          createdAt: table_currency_exchange_rate.createdAt,
        })
        .from(table_currency_exchange_rate)
        .innerJoin(
          table_currency,
          eq(table_currency_exchange_rate.currencyId, table_currency.id)
        )
        .where(eq(table_currency_exchange_rate.currencyId, currency[0].id))
        .orderBy(desc(table_currency_exchange_rate.rateDate))
        .limit(1);

      if (latestRate.length === 0) {
        return JSONResponse({
          error: "No exchange rate found for this currency",
          status: 404,
        });
      }

      const rate = latestRate[0];
      return JSONResponse({
        data: {
          id: rate.id,
          currencyId: rate.currencyId,
          currencyCode: rate.currencyCode,
          currencyName: rate.currencyName,
          currencySymbol: rate.currencySymbol ?? undefined,
          rateDate: rate.rateDate,
          exchangeRate: rate.exchangeRate ? Number(rate.exchangeRate) : undefined,
          source: rate.source ?? undefined,
          note: rate.note ?? undefined,
          createdAt: rate.createdAt ? new Date(rate.createdAt).getTime() : undefined,
        },
        status: 200,
      });
    }

    // If no currency specified, get latest rate for all active currencies
    const latestRates = await db
      .select({
        id: table_currency_exchange_rate.id,
        currencyId: table_currency_exchange_rate.currencyId,
        currencyCode: table_currency.code,
        currencyName: table_currency.name,
        currencySymbol: table_currency.symbol,
        rateDate: table_currency_exchange_rate.rateDate,
        exchangeRate: table_currency_exchange_rate.exchangeRate,
        source: table_currency_exchange_rate.source,
        note: table_currency_exchange_rate.note,
        createdAt: table_currency_exchange_rate.createdAt,
      })
      .from(table_currency_exchange_rate)
      .innerJoin(
        table_currency,
        eq(table_currency_exchange_rate.currencyId, table_currency.id)
      )
      .where(eq(table_currency.isActive, true))
      .orderBy(
        desc(table_currency_exchange_rate.rateDate),
        asc(table_currency.code)
      );

    // Group by currency and get the latest rate for each
    const ratesByCurrency = new Map();
    for (const rate of latestRates) {
      if (!ratesByCurrency.has(rate.currencyId)) {
        ratesByCurrency.set(rate.currencyId, rate);
      }
    }

    const result = Array.from(ratesByCurrency.values()).map((rate) => ({
      id: rate.id,
      currencyId: rate.currencyId,
      currencyCode: rate.currencyCode,
      currencyName: rate.currencyName,
      currencySymbol: rate.currencySymbol ?? undefined,
      rateDate: rate.rateDate,
      exchangeRate: rate.exchangeRate ? Number(rate.exchangeRate) : undefined,
      source: rate.source ?? undefined,
      note: rate.note ?? undefined,
      createdAt: rate.createdAt ? new Date(rate.createdAt).getTime() : undefined,
    }));

    return JSONResponse({ data: result, status: 200 });
  } catch (error) {
    return JSONResponse({
      error: "Failed to fetch exchange rates",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}

