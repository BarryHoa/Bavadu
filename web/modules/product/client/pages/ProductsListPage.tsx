import ViewListDataTable from "@/module-base/client/components/ViewListDataTable";
import React from "react";

export default function ProductsListPage(): React.ReactNode {
  return (
    <div>
      <ViewListDataTable model="product" columns={[]} />
    </div>
  );
}
