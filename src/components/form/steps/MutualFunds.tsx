import { useState } from 'react';
import type { PartialProfile, MutualFund, FundCategory, FundMode } from '../../../types/profile';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

type Props = {
  profile: PartialProfile;
  onChange: (updates: PartialProfile) => void;
};

const CATEGORIES: { value: FundCategory; label: string; hint: string }[] = [
  { value: 'equity',    label: 'Equity Fund',        hint: 'Stocks — HDFC, SBI, Mirae etc.' },
  { value: 'hybrid',    label: 'Hybrid / Balanced',  hint: 'Mix of stocks and bonds' },
  { value: 'debt',      label: 'Debt Fund',           hint: 'Bonds / short-term' },
  { value: 'gold_etf',  label: 'Gold ETF',            hint: 'Exchange-traded gold' },
  { value: 'gold_fof',  label: 'Gold Fund of Fund',   hint: 'Gold ETF through MF' },
  { value: 'unknown',   label: "I'm not sure",        hint: 'We\'ll assume equity' },
];

function newFund(): MutualFund {
  return {
    id: `mf-${Date.now()}`,
    label: '',
    category: 'equity',
    mode: 'lumpsum',
    currentValue: 0,
  };
}

export function MutualFundsStep({ profile, onChange }: Props) {
  const funds = profile.mutualFunds ?? [];
  const [adding, setAdding] = useState(false);

  function update(id: string, patch: Partial<MutualFund>) {
    onChange({ mutualFunds: funds.map(f => f.id === id ? { ...f, ...patch } : f) });
  }

  function remove(id: string) {
    onChange({ mutualFunds: funds.filter(f => f.id !== id) });
  }

  function add() {
    onChange({ mutualFunds: [...funds, newFund()] });
    setAdding(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">
          Mutual Funds &amp; SIPs <span className="text-stone-400 font-normal text-base">(म्यूचुअल फंड)</span>
        </h2>
        <p className="text-stone-500">
          Add each mutual fund separately. Check your phone's mutual fund app or bank statement.
          "I don't know" is fine for any field — just add the current value.
        </p>
      </div>

      {funds.length === 0 && !adding && (
        <div className="text-center py-8 text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl">
          <p className="text-3xl mb-2">📈</p>
          <p>No mutual funds yet. Tap "Add a fund" if you have any.</p>
        </div>
      )}

      <div className="space-y-4">
        {funds.map(f => (
          <Card key={f.id} accent="teal" className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-stone-700">📈 {f.label || 'Mutual Fund'}</span>
              <button type="button" onClick={() => remove(f.id)} className="text-sm text-stone-400 hover:text-red-500">
                Remove
              </button>
            </div>

            <Input
              label="Fund name or description"
              placeholder="e.g. HDFC Flexi Cap, or just 'equity fund'"
              value={f.label}
              onChange={e => update(f.id, { label: e.target.value })}
            />

            <div className="space-y-2">
              <p className="field-label text-sm">What type of fund is this?</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => update(f.id, { category: c.value })}
                    className={`btn text-sm px-3 py-2 ${f.category === c.value ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="field-label text-sm">How do you invest?</p>
              <div className="flex gap-3">
                {([{ value: 'sip', label: 'Monthly SIP' }, { value: 'lumpsum', label: 'One-time / Lumpsum' }] as { value: FundMode; label: string }[]).map(m => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => update(f.id, { mode: m.value })}
                    className={`btn flex-1 text-sm ${f.mode === m.value ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {f.mode === 'sip' && (
              <Input
                label="Monthly SIP amount (प्रति माह)"
                type="number"
                prefix="₹"
                placeholder="e.g. 5000"
                value={f.monthlyAmount ?? ''}
                onChange={e => update(f.id, { monthlyAmount: parseFloat(e.target.value) || undefined })}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Current value today"
                type="number"
                prefix="₹"
                placeholder="Check your fund app"
                value={f.currentValue || ''}
                onChange={e => update(f.id, { currentValue: parseFloat(e.target.value) || 0 })}
              />
              <Input
                label={<>Total invested <span className="text-stone-400 font-normal text-xs">(optional)</span></>}
                type="number"
                prefix="₹"
                placeholder="Total amount put in"
                value={f.investedTotal ?? ''}
                onChange={e => update(f.id, { investedTotal: parseFloat(e.target.value) || undefined })}
                hint="Needed for accurate tax calculation"
              />
            </div>

            <Input
              label={<>Start date <span className="text-stone-400 font-normal text-xs">(optional)</span></>}
              type="month"
              value={f.startDate ? f.startDate.slice(0, 7) : ''}
              onChange={e => update(f.id, { startDate: e.target.value ? `${e.target.value}-01` : undefined })}
              hint="Approximate month you started — needed to calculate long-term vs short-term gains"
            />
          </Card>
        ))}
      </div>

      {adding ? (
        <div className="flex gap-3">
          <Button onClick={add} className="flex-1">Add this fund</Button>
          <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
        </div>
      ) : (
        <Button variant="secondary" onClick={() => setAdding(true)} className="w-full">
          + Add a mutual fund
        </Button>
      )}
    </div>
  );
}
