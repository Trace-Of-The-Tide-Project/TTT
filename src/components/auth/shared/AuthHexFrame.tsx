type AuthHexFrameProps = {
  children: React.ReactNode;
  /** Optional content pinned to the top of the hex (above the centered body). */
  header?: React.ReactNode;
  className?: string;
  maxWidthClass?: string;
  bodyClassName?: string;
};

const HEX_PATH =
  "M312.972 4.13672C317.388 1.89003 322.612 1.89003 327.028 4.13672L631.029 158.81C636.227 161.454 639.5 166.792 639.5 172.624V542.228C639.5 548.059 636.226 553.397 631.028 556.042L327.028 710.715C322.612 712.962 317.387 712.962 312.971 710.715L8.9707 556.042C3.77324 553.397 0.500114 548.059 0.5 542.228V172.624C0.500143 166.792 3.77403 161.454 8.97168 158.81L312.972 4.13672Z";

const HEX_VIEWBOX_W = 640;
const HEX_VIEWBOX_H = 715;

const DEFAULT_BODY_PADDING = "px-2 min-[500px]:px-4 md:px-6";

/**
 * Auth hex card. The hex element uses `aspect-ratio` so the silhouette is
 * always preserved at every viewport. Width comes from the parent (`w-full`
 * + `max-w-[640px]`); height follows aspect — no `max-h` to clip it. If the
 * resulting hex is taller than the viewport, the page (AuthPageShell, which
 * is `min-h-dvh` + natural flow) scrolls. The safe zone is absolutely
 * positioned with percentage insets so content sits inside the hex outline
 * at every breakpoint.
 */
export function AuthHexFrame({
  children,
  header,
  className,
  maxWidthClass = "max-w-[520px]",
  bodyClassName,
}: AuthHexFrameProps) {
  return (
    <div
      className={`tott-auth-card-shell relative mx-auto w-full ${maxWidthClass} ${className ?? ""}`}
    >
      {/* Mobile header — outside the hex (only when a header is provided). */}
      {header ? (
        <div
          className="mb-4 flex flex-col items-center gap-1 px-2 text-center min-[380px]:gap-1.5 sm:hidden"
        >
          {header}
        </div>
      ) : null}
      <div className="tott-auth-shell-enter relative mx-auto w-full [aspect-ratio:5/6] min-[500px]:[aspect-ratio:6/7] md:[aspect-ratio:640/715]">
        <svg
          aria-hidden
          viewBox={`0 0 ${HEX_VIEWBOX_W} ${HEX_VIEWBOX_H}`}
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <path
            d={HEX_PATH}
            fill="none"
            stroke="var(--tott-auth-hex-outer)"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div
          className={`absolute inset-x-[6%] top-[10%] bottom-[7%] overflow-y-auto min-[500px]:inset-x-[7%] min-[500px]:top-[18%] min-[500px]:bottom-[10%] md:inset-x-[7%] md:top-[20%] md:bottom-[11%] ${bodyClassName ?? DEFAULT_BODY_PADDING}`}
        >
          {header ? (
            // With header: header pinned top (sm+), form fills remaining space.
            <div className="flex min-h-full flex-col">
              <div className="hidden flex-col items-center gap-1.5 pb-3 text-center sm:flex md:gap-2 md:pb-4">
                {header}
              </div>
              <div className="flex flex-1 flex-col gap-2 pt-2 min-[500px]:gap-3 sm:pt-5 md:gap-3.5 md:pt-7">
                {children}
              </div>
            </div>
          ) : (
            // No header: original layout — vertically centered with single gap stack.
            <div className="flex min-h-full flex-col justify-center gap-2 min-[500px]:gap-3 md:gap-3.5">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
