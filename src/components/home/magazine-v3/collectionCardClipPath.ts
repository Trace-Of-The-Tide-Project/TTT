/**
 * Collection card hex silhouette (Figma `Collection Card` mask, native
 * 276×444.432). NOT the same shape as `TOTT_AUTH_HEX_CLIP_PATH`, which was
 * tuned for a squarer auth-card box and distorts into a tall lozenge at this
 * card's aspect ratio (0.616). Points converted directly from the Figma mask
 * SVG path's corner vertices (rounded-corner arcs approximated by their
 * straight-segment endpoints, since clip-path polygon() has no curves).
 */
export const V3_COLLECTION_HEX_CLIP_PATH =
  "polygon(47.47% 0.36%, 52.53% 0.36%, 96.73% 13.68%, 100% 16.92%, 100% 83.08%, 96.73% 86.32%, 52.53% 99.64%, 47.47% 99.64%, 3.27% 86.32%, 0% 83.08%, 0% 16.92%, 3.27% 13.68%)";
