import { Skeleton } from "./Skeleton";
import { ChamferedFrame } from "./ChamferedFrame";

type SkeletonTableProps = {
  rows?: number;
  cols?: number;
};

const COL_WIDTHS = ["w-full", "w-5/6", "w-4/5", "w-3/4", "w-2/3", "w-1/2"];

export function SkeletonTable({ rows = 8, cols = 4 }: SkeletonTableProps) {
  return (
    <div className="relative my-4 mx-auto px-10 pb-12 max-w-4xl">
      <ChamferedFrame />
      <div className="p-5 space-y-3">
        <div className="flex gap-3 pb-2 border-b border-[var(--tott-card-border)]">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex gap-3 py-1">
            {Array.from({ length: cols }).map((_, col) => (
              <Skeleton
                key={col}
                className={`h-3 flex-1 ${COL_WIDTHS[(row + col) % COL_WIDTHS.length]}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
