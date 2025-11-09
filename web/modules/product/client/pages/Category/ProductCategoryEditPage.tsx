"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, Input } from "@heroui/react";
import { Save, Undo2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

const getParamValue = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const ProductCategoryEditPage = (): React.ReactNode => {
  const params = useParams();
  const router = useRouter();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const categoryId = useMemo(() => {
    const rawId = (params?.id ?? undefined) as string | string[] | undefined;

    return getParamValue(rawId);
  }, [params]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO: Hook up to API mutation
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
        {categoryId && (
          <span className="text-small text-default-500">
            Editing category #{categoryId}
          </span>
        )}
      </div>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold">Edit Category</h1>
            <p className="text-default-500 text-small">
              Capture category metadata and synchronize it with your backend.
            </p>
          </div>

          <Input
            label="Category name"
            placeholder="Electronics"
            value={name}
            onValueChange={setName}
            variant="bordered"
          />
          <Input
            label="Code"
            placeholder="CAT-001"
            value={code}
            onValueChange={setCode}
            variant="bordered"
          />

          <div className="flex justify-end">
            <Button color="primary" endContent={<Save size={16} />} type="submit">
              Save
            </Button>
          </div>
        </CardBody>
      </Card>
    </form>
  );
};

export default ProductCategoryEditPage;

