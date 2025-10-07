"use client";

export default function Content({ children }: { children: React.ReactNode }) {
  return (
    <main className="px-2 pb-20 mx-auto">
      <div className="">{children}</div>
    </main>
  );
}
