"use client";

import Link from "next/link";
import Image from "next/image";
import { cn, formatPrice } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

type ColumnType =
  | "text"
  | "currency"
  | "badge"
  | "image"
  | "date"
  | "monospace"
  | "count"
  | "conditional";

interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  type: ColumnType;
  fontWeight?: "normal" | "medium" | "bold";
  badgeMap?: Record<string, { label: string; className: string }>;
  fallback?: string;
  suffix?: string;
  render?: (row: T) => React.ReactNode;
  hideOnMobile?: boolean;
}

interface ActionConfig<T> {
  type: "link" | "icon-buttons" | "text-buttons" | "inline-modal" | "none";
  component?: React.ComponentType<{ row: T; onSuccess?: () => void }>;
  href?: (row: T) => string;
  label?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: ActionConfig<T>;
  header?: { title: string; cta?: React.ReactNode };
  empty?: { title: string; description?: string };
  rowClassName?: (row: T) => string;
  keyExtractor: (row: T) => string;
}

// ─── Cell Renderer ──────────────────────────────────────────────────────────

function CellValue<T>({ column, row }: { column: Column<T>; row: T }) {
  const value = (row as Record<string, unknown>)[column.key];

  // Custom render override
  if (column.render) {
    return <>{column.render(row)}</>;
  }

  switch (column.type) {
    case "text": {
      const text = value != null ? String(value) : (column.fallback ?? "—");
      return (
        <span
          className={cn(
            "truncate block",
            column.fontWeight === "bold" && "font-medium",
            column.fontWeight === "medium" && "font-normal"
          )}
        >
          {text}
        </span>
      );
    }

    case "currency": {
      const amount = typeof value === "number" ? value : 0;
      return <span className="tabular-nums">{formatPrice(amount)}</span>;
    }

    case "badge": {
      const str = String(value ?? "");
      const mapping = column.badgeMap?.[str];
      return (
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
            mapping?.className ?? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
          )}
        >
          {mapping?.label ?? str}
        </span>
      );
    }

    case "image": {
      const src = value ? String(value) : null;
      return (
        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground overflow-hidden shrink-0">
          {src ? (
            <Image
              src={src}
              alt=""
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            "S/F"
          )}
        </div>
      );
    }

    case "date": {
      if (!value) return <span className="text-muted-foreground">—</span>;
      const date = value instanceof Date ? value : new Date(String(value));
      return (
        <span className="text-muted-foreground text-xs whitespace-nowrap">
          {date.toLocaleDateString("es-AR")}
        </span>
      );
    }

    case "monospace": {
      const text = value != null ? String(value) : (column.fallback ?? "—");
      return (
        <span className={cn("font-mono text-xs", column.fontWeight === "bold" && "font-medium")}>
          {text}
        </span>
      );
    }

    case "count": {
      const num = typeof value === "number" ? value : 0;
      return (
        <span className="tabular-nums">
          {num}
          {column.suffix ? ` ${column.suffix}` : ""}
        </span>
      );
    }

    case "conditional":
      // Should always have render override — fallback to text
      return (
        <span className="text-muted-foreground">
          {value != null ? String(value) : "—"}
        </span>
      );

    default:
      return <span>{value != null ? String(value) : "—"}</span>;
  }
}

// ─── Actions Renderer ───────────────────────────────────────────────────────

function ActionsCell<T>({
  actions,
  row,
}: {
  actions: ActionConfig<T>;
  row: T;
}) {
  if (actions.type === "none") return null;

  if (actions.type === "link" && actions.href) {
    return (
      <Link
        href={actions.href(row)}
        className="text-sm text-primary hover:underline"
      >
        {actions.label ?? "Ver detalle"}
      </Link>
    );
  }

  if (actions.component) {
    const Component = actions.component;
    return <Component row={row} />;
  }

  return null;
}

// ─── Mobile Card ────────────────────────────────────────────────────────────

function MobileCard<T>({
  columns,
  row,
  actions,
  keyExtractor,
}: {
  columns: Column<T>[];
  row: T;
  actions?: ActionConfig<T>;
  keyExtractor: (row: T) => string;
}) {
  const visibleColumns = columns.filter((c) => !c.hideOnMobile);
  const hasImage = columns.some((c) => c.type === "image");

  // Heuristic mapping: find title, secondary, tertiary columns
  const titleCol = visibleColumns.find(
    (c) => c.type === "text" && c.fontWeight === "bold"
  );
  const badgeCol = visibleColumns.find((c) => c.type === "badge");
  const imageCol = columns.find((c) => c.type === "image");
  const usedKeys = new Set([
    titleCol?.key,
    badgeCol?.key,
    imageCol?.key,
  ].filter(Boolean));

  const secondaryCols = visibleColumns.filter(
    (c) =>
      !usedKeys.has(c.key) &&
      (c.type === "currency" || c.type === "count")
  );
  const tertiaryCols = visibleColumns.filter(
    (c) =>
      !usedKeys.has(c.key) &&
      !secondaryCols.includes(c) &&
      (c.type === "date" || c.type === "monospace")
  );
  const remainingCols = visibleColumns.filter(
    (c) =>
      !usedKeys.has(c.key) &&
      !secondaryCols.includes(c) &&
      !tertiaryCols.includes(c) &&
      c.type !== "image"
  );

  return (
    <div
      key={keyExtractor(row)}
      className="border-b last:border-b-0 p-4 flex flex-col gap-2 md:hidden"
    >
      {/* Image (full width top) */}
      {imageCol && (
        <div className="mb-1">
          <CellValue column={imageCol} row={row} />
        </div>
      )}

      {/* Title + Badge row */}
      <div className="flex items-center justify-between gap-2">
        {titleCol && (
          <span className="font-medium truncate">
            {(row as Record<string, unknown>)[titleCol.key] != null
              ? String((row as Record<string, unknown>)[titleCol.key])
              : titleCol.fallback ?? "—"}
          </span>
        )}
        {badgeCol && <CellValue column={badgeCol} row={row} />}
      </div>

      {/* Secondary (currency/count) */}
      {secondaryCols.length > 0 && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {secondaryCols.map((col) => (
            <span key={col.key}>
              <span className="text-xs">{col.header}: </span>
              <CellValue column={col} row={row} />
            </span>
          ))}
        </div>
      )}

      {/* Tertiary (date/monospace) */}
      {tertiaryCols.map((col) => (
        <div key={col.key} className="text-xs text-muted-foreground">
          <span>{col.header}: </span>
          <CellValue column={col} row={row} />
        </div>
      ))}

      {/* Remaining columns */}
      {remainingCols.map((col) => (
        <div key={col.key} className="text-xs text-muted-foreground">
          <span>{col.header}: </span>
          <CellValue column={col} row={row} />
        </div>
      ))}

      {/* Actions */}
      {actions && actions.type !== "none" && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <ActionsCell actions={actions} row={row} />
        </div>
      )}
    </div>
  );
}

// ─── Desktop Row ────────────────────────────────────────────────────────────

function DesktopRow<T>({
  columns,
  row,
  actions,
  rowClassName,
  keyExtractor,
}: {
  columns: Column<T>[];
  row: T;
  actions?: ActionConfig<T>;
  rowClassName?: (row: T) => string;
  keyExtractor: (row: T) => string;
}) {
  const totalCols = columns.length + (actions && actions.type !== "none" ? 1 : 0);

  return (
    <div
      key={keyExtractor(row)}
      className={cn(
        "grid gap-4 px-4 py-3 border-b last:border-b-0 items-center hover:bg-muted/30",
        rowClassName?.(row)
      )}
      style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}
    >
      {columns.map((col) => (
        <div
          key={col.key}
          className={cn(
            "min-w-0 truncate",
            col.align === "right" && "text-right",
            col.align === "center" && "text-center"
          )}
        >
          <CellValue column={col} row={row} />
        </div>
      ))}

      {actions && actions.type !== "none" && (
        <div className="text-right flex justify-end">
          <ActionsCell actions={actions} row={row} />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function DataTable<T>({
  data,
  columns,
  actions,
  header,
  empty,
  rowClassName,
  keyExtractor,
}: DataTableProps<T>) {
  const totalCols = columns.length + (actions && actions.type !== "none" ? 1 : 0);

  return (
    <div>
      {/* Header */}
      {header && (
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{header.title}</h1>
          {header.cta}
        </div>
      )}

      {/* Empty state */}
      {data.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          <p className="text-lg font-medium">
            {empty?.title ?? "Sin datos"}
          </p>
          {empty?.description && (
            <p className="text-sm mt-2">{empty.description}</p>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table (hidden on mobile) */}
          <div className="border rounded-lg overflow-x-auto hidden md:block">
            {/* Header row */}
            <div
              className="grid gap-4 px-4 py-3 border-b bg-muted/50 font-medium text-sm"
              style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className={cn(
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center"
                  )}
                >
                  {col.header}
                </div>
              ))}
              {actions && actions.type !== "none" && (
                <div className="text-right">Acciones</div>
              )}
            </div>

            {/* Data rows */}
            {data.map((row) => (
              <DesktopRow
                key={keyExtractor(row)}
                columns={columns}
                row={row}
                actions={actions}
                rowClassName={rowClassName}
                keyExtractor={keyExtractor}
              />
            ))}
          </div>

          {/* Mobile cards (hidden on desktop) */}
          <div className="border rounded-lg overflow-hidden md:hidden">
            {data.map((row) => (
              <MobileCard
                key={keyExtractor(row)}
                columns={columns}
                row={row}
                actions={actions}
                keyExtractor={keyExtractor}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export type { Column, ActionConfig, DataTableProps };
