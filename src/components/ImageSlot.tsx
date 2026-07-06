interface ImageSlotProps {
  className?: string;
  rounded?: string;
}

export function ImageSlot({ className = "", rounded = "rounded-2xl" }: ImageSlotProps) {
  return (
    <div
      className={`${rounded} ${className} bg-card-alt border border-white/[0.06] flex items-center justify-center`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="#5a5a60" strokeWidth="1.6" />
        <circle cx="8.5" cy="10" r="1.5" fill="#5a5a60" />
        <path d="M4 16.5 8.5 12l3 3 3.5-4 5 5.5" stroke="#5a5a60" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
