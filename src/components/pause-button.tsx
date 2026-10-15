/** Pause and play for a looping animation, which would otherwise run for as long as it's on screen. */
export function PauseButton({
  paused,
  onToggle,
  label,
  className = "",
}: {
  paused: boolean;
  onToggle: () => void;
  /** What is paused, for the accessible name: "the demo" reads "Pause the demo". */
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${paused ? "Play" : "Pause"} ${label}`}
      className={`flex size-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-night/60 text-bone backdrop-blur-md transition-colors duration-200 hover:border-bone ${className}`}
    >
      <svg viewBox="0 0 12 12" className="size-3" aria-hidden="true">
        {paused ? (
          <path d="M3 1.5v9l7.5-4.5z" fill="currentColor" />
        ) : (
          <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" fill="currentColor" />
        )}
      </svg>
    </button>
  );
}
