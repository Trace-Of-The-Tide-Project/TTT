type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`rounded-md ${className}`}
      style={{
        background:
          "linear-gradient(90deg, var(--tott-dash-surface-inset) 25%, color-mix(in srgb, var(--tott-dash-surface-inset) 60%, var(--tott-card-border)) 50%, var(--tott-dash-surface-inset) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-sweep 1.6s ease-in-out infinite",
      }}
    />
  );
}
