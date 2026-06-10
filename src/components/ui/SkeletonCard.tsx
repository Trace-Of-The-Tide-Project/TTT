import { Skeleton } from "./Skeleton";
import { ChamferedFrame } from "./ChamferedFrame";

export function SkeletonCard() {
  return (
    <div className="relative my-4 mx-auto px-10 pb-12 max-w-4xl">
      <ChamferedFrame />
      <div className="p-5 space-y-4">
        <Skeleton className="h-5 w-1/3" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}
