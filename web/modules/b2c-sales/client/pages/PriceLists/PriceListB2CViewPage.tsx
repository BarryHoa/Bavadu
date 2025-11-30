"use client";

import { Card, CardBody, Tab, Tabs } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { priceListB2CService } from "../../services/PriceListB2CService";

export default function PriceListB2CViewPage(): React.ReactNode {
  const params = useParams();
  const id = params.id as string;

  const { data: priceList, isLoading } = useQuery({
    queryKey: ["price-list-b2c", id],
    queryFn: async () => {
      const response = await priceListB2CService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!priceList) {
    return <div>Price list not found</div>;
  }

  const name =
    typeof priceList.name === "object" ? priceList.name : { en: "", vi: "" };
  const applicableTo = priceList.applicableTo || {};

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        {name.vi || name.en || priceList.code}
      </h1>
      <Tabs>
        <Tab key="info" title="Information">
          <Card>
            <CardBody className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">Code</label>
                  <p>{priceList.code}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold">Type</label>
                  <p className="capitalize">{priceList.type}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold">Status</label>
                  <p className="capitalize">{priceList.status}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold">Priority</label>
                  <p>{priceList.priority}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold">Is Default</label>
                  <p>{priceList.isDefault ? "Yes" : "No"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold">Valid From</label>
                  <p>{new Date(priceList.validFrom).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold">Valid To</label>
                  <p>
                    {priceList.validTo
                      ? new Date(priceList.validTo).toLocaleDateString()
                      : "Forever"}
                  </p>
                </div>
              </div>
              {priceList.description && (
                <div>
                  <label className="text-sm font-semibold">Description</label>
                  <p>{priceList.description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-semibold">Applicable To</label>
                <div className="mt-2 space-y-1">
                  {applicableTo.channels &&
                    applicableTo.channels.length > 0 && (
                      <p>
                        <strong>Channels:</strong>{" "}
                        {applicableTo.channels.join(", ")}
                      </p>
                    )}
                  {applicableTo.stores && applicableTo.stores.length > 0 && (
                    <p>
                      <strong>Stores:</strong> {applicableTo.stores.join(", ")}
                    </p>
                  )}
                  {applicableTo.locations &&
                    applicableTo.locations.length > 0 && (
                      <p>
                        <strong>Locations:</strong>{" "}
                        {applicableTo.locations.join(", ")}
                      </p>
                    )}
                  {applicableTo.regions && applicableTo.regions.length > 0 && (
                    <p>
                      <strong>Regions:</strong>{" "}
                      {applicableTo.regions.join(", ")}
                    </p>
                  )}
                  {applicableTo.customerGroups &&
                    applicableTo.customerGroups.length > 0 && (
                      <p>
                        <strong>Customer Groups:</strong>{" "}
                        {applicableTo.customerGroups.join(", ")}
                      </p>
                    )}
                </div>
              </div>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="items" title="Price List Items">
          <Card>
            <CardBody>
              <p className="text-gray-500">
                Price list items management will be implemented here.
              </p>
            </CardBody>
          </Card>
        </Tab>
        <Tab key="rules" title="Pricing Rules">
          <Card>
            <CardBody>
              <p className="text-gray-500">
                Pricing rules management will be implemented here.
              </p>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
}
