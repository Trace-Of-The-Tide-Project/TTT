import {
  FileTextIcon,
  MusicIcon,
  CameraIcon,
  PlayIcon,
  MessageSquareIcon,
} from "@/components/ui/icons";
import type { GatewayType } from "./atrium-types";

/**
 * Icon per content room. The shared icons render at a fixed 18px with no
 * size prop, so callers scale them via Tailwind utilities on the wrapping
 * svg (e.g. `[&>svg]:h-12 [&>svg]:w-12`) rather than a size argument.
 */
const ICON_BY_TYPE: Record<GatewayType, () => React.ReactElement> = {
  article: FileTextIcon,
  audio: MusicIcon,
  gallery: CameraIcon,
  video: PlayIcon,
  threads: MessageSquareIcon,
};

/** Render the room's glyph, optionally scaled via `className` on the wrapper. */
export function GatewayIcon({
  type,
  className,
}: {
  type: GatewayType;
  className?: string;
}) {
  const Icon = ICON_BY_TYPE[type];
  return (
    <span aria-hidden className={`inline-flex ${className ?? ""}`}>
      <Icon />
    </span>
  );
}
