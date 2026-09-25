import { CompactLocation, CompactOverall } from "@/components/locations/compact-summary";
import { FullSummary } from "@/components/locations/full-summary";
import type { SummaryItem } from "@/types/reviews";

interface SummaryCardProps {
  item: SummaryItem;
  selected: boolean;
  onSelect: () => void;
}

/** Both layouts are rendered; CSS shows the compact one below lg and the full one above. */
export function SummaryCard({ item, selected, onSelect }: SummaryCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`h-24 w-full rounded-xl border bg-surface p-3 text-left shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4 lg:h-auto lg:p-4 ${
        selected ? "border-primary ring-1 ring-primary" : "border-border hover:border-muted"
      }`}
    >
      {item.locationId === null ? <CompactOverall item={item} /> : <CompactLocation item={item} />}
      <FullSummary item={item} />
    </button>
  );
}
