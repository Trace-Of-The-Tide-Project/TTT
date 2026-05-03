const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Section / flow title */
export function HeadingIcon() {
  return (
    <svg {...iconProps} viewBox="0 0 24 24">
      <path d="M6 4h12M6 12h8M6 20h12" strokeWidth={2.2} />
      <path d="M4 4v16" strokeWidth={2.2} />
    </svg>
  );
}

export function FileTextIcon() {
  return (
    <svg {...iconProps}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

/** Double quote "99" for Quote block */
export function QuoteIcon() {
  return (
    <svg {...iconProps} viewBox="0 0 24 24">
      <path d="M3 12c0-2 2-4 5-4v2c-2 0-3 1.5-3 2.5 0 1 1 2 2 2 2 0 4-1 4-4v-1H8c-2 0-5-2-5-5z" />
      <path d="M15 12c0-2 2-4 5-4v2c-2 0-3 1.5-3 2.5 0 1 1 2 2 2 2 0 4-1 4-4v-1h-3c-2 0-5-2-5-5z" />
    </svg>
  );
}

/** Landscape/image placeholder */
export function ImageIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

/** Multiple overlapping frames for Gallery */
export function GalleryIcon() {
  return (
    <svg {...iconProps} viewBox="0 0 24 24">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="5" width="8" height="8" rx="1" />
      <rect x="5" y="13" width="8" height="8" rx="1" />
    </svg>
  );
}

export function StarIcon() {
  return (
    <svg {...iconProps}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function GridIcon() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function TagIcon() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

export function GlobeIcon() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function EyeIcon() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function MoreDotsIcon() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** 6-dot grid for reorder/drag */
export function GripIcon() {
  return (
    <svg {...iconProps} width={16} height={16} viewBox="0 0 24 24">
      <circle cx="9" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CopyIcon() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function CameraIcon() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export function SaveIcon() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

/** Status icon — document with three lines (Figma source). */
export function StatusFieldIcon() {
  return (
    <svg
      width="18"
      height="14"
      viewBox="0 0 28 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M9.83333 7.21875H18.1667M9.83333 10.5H18.1667M9.83333 13.7813H18.1667M6.5 5.57813C6.5 5.143 6.67559 4.7257 6.98816 4.41803C7.30072 4.11035 7.72464 3.9375 8.16667 3.9375H19.8333C20.2754 3.9375 20.6993 4.11035 21.0118 4.41803C21.3244 4.7257 21.5 5.143 21.5 5.57813V15.4219C21.5 15.857 21.3244 16.2743 21.0118 16.582C20.6993 16.8896 20.2754 17.0625 19.8333 17.0625H8.16667C7.72464 17.0625 7.30072 16.8896 6.98816 16.582C6.67559 16.2743 6.5 15.857 6.5 15.4219V5.57813Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Category icon — three squares + circle in a 2×2 grid (Figma source). */
export function CategoryFieldIcon() {
  return (
    <svg
      width="18"
      height="16"
      viewBox="0 0 28 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M7.33301 5.33398H12.333V10.334H7.33301V5.33398Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.6663 5.33398H20.6663V10.334H15.6663V5.33398Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.33301 13.6673H12.333V18.6673H7.33301V13.6673Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.6663 16.1673C15.6663 16.8304 15.9297 17.4662 16.3986 17.9351C16.8674 18.4039 17.5033 18.6673 18.1663 18.6673C18.8294 18.6673 19.4653 18.4039 19.9341 17.9351C20.4029 17.4662 20.6663 16.8304 20.6663 16.1673C20.6663 15.5043 20.4029 14.8684 19.9341 14.3996C19.4653 13.9307 18.8294 13.6673 18.1663 13.6673C17.5033 13.6673 16.8674 13.9307 16.3986 14.3996C15.9297 14.8684 15.6663 15.5043 15.6663 16.1673Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Tag/luggage-tag icon (Figma source). */
export function TagFieldIcon() {
  return (
    <svg
      width="18"
      height="14"
      viewBox="0 0 28 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M9.41667 7.55599C9.41667 7.75245 9.50446 7.94086 9.66074 8.07977C9.81702 8.21869 10.029 8.29673 10.25 8.29673C10.471 8.29673 10.683 8.21869 10.8393 8.07977C10.9955 7.94086 11.0833 7.75245 11.0833 7.55599C11.0833 7.35953 10.9955 7.17112 10.8393 7.03221C10.683 6.89329 10.471 6.81525 10.25 6.81525C10.029 6.81525 9.81702 6.89329 9.66074 7.03221C9.50446 7.17112 9.41667 7.35953 9.41667 7.55599Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 6.44488V10.276C6.50009 10.6689 6.67575 11.0456 6.98833 11.3234L13.4133 17.0345C13.79 17.3692 14.3007 17.5573 14.8333 17.5573C15.3659 17.5573 15.8767 17.3692 16.2533 17.0345L20.9133 12.8923C21.2899 12.5575 21.5015 12.1035 21.5015 11.6301C21.5015 11.1566 21.2899 10.7026 20.9133 10.3678L14.4883 4.65673C14.1758 4.37888 13.752 4.22274 13.31 4.22266H9C8.33696 4.22266 7.70107 4.45678 7.23223 4.87353C6.76339 5.29028 6.5 5.85551 6.5 6.44488Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg {...iconProps} width={16} height={16}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}
