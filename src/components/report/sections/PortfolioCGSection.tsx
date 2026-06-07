import type { PortfolioCGSummary } from '../../../types/insights';
import { fmt, fmtShort, fmtSmart } from '../../../utils/format';
import { Card } from '../../ui/Card';
import { Expandable } from '../../ui/Expandable';

type Props = { data: PortfolioCGSummary };

const CATEGORY_LABELS: Record<string, string> = {
  equity:   'Equity Fund',
  hybrid:   'Hybrid Fund',
  debt:     'Debt Fund',
  gold_etf: 'Gold ETF',
  gold_fof: 'Gold FoF',
  stock:    'Direct Stock',
  unknown:  'Fund',
};

export function PortfolioCGSection({ data }: Props) {
  if (data.lines.length === 0) return null;

  const hasGains = data.totalUnrealisedGain.gt(0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">
          Capital Gains — Full Portfolio View
        </h2>
        <p className="text-stone-500 text-sm">
          If everything was sold today, here's the tax picture. You don't have to sell — this is just
          so you know what tax would apply.
        </p>
      </div>

      {/* Tax education */}
      <Expandable title="📚 What is Capital Gains Tax? (पूंजी लाभ कर)" variant="tax">
        <div className="space-y-3">
          <div>
            <p className="font-semibold mb-1">LTCG — Long Term Capital Gains (दीर्घकालिक पूंजी लाभ)</p>
            <p>When you sell equity/stocks/hybrid funds held for <strong>more than 12 months</strong>:</p>
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              <li>First ₹1,25,000 of profit per year → <strong>zero tax</strong> (annual exemption)</li>
              <li>Profit above ₹1.25 lakh → taxed at <strong>12.5%</strong></li>
              <li>+ 4% cess on the tax amount</li>
            </ul>
            <p className="text-xs mt-1 text-blue-600">
              Example: You bought shares for ₹5L, sold for ₹8L (profit ₹3L, held 2 years).
              Taxable gain = ₹3L − ₹1.25L = ₹1.75L. Tax = ₹1.75L × 12.5% = ₹21,875 + cess.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">STCG — Short Term Capital Gains (अल्पकालिक पूंजी लाभ)</p>
            <p>Sold within <strong>12 months</strong> of purchase:</p>
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              <li>Entire profit taxed at <strong>20%</strong> — no exemption</li>
              <li>+ 4% cess</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-1">Debt Funds (डेट फंड)</p>
            <p>Gain is added to your regular income and taxed at your <strong>income-slab rate</strong> (5%, 10%, 20%, etc.) — regardless of how long you held it.</p>
          </div>
          <p className="text-xs text-stone-500 border-t border-blue-200 pt-2 mt-2">
            These rules apply for FY 2026-27 under the new income tax regime. Consult a CA for your exact liability.
          </p>
        </div>
      </Expandable>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="text-center py-4">
          <p className="text-xs text-stone-400 mb-1">Total value today</p>
          <p className="font-bold text-stone-800">{fmtShort(data.totalCurrentValue)}</p>
        </Card>
        <Card className="text-center py-4">
          <p className="text-xs text-stone-400 mb-1">Total invested</p>
          <p className="font-bold text-stone-600">{fmtShort(data.totalInvested)}</p>
        </Card>
        <Card className={`text-center py-4 ${hasGains ? 'bg-green-50' : ''}`}>
          <p className="text-xs text-stone-400 mb-1">Unrealised gain</p>
          <p className={`font-bold ${hasGains ? 'text-green-700' : 'text-stone-600'}`}>
            {fmtShort(data.totalUnrealisedGain)}
          </p>
        </Card>
        <Card className="text-center py-4 bg-amber-50">
          <p className="text-xs text-stone-400 mb-1">Est. tax if sold now</p>
          <p className="font-bold text-amber-700">{fmtShort(data.totalEstimatedTax)}</p>
          {data.ltcgExemptApplied.gt(0) && (
            <p className="text-xs text-green-700 mt-0.5">₹{fmtShort(data.ltcgExemptApplied)} exempt used</p>
          )}
        </Card>
      </div>

      {data.totalSlabRateGain.gt(0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          <strong>+ Slab-rate gains:</strong> {fmtSmart(data.totalSlabRateGain)} from debt funds will be
          added to regular income and taxed at your income-slab rate (not shown in the tax above).
        </div>
      )}

      {data.totalDividendAnnual.gt(0) && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
          <strong>Dividend income:</strong> {fmt(data.totalDividendAnnual)}/year from stocks/funds —
          taxable at your income-slab rate. Already included in your annual tax calculation above.
        </div>
      )}

      {/* Per-fund breakdown */}
      <Card>
        <h3 className="font-semibold text-stone-800 mb-4">Per holding (if sold today)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 text-left">
                <th className="pb-2 pr-3 font-medium">Fund / Stock</th>
                <th className="pb-2 pr-3 font-medium text-right">Value</th>
                <th className="pb-2 pr-3 font-medium text-right">Gain</th>
                <th className="pb-2 pr-3 font-medium text-right">Held</th>
                <th className="pb-2 font-medium text-right">Est. Tax</th>
              </tr>
            </thead>
            <tbody>
              {data.lines.map(line => (
                <tr key={line.id} className="border-b border-stone-50 last:border-0">
                  <td className="py-2.5 pr-3">
                    <p className="font-medium text-stone-800 leading-tight">{line.label}</p>
                    <p className="text-xs text-stone-400">{CATEGORY_LABELS[line.category] ?? line.category}</p>
                  </td>
                  <td className="py-2.5 pr-3 text-right text-stone-700">{fmtShort(line.currentValue)}</td>
                  <td className={`py-2.5 pr-3 text-right font-medium ${line.unrealisedGain.gt(0) ? 'text-green-700' : 'text-stone-500'}`}>
                    {line.unrealisedGain.gt(0) ? `+${fmtShort(line.unrealisedGain)}` : '—'}
                  </td>
                  <td className="py-2.5 pr-3 text-right text-stone-500 text-xs">
                    {line.holdingMonths ? `${line.holdingMonths}m` : '—'}
                  </td>
                  <td className="py-2.5 text-right">
                    {line.estimatedTax.gt(0) ? (
                      <span className="text-amber-700 font-medium">{fmt(line.estimatedTax)}</span>
                    ) : line.slabRateGain.gt(0) ? (
                      <span className="text-blue-600">slab rate</span>
                    ) : (
                      <span className="text-green-600 font-medium">NIL ✓</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.ltcgExemptApplied.gt(0) && (
          <p className="text-xs text-stone-400 mt-3 border-t border-stone-100 pt-3">
            ₹1.25 lakh annual LTCG exemption applied across all equity holdings.
            Remaining exemption for this FY: {fmtShort(
              new (data.ltcgExemptApplied.constructor as typeof import('decimal.js').default)(125_000).minus(data.ltcgExemptApplied),
            )} (if any).
          </p>
        )}
      </Card>

      <Expandable title="💡 Smart tax tip — LTCG harvesting">
        <p>
          If total equity gains are below ₹1.25 lakh this financial year, you pay <strong>zero LTCG tax</strong>.
          Every March, consider selling enough equity to "book" up to ₹1.25 lakh of gains — and buying the same
          funds back. This resets your cost basis and uses the annual exemption, reducing future tax.
          This is called <em>tax-loss/gain harvesting</em>.
        </p>
        <p className="mt-2 text-xs text-stone-400">
          Note: This applies to equity MFs and stocks. Debt funds are always taxed at slab rate.
        </p>
      </Expandable>
    </div>
  );
}
