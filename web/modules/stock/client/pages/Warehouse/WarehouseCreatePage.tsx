/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Input from "@base/client/components/Input";
import LinkAs from "@base/client/components/LinkAs";
import { Button } from "@heroui/button";
import {
  Card,
  CardBody,
  Checkbox,
  Spinner,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import StockService from "../../services/StockService";

export default function WarehouseCreatePage(): React.ReactNode {
  const router = useRouter();
  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.code.trim() || !form.name.trim()) {
      setError("Code and name are required.");
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const response = await StockService.createWarehouse({
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        isActive: form.isActive,
      });

      setSuccess(
        `Warehouse ${response.data.code} created successfully. Redirecting...`
      );

      setTimeout(() => {
        router.push("/workspace/modules/stock/warehouses");
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to create warehouse."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Create Warehouse</h1>
          <p className="text-default-500">
            Define the basic information for a new warehouse.
          </p>
        </div>
        <Button
          as={LinkAs as any}
          size="sm"
          variant="light"
          href="/workspace/modules/stock/warehouses"
        >
          Back to list
        </Button>
      </div>

      <Card>
        <CardBody>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Code"
              placeholder="Unique warehouse code"
              value={form.code}
              onValueChange={(value) => setForm((prev) => ({ ...prev, code: value }))}
              isRequired
            />
            <Input
              label="Name"
              placeholder="Warehouse name"
              value={form.name}
              onValueChange={(value) => setForm((prev) => ({ ...prev, name: value }))}
              isRequired
            />
            <Input
              label="Description"
              placeholder="Optional description"
              value={form.description}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, description: value }))
              }
            />
            <Checkbox
              isSelected={form.isActive}
              onValueChange={(value) =>
                setForm((prev) => ({ ...prev, isActive: value }))
              }
            >
              Active
            </Checkbox>

            {error ? (
              <div className="rounded-medium border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-600">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-medium border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-600">
                {success}
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <Button
                color="primary"
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Create
              </Button>
              {isSubmitting ? (
                <Spinner size="sm" color="primary" className="ml-2" />
              ) : null}
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

