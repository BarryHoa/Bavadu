"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useState } from "react";

// Test Component: Demonstrates patterns that React Compiler will optimize
// These patterns previously required useMemo/useCallback, but no longer do

interface ItemListProps {
  items: string[];
  onItemClick: (item: string) => void;
}

function ItemList({ items, onItemClick }: ItemListProps) {
  // React Compiler will automatically memoize this computation
  const sortedItems = items.sort((a, b) => a.localeCompare(b));
  const filteredItems = sortedItems.filter((item) => item.length > 3);

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Total items: {items.length}, Filtered: {filteredItems.length}
      </p>
      <ul className="list-disc list-inside space-y-1">
        {filteredItems.map((item) => (
          <li
            key={item}
            onClick={() => onItemClick(item)}
            className="cursor-pointer hover:text-blue-600"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface CounterDisplayProps {
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

function CounterDisplay({ count, onIncrement, onDecrement }: CounterDisplayProps) {
  // React Compiler will automatically memoize these computations
  const doubled = count * 2;
  const isEven = count % 2 === 0;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-2xl font-bold">Count: {count}</p>
        <p className="text-sm text-gray-500">Doubled: {doubled}</p>
        <p className="text-sm text-gray-500">Is Even: {isEven ? "Yes" : "No"}</p>
      </div>
      <div className="flex gap-2 justify-center">
        <Button size="sm" onPress={onDecrement}>
          Decrement
        </Button>
        <Button size="sm" onPress={onIncrement}>
          Increment
        </Button>
      </div>
    </div>
  );
}

export default function TestComponent() {
  const [count, setCount] = useState(0);
  const [items] = useState(["apple", "banana", "cherry", "date", "elderberry", "fig"]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: 0,
  });

  // React Compiler will automatically memoize these callbacks
  const handleIncrement = () => {
    setCount((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setCount((prev) => prev - 1);
  };

  const handleItemClick = (item: string) => {
    console.log("Item clicked:", item);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Test 1: Item List with Callbacks</h2>
        </CardHeader>
        <CardBody>
          <ItemList items={items} onItemClick={handleItemClick} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">Test 2: Counter with State</h2>
        </CardHeader>
        <CardBody>
          <CounterDisplay
            count={count}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
          />
        </CardBody>
      </Card>
    </div>
  );
}

