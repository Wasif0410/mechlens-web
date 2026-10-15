/** The MechLens mark (a viewfinder with a lit centre) and name. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 20 20" className="size-[18px]" aria-hidden="true">
        <path d="M1 6V1h5M14 1h5v5M19 14v5h-5M6 19H1v-5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <rect x="7" y="7" width="6" height="6" className="fill-signal" />
      </svg>
      <span className="text-[17px] font-medium tracking-[-0.02em]">MechLens</span>
    </span>
  );
}
