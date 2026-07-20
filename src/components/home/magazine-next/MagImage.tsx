// The magazine sections' image wrapper is now the shared one — same behavior,
// plus optional framing. Kept as an alias so the existing call sites in this
// directory don't all need renaming; import FramedImage directly in new code.
export { FramedImage as MagImage, type FramedImageProps } from "@/components/ui/FramedImage";
