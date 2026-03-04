"use client";

interface TimesheetErrorStateProps {
  title: string;
  detail: string;
}

export function TimesheetErrorState({
  title,
  detail,
}: TimesheetErrorStateProps): React.ReactNode {
  return (
    <div className="rounded-xl border border-default-200 bg-default-50 p-6 text-center text-default-600">
      <p className="font-medium">{title}</p>
      <p className="mt-2 text-sm">{detail}</p>
    </div>
  );
}
