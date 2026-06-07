type Props = {
  current: number; // 1-based
  total: number;
  label: string;
};

export function ProgressBar({ current, total, label }: Props) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="w-full" role="progressbar" aria-valuenow={current} aria-valuemin={1} aria-valuemax={total} aria-label={label}>
      {/* Step counter */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-stone-600">{label}</span>
        <span className="text-xs text-stone-400">{current}/{total}</span>
      </div>

      {/* Track */}
      <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-700 rounded-full transition-all duration-400 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
