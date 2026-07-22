"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface DataTableSkeletonProps {
  columns: number;
  rows?: number;
  hasImage?: boolean;
  hasActions?: boolean;
}

export function DataTableSkeleton({
  columns,
  rows = 5,
  hasImage = false,
  hasActions = false,
}: DataTableSkeletonProps) {
  const totalCols = columns + (hasActions ? 1 : 0);

  return (
    <div>
      {/* Desktop skeleton (hidden on mobile) */}
      <div className="border rounded-lg overflow-hidden hidden md:block">
        {/* Header row */}
        <div
          className="grid gap-4 px-4 py-3 border-b bg-muted/50"
          style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: totalCols }).map((_, i) => (
            <Skeleton key={i} className="h-4" />
          ))}
        </div>

        {/* Data rows */}
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="grid gap-4 px-4 py-3 border-b last:border-b-0 items-center"
            style={{ gridTemplateColumns: `repeat(${totalCols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: totalCols }).map((_, colIdx) => {
              // Image column: render a square skeleton
              if (hasImage && colIdx === 0) {
                return <Skeleton key={colIdx} className="h-10 w-10 rounded" />;
              }
              // Action column: render button-like skeleton
              if (hasActions && colIdx === totalCols - 1) {
                return <Skeleton key={colIdx} className="h-4 w-16 ml-auto" />;
              }
              // Vary widths for realism
              const widths = ["w-20", "w-28", "w-16", "w-24", "w-12", "w-32"];
              return (
                <Skeleton
                  key={colIdx}
                  className={`h-4 ${widths[colIdx % widths.length]}`}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Mobile skeleton (hidden on desktop) */}
      <div className="border rounded-lg overflow-hidden md:hidden">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            className="p-4 border-b last:border-b-0 flex flex-col gap-2"
          >
            {hasImage && <Skeleton className="h-20 w-full rounded" />}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            {hasActions && <Skeleton className="h-4 w-16 mt-1" />}
          </div>
        ))}
      </div>
    </div>
  );
}
