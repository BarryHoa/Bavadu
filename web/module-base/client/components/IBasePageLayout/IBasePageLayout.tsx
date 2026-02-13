"use client";

/**
 * IBasePageLayout – Wrapper cho page Create, Edit, Detail theo design guidelines.
 *
 * Design guidelines:
 * - Full-page form: max-width 40–50em (45rem) cho vùng nội dung chính
 * - CRM pattern: Form bên trái + Sidebar bên phải (Activity, Quick tips, Related)
 * - Header: title (h1), subtitle, actions (Edit button)
 * - Breadcrumb: Dùng useSetBreadcrumbs trong page – layout không render breadcrumb
 *
 * @see docs/form-ux-ui-best-practices.md
 * @see Salesforce Lightning: https://v1.lightningdesignsystem.com/guidelines/layout/
 */
import { cn } from "@heroui/theme";

export type PageLayoutMaxWidth = "form" | "content" | "full" | (string & {});

const MAX_WIDTH_CLASSES: Record<string, string> = {
  form: "max-w-[45rem] w-full", // 45rem ≈ 720px, form UX guideline
  content: "max-w-[60rem] w-full", // Rộng hơn cho detail/list
  full: "w-full",
};

export interface IBasePageLayoutProps {
  /** Page title (h1) */
  title: React.ReactNode;
  /** Optional subtitle below title */
  subtitle?: React.ReactNode;
  /** Actions in header (e.g. Edit button) */
  headerActions?: React.ReactNode;
  /** Main content – form, detail card, etc. */
  children: React.ReactNode;
  /** Optional right sidebar – Quick tips, Org preview, Related (CRM pattern) */
  sidebar?: React.ReactNode;
  /** Page type – affects default maxWidth when not specified */
  variant?: "create" | "edit" | "detail" | "list";
  /** Max width of main content area. "form"=45rem, "content"=60rem, "full"=100% */
  maxWidth?: PageLayoutMaxWidth;
  /** Center main content horizontally when no sidebar */
  centered?: boolean;
  /** Additional class for root */
  className?: string;
  /** Additional class for main content wrapper */
  contentClassName?: string;
}

export function IBasePageLayout({
  title,
  subtitle,
  headerActions,
  children,
  sidebar,
  variant = "detail",
  maxWidth,
  centered = false,
  className,
  contentClassName,
}: IBasePageLayoutProps) {
  const effectiveMaxWidth = maxWidth ?? (variant === "create" || variant === "edit" ? "form" : "content");
  const maxWidthClass =
    MAX_WIDTH_CLASSES[effectiveMaxWidth] ?? effectiveMaxWidth;

  return (
    <article className={cn("flex flex-col gap-6", className)}>
      {/* Header – title, subtitle, actions */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle != null && (
            <p className="mt-1 text-sm text-default-500">{subtitle}</p>
          )}
        </div>
        {headerActions != null && (
          <div className="shrink-0">{headerActions}</div>
        )}
      </header>

      {/* Main content + optional sidebar */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div
          className={cn(
            maxWidthClass,
            centered && !sidebar && "mx-auto",
            contentClassName
          )}
        >
          {children}
        </div>
        {sidebar != null && (
          <aside
            className={cn(
              "w-full shrink-0 lg:w-80 lg:min-w-[18rem]",
              "lg:sticky lg:top-4"
            )}
          >
            {sidebar}
          </aside>
        )}
      </div>
    </article>
  );
}
