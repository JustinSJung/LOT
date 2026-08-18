interface PairTripleListProps {
  entries: [string, number][];
  onEntryClick?: (key: string) => void;
}

export function PairTripleList({ entries, onEntryClick }: PairTripleListProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-neutral-500">데이터가 부족합니다.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {entries.map(([key, count]) => (
        <button
          key={key}
          type="button"
          onClick={() => onEntryClick?.(key)}
          className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-left text-sm hover:border-neutral-600"
        >
          <span className="font-medium text-neutral-200">{key.split("-").join(" · ")}</span>
          <span className="text-xs text-neutral-500">{count}회</span>
        </button>
      ))}
    </div>
  );
}
