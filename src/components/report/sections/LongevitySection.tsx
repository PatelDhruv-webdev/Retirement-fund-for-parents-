import type { Insights } from '../../../types/insights';
import { Card } from '../../ui/Card';

type Props = { insights: Insights };

export function LongevitySection({ insights }: Props) {
  const { longevity } = insights;

  function renderPerson(result: typeof longevity.dad, name: string) {
    if (!result) return null;
    const isOutlasts = result.ageAtDepletion === 'outlasts_120';
    const yearsLeft = isOutlasts ? null : (result.ageAtDepletion as number) - result.currentAge;

    return (
      <Card
        key={name}
        accent={isOutlasts ? 'green' : (yearsLeft ?? 0) > 25 ? 'teal' : 'amber'}
        className="text-center"
      >
        <p className="text-stone-500 text-sm mb-2">{name}</p>
        <p className="text-3xl font-bold mb-2">
          {isOutlasts ? '120+' : result.ageAtDepletion}
        </p>
        <p className="text-sm font-medium text-stone-700">
          {isOutlasts
            ? 'Money outlasts to 120+ years'
            : `Money lasts until age ${result.ageAtDepletion}`}
        </p>
        {!isOutlasts && yearsLeft !== null && (
          <p className="text-xs text-stone-400 mt-1">
            {yearsLeft} years from now
          </p>
        )}
        {isOutlasts && (
          <p className="text-green-700 text-xs mt-2 font-medium">
            Corpus never depletes ✓
          </p>
        )}
      </Card>
    );
  }

  const hasBoth = longevity.dad && longevity.mom;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">
          How Long Will the Money Last?
        </h2>
        <p className="text-stone-500 text-sm">
          At {longevity.assumedReturnRatePct}% portfolio return and {longevity.assumedInflationRatePct}% inflation —
          conservative Indian planning assumptions.
        </p>
      </div>

      <div className={`grid gap-4 ${hasBoth ? 'grid-cols-2' : 'grid-cols-1 max-w-xs mx-auto'}`}>
        {renderPerson(longevity.dad, 'Father')}
        {renderPerson(longevity.mom, 'Mother')}
      </div>

      <div className="bg-stone-50 rounded-xl p-4 text-sm text-stone-600">
        <strong>How this is calculated:</strong> Monthly surplus income reduces corpus withdrawals.
        If expenses exceed income, corpus is drawn down each month. Growth rate minus inflation
        gives the real return, accounting for the rising cost of living.
      </div>
    </div>
  );
}
