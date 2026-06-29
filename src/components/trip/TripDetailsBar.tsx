import { theme } from "@/lib/theme";

type DetailItem = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

type TripDetailsBarProps = {
  items: DetailItem[];
};

function CalendarIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function GroupIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export const DEFAULT_TRIP_ICONS = {
  calendar: <CalendarIcon />,
  clock: <ClockIcon />,
  group: <GroupIcon />,
  language: <LanguageIcon />,
  location: <LocationIcon />,
};

export function TripDetailsBar({ items }: TripDetailsBarProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border px-6 py-5 sm:flex-nowrap sm:gap-6"
      style={{
        backgroundColor: theme.panelBackground,
        borderColor: theme.cardBorder,
        color: theme.panelForeground,
      }}
    >
      {items.map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-2 text-center">
          <span className="text-[color:var(--tott-home-text-muted)]">{item.icon}</span>
          <div>
            <p className="text-xs text-[color:var(--tott-home-text-muted)]">{item.label}</p>
            <p className="text-sm font-medium text-[color:var(--tott-panel-text)]">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
