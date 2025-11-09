"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, Input } from "@heroui/react";
import { Save, Undo2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

const getParamValue = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

export default function ProductsEditPage(): React.ReactNode {
  const params = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");

  const productId = useMemo(() => {
    const rawId = (params?.id ?? undefined) as string | string[] | undefined;

    return getParamValue(rawId);
  }, [params]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Replace with mutation to update the product
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="light"
          startContent={<Undo2 size={14} />}
          onPress={() => router.back()}
        >
          Back
        </Button>
        {productId && (
          <span className="text-small text-default-500">Editing product #{productId}</span>
        )}
      </div>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">Edit Product</h1>
            <p className="text-default-500 text-small">
              Update basic information for the selected product. Connect this form to
              your API to persist changes.
            </p>
          </div>

          <Input
            label="Product name"
            placeholder="Awesome Product"
            value={name}
            onValueChange={setName}
            variant="bordered"
          />
          <Input
            label="SKU"
            placeholder="SKU-001"
            value={sku}
            onValueChange={setSku}
            variant="bordered"
          />

          <div className="h-2" />

          <div className="flex justify-end">
            <Button color="primary" endContent={<Save size={16} />} type="submit">
              Save Changes
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  );
}

