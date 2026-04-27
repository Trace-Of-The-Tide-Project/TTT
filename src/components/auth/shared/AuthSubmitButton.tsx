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
 * - **Active**: gold (`#CBA158`) on black text.
 * - **Disabled / loading**: dark grey surface (`#2A2A2A`) with muted label.
 *   Used for resend cooldown timers and any other "wait" states.
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
        "w-full select-none rounded-md py-3 text-sm font-semibold transition-colors",
        inactive
          ? "cursor-not-allowed bg-[#2A2A2A] text-neutral-500"
          : "cursor-pointer bg-[#CBA158] text-black hover:opacity-90",
      ].join(" ")}
    >
      {loading && loadingLabel ? loadingLabel : children}
    </button>
  );
}
