import { Skeleton } from "./Skeleton";
import { ChamferedFrame } from "./ChamferedFrame";

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="relative p-5 space-y-3">
          <ChamferedFrame />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}
