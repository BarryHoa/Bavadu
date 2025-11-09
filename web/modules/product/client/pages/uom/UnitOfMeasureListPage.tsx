"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, Divider } from "@heroui/react";
import { Plus } from "lucide-react";

const UnitOfMeasureListPage = (): React.ReactNode => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button color="primary" startContent={<Plus size={16} />}>
          Add UOM
        </Button>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">Units of Measure</h1>
            <p className="text-small text-default-500">
              Manage the units that power product conversions and inventory counts.
            </p>
          </div>

          <Divider />

          <p className="text-default-500">
            Hook this page up to your data source to render the full unit of measure
            catalogue. You can plug it into `ViewListDataTable` once the model service
            is available.
          </p>
        </CardBody>
      </Card>
    </div>
  );
};

export default UnitOfMeasureListPage;

