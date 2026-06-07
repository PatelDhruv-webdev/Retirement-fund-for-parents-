import type { Insights } from '../../../types/insights';
import { fmtSmart, fmtShort } from '../../../utils/format';
import { Card } from '../../ui/Card';

type Props = { insights: Insights };

type BucketDef = {
  key: keyof Insights['buckets'];
  label: string;
  hint: string;
  color: string;
};

const BUCKETS: BucketDef[] = [
  { key: 'safety',         label: 'Safety (सुरक्षा)',      hint: 'Cash & savings — emergency buffer',   color: 'bg-green-500' },
  { key: 'income',         label: 'Income (आय)',           hint: 'FDs, SCSS, POMIS — steady income',    color: 'bg-blue-500'  },
  { key: 'growth',         label: 'Growth (विकास)',        hint: 'Equity & hybrid funds',               color: 'bg-violet-500'},
  { key: 'legacyLifestyle',label: 'Home & Gold',           hint: 'Property, jewellery — not investable',color: 'bg-amber-400' },
];

export function NetWorthSection({ insights }: Props) {
  const { totalNetWorth, investableWealth, buckets } = insights;
  const total = buckets.safety.plus(buckets.income).plus(buckets.growth).plus(buckets.legacyLifestyle);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">
          Your Net Worth
        </h2>
        <p className="text-stone-500 text-sm">Everything you own, minus any debts.</p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-4">
        <Card accent="teal" className="text-center">
          <p className="text-sm text-stone-500 mb-1">Total net worth</p>
          <p className="text-2xl font-bold text-stone-900">{fmtSmart(totalNetWorth)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-sm text-stone-500 mb-1">Investable wealth</p>
          <p className="text-2xl font-bold text-brand-700">{fmtSmart(investableWealth)}</p>
          <p className="text-xs text-stone-400 mt-1">Excluding home & gold</p>
        </Card>
      </div>

      {/* Bucket bar */}
      {total.gt(0) && (
        <Card>
          <h3 className="font-semibold text-stone-700 mb-3">How your wealth is split</h3>
          <div className="flex h-5 rounded-full overflow-hidden mb-4">
            {BUCKETS.map(b => {
              const pct = buckets[b.key].dividedBy(total).times(100).toNumber();
              if (pct < 0.5) return null;
              return (
                <div
                  key={b.key}
                  className={`${b.color} transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${b.label}: ${pct.toFixed(1)}%`}
                />
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {BUCKETS.map(b => {
              const val = buckets[b.key];
              if (val.isZero()) return null;
              const pct = val.dividedBy(total).times(100).toFixed(0);
              return (
                <div key={b.key} className="flex items-start gap-2">
                  <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${b.color}`} />
                  <div>
                    <p className="text-sm font-medium text-stone-800">{b.label}</p>
                    <p className="text-sm text-stone-600">{fmtShort(val)} <span className="text-stone-400">({pct}%)</span></p>
                    <p className="text-xs text-stone-400">{b.hint}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
