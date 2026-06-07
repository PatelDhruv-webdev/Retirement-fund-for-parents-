import { useState } from 'react';
import type { PartialProfile, MutualFund, FundMode } from '../../../types/profile';

const MODES: Array<{ value: FundMode; label: string }> = [
  { value: 'lumpsum', label: 'One-time purchase' },
  { value: 'sip', label: 'Monthly SIP via broker' },
];
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Expandable } from '../../ui/Expandable';

type Props = {
  profile: PartialProfile;
  onChange: (updates: PartialProfile) => void;
};

function newStock(): MutualFund {
  return {
    id: `stk-${Date.now()}`,
    label: '',
    category: 'stock',
    mode: 'lumpsum',
    currentValue: 0,
  };
}

export function StocksSharesStep({ profile, onChange }: Props) {
  const allFunds = profile.mutualFunds ?? [];
  const stocks = allFunds.filter(f => f.category === 'stock');

  function update(id: string, patch: Partial<MutualFund>) {
    onChange({
      mutualFunds: allFunds.map(f => f.id === id ? { ...f, ...patch } : f),
    });
  }

  function remove(id: string) {
    onChange({ mutualFunds: allFunds.filter(f => f.id !== id) });
  }

  function add() {
    onChange({ mutualFunds: [...allFunds, newStock()] });
    setAdding(false);
  }

  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">
          Direct Stocks &amp; Shares <span className="text-stone-400 font-normal text-base">(शेयर)</span>
        </h2>
        <p className="text-stone-500">
          If your parents buy company shares directly through a Demat account or broker
          (Zerodha, ICICI Direct, etc.) — add them here.
          Mutual funds go in the previous step.
        </p>
      </div>

      <Expandable title="📚 Tax on stocks — what you need to know" variant="tax">
        <p className="font-semibold">Same rules as equity mutual funds:</p>
        <ul className="list-disc pl-4 space-y-1 mt-1">
          <li>
            <strong>LTCG (Long Term Capital Gains / दीर्घकालिक पूंजी लाभ)</strong> — sold after holding for <strong>more than 12 months</strong>:
            tax = 12.5% on gains above ₹1.25 lakh per year. Below ₹1.25L — <strong>zero tax</strong>.
          </li>
          <li>
            <strong>STCG (Short Term Capital Gains / अल्पकालिक पूंजी लाभ)</strong> — sold within 12 months:
            tax = 20% on the entire gain.
          </li>
          <li>
            <strong>Dividends (लाभांश)</strong> — fully taxable at your income-tax slab rate (e.g. 5%, 10%, 20%).
          </li>
          <li>
            4% Health &amp; Education cess is added to all tax amounts.
          </li>
        </ul>
        <p className="mt-2 text-xs text-blue-600">
          Strategy tip: If gains are below ₹1.25L/year, you pay <strong>zero LTCG tax</strong> on equity.
          Consider "harvesting" gains each March to use the annual exemption.
        </p>
      </Expandable>

      {stocks.length === 0 && !adding && (
        <div className="text-center py-8 text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl">
          <p className="text-3xl mb-2">📊</p>
          <p>No stocks entered yet.</p>
          <p className="text-sm mt-1">If your parents only have mutual funds, skip this step.</p>
        </div>
      )}

      <div className="space-y-4">
        {stocks.map(s => (
          <Card key={s.id} accent="teal" className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-stone-700">📊 {s.label || 'Stock holding'}</span>
              <button type="button" onClick={() => remove(s.id)} className="text-sm text-stone-400 hover:text-red-500">
                Remove
              </button>
            </div>

            <Input
              label="Company name / stock"
              placeholder="e.g. Reliance Industries, TCS, SBI"
              value={s.label}
              onChange={e => update(s.id, { label: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Current market value today"
                type="number"
                prefix="₹"
                placeholder="Check your broker app"
                value={s.currentValue || ''}
                onChange={e => update(s.id, { currentValue: parseFloat(e.target.value) || 0 })}
                hint="Total value at today's price"
              />
              <Input
                label={<>Total amount invested <span className="text-stone-400 font-normal text-xs">(optional)</span></>}
                type="number"
                prefix="₹"
                placeholder="What you paid for it"
                value={s.investedTotal ?? ''}
                onChange={e => update(s.id, { investedTotal: parseFloat(e.target.value) || undefined })}
                hint="Needed for accurate tax calculation"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={<>Purchase date <span className="text-stone-400 font-normal text-xs">(approx.)</span></>}
                type="month"
                value={s.startDate ? s.startDate.slice(0, 7) : ''}
                onChange={e => update(s.id, { startDate: e.target.value ? `${e.target.value}-01` : undefined })}
                hint="Determines LTCG vs STCG (12-month rule)"
              />
              <Input
                label={<>Monthly dividend received <span className="text-stone-400 font-normal text-xs">(if any)</span></>}
                type="number"
                prefix="₹"
                suffix="/month"
                placeholder="0"
                value={s.dividendMonthly ?? ''}
                onChange={e => update(s.id, { dividendMonthly: parseFloat(e.target.value) || undefined })}
                hint="Taxed at your income-slab rate"
              />
            </div>

            <div className="space-y-2">
              <p className="field-label text-sm">How do you buy shares?</p>
              <div className="flex gap-3">
                {MODES.map(m => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => update(s.id, { mode: m.value })}
                    className={`btn flex-1 text-sm ${s.mode === m.value ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {adding ? (
        <div className="flex gap-3">
          <Button onClick={add} className="flex-1">Add this stock</Button>
          <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
        </div>
      ) : (
        <Button variant="secondary" onClick={() => setAdding(true)} className="w-full">
          + Add a stock holding
        </Button>
      )}
    </div>
  );
}
