import React from "react";

export default function ProductsMainLayout({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <div className="p-4">
      <div className="mb-4 border-b pb-2">
        <h2 className="text-xl font-semibold">Products</h2>
      </div>
      <div>{children}</div>
    </div>
  );
}


