type AuthSubmitButtonProps = {
  children: React.ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  type?: "submit" | "button";
  onClick?: () => void;
};

/**
 * Primary action button for every auth form.
 *
 * - **Active**: gold (`#CBA158`) surface, label color from
 *   `--tott-auth-btn-text` (deep cocoa `#332217`).
 * - **Disabled / loading**: dark grey surface with muted label, used for
 *   resend cooldown timers and other "wait" states.
 */
export function AuthSubmitButton({
  children,
  loading = false,
  loadingLabel,
  disabled = false,
  type = "submit",
  onClick,
}: AuthSubmitButtonProps) {
  const inactive = disabled || loading;

  return (
    <button
      type={type}
      disabled={inactive}
      onClick={onClick}
      className={[
        "tott-auth-submit w-full select-none rounded-md py-2 text-[13px] font-semibold min-[500px]:py-2 min-[500px]:text-sm",
        "transition-[color,background-color,opacity,transform,box-shadow] duration-200 ease-out",
        inactive
          ? "cursor-not-allowed bg-[color:var(--tott-auth-btn-disabled-bg)] text-[color:var(--tott-auth-btn-disabled-text)]"
          : "cursor-pointer bg-[color:var(--tott-accent-gold)] text-[color:var(--tott-auth-btn-text)] hover:brightness-[1.03] active:translate-y-px active:brightness-[0.98]",
      ].join(" ")}
    >
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
