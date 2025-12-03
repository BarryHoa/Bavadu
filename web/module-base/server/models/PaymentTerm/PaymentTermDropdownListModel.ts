import { BaseViewListModel } from "@base/server/models/BaseViewListModel";
import type {
  ListParamsRequest,
  ListParamsResponse,
} from "@base/server/models/interfaces/ListInterface";
import type { Column } from "drizzle-orm";
import { asc, eq } from "drizzle-orm";
import { table_payment_term } from "../../schemas/payment-term";

type PaymentTermDropdownOption = {
  label: string;
  value: string;
  code: string;
  name: any;
  [key: string]: any;
};

class PaymentTermDropdownListModel extends BaseViewListModel<
  typeof table_payment_term,
  PaymentTermDropdownOption
> {
  constructor() {
    super({
      table: table_payment_term,
      sortDefault: [
        {
          column: "order",
          direction: "ascending",
        },
      ],
    });
  }

  protected declarationColumns() {
    return new Map<
      string,
      {
        column: Column<any>;
        sort?: boolean;
      }
    >([
      ["id", { column: table_payment_term.id, sort: false }],
      ["code", { column: table_payment_term.code, sort: true }],
      ["name", { column: table_payment_term.name, sort: false }],
      ["order", { column: table_payment_term.order, sort: true }],
    ]);
  }

  protected declarationSearch() {
    return new Map();
  }

  protected declarationFilter() {
    return new Map([
      [
        "isActive",
        (value: boolean | undefined) => {
          return eq(table_payment_term.isActive, true);
        },
      ],
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected declarationMappingData(
    row: any,
    index: number
  ): PaymentTermDropdownOption {
    const name =
      typeof row.name === "string"
        ? row.name
        : row.name?.vi || row.name?.en || row.code || "";

    return {
      label: `${row.code} - ${name}`,
      value: row.id,
      code: row.code,
      name: row.name,
    };
  }

  getData = async (
    params: ListParamsRequest
  ): Promise<ListParamsResponse<PaymentTermDropdownOption>> => {
    const result = await this.buildQueryDataListWithSelect(
      params,
      {
        id: table_payment_term.id,
        code: table_payment_term.code,
        name: table_payment_term.name,
        order: table_payment_term.order,
      },
      (query) => {
        return query
          .where(eq(table_payment_term.isActive, true))
          .orderBy(asc(table_payment_term.order));
      }
    );

    return {
      data: result.data.map((row: any, index: number) =>
        this.declarationMappingData(row, index)
      ),
      total: result.total,
    };
  };
}

export default PaymentTermDropdownListModel;

