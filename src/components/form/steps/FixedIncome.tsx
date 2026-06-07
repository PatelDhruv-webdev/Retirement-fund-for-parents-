import { useState } from 'react';
import type { PartialProfile, FixedIncome, FixedIncomeKind, PayoutFrequency } from '../../../types/profile';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { SCSS_RATE_PCT, POMIS_RATE_PCT, PPF_RATE_PCT } from '../../../engine/constants';

type Props = {
  profile: PartialProfile;
  onChange: (updates: PartialProfile) => void;
};

type FIMeta = {
  kind: FixedIncomeKind;
  label: string;
  hint: string;
  emoji: string;
  defaultRate?: number;
  defaultPayout?: PayoutFrequency;
};

const FI_TYPES: FIMeta[] = [
  { kind: 'scss',  label: 'SCSS (वरिष्ठ नागरिक बचत)',    hint: `8.2% — Post Office / bank, quarterly`,  emoji: '🏪', defaultRate: SCSS_RATE_PCT, defaultPayout: 'quarterly' },
  { kind: 'pomis', label: 'POMIS (मासिक आय योजना)',       hint: `7.4% — Post Office monthly income`,      emoji: '📮', defaultRate: POMIS_RATE_PCT, defaultPayout: 'monthly' },
  { kind: 'fd',    label: 'Fixed Deposit (FD)',             hint: 'Bank FD — enter your rate',              emoji: '🏦', defaultPayout: 'monthly' },
  { kind: 'ppf',   label: 'PPF (सार्वजनिक भविष्य निधि)', hint: `7.1% — tax-free, can be withdrawn`,      emoji: '💚', defaultRate: PPF_RATE_PCT, defaultPayout: 'cumulative' },
  { kind: 'nsc',   label: 'NSC',                            hint: '7.7% — 5-year certificate',             emoji: '📜', defaultPayout: 'cumulative' },
  { kind: 'kvp',   label: 'KVP (किसान विकास पत्र)',        hint: '7.5% — doubles in ~9.6 years',           emoji: '🌱', defaultPayout: 'cumulative' },
  { kind: 'other', label: 'Other',                          hint: 'Any other fixed-income investment',      emoji: '➕' },
];

function newFI(meta: FIMeta): FixedIncome {
  return {
    id: `fi-${Date.now()}`,
    kind: meta.kind,
    amount: 0,
    ratePct: meta.defaultRate,
    payout: meta.defaultPayout ?? 'monthly',
  };
}

const PAYOUT_OPTIONS: { value: PayoutFrequency; label: string }[] = [
  { value: 'monthly',     label: 'Monthly' },
  { value: 'quarterly',   label: 'Quarterly' },
  { value: 'cumulative',  label: 'On maturity' },
];

export function FixedIncomeStep({ profile, onChange }: Props) {
  const items = profile.fixedIncome ?? [];
  const [choosingKind, setChoosingKind] = useState(false);

  function update(id: string, patch: Partial<FixedIncome>) {
    onChange({ fixedIncome: items.map(f => f.id === id ? { ...f, ...patch } : f) });
  }

  function remove(id: string) {
    onChange({ fixedIncome: items.filter(f => f.id !== id) });
  }

  function add(meta: FIMeta) {
    onChange({ fixedIncome: [...items, newFI(meta)] });
    setChoosingKind(false);
  }

  const label = (kind: FixedIncomeKind) => FI_TYPES.find(t => t.kind === kind);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">
          Fixed Deposits &amp; Savings Schemes
        </h2>
        <p className="text-stone-500">
          Add each FD, SCSS, POMIS, PPF, etc. separately. These form the steady income layer.
        </p>
      </div>

      {items.length === 0 && !choosingKind && (
        <div className="text-center py-8 text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl">
          <p className="text-3xl mb-2">🏦</p>
          <p>No fixed-income items yet. Add FDs, SCSS, POMIS etc. here.</p>
        </div>
      )}

      <div className="space-y-4">
        {items.map(fi => {
          const m = label(fi.kind);
          return (
            <Card key={fi.id} accent="blue" className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-stone-700">
                  {m?.emoji ?? '🏦'} {m?.label ?? fi.kind.toUpperCase()}
                </span>
                <button type="button" onClick={() => remove(fi.id)} className="text-sm text-stone-400 hover:text-red-500">
                  Remove
                </button>
              </div>

              <Input
                label={<>Amount invested <span className="text-stone-400 font-normal text-xs">(निवेश राशि)</span></>}
                type="number"
                prefix="₹"
                placeholder="e.g. 500000"
                value={fi.amount || ''}
                onChange={e => update(fi.id, { amount: parseFloat(e.target.value) || 0 })}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label={<>Interest rate % <span className="text-stone-400 font-normal text-xs">(optional)</span></>}
                  type="number"
                  step="0.1"
                  min={0}
                  max={20}
                  suffix="% p.a."
                  placeholder={String(m?.defaultRate ?? '')}
                  value={fi.ratePct ?? ''}
                  onChange={e => update(fi.id, { ratePct: parseFloat(e.target.value) || undefined })}
                />
                <Input
                  label={<>Maturity date <span className="text-stone-400 font-normal text-xs">(optional)</span></>}
                  type="month"
                  value={fi.maturityDate ? fi.maturityDate.slice(0, 7) : ''}
                  onChange={e => update(fi.id, { maturityDate: e.target.value ? `${e.target.value}-01` : undefined })}
                />
              </div>

              <div className="space-y-2">
                <p className="field-label text-sm">When does the interest get paid?</p>
                <div className="flex flex-wrap gap-2">
                  {PAYOUT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update(fi.id, { payout: opt.value })}
                      className={`btn text-sm px-4 py-2 ${fi.payout === opt.value ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {choosingKind ? (
        <Card className="space-y-3">
          <p className="font-semibold text-stone-700">What type of investment?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FI_TYPES.map(t => (
              <button
                key={t.kind}
                type="button"
                onClick={() => add(t)}
                className="btn btn-secondary text-left justify-start gap-2 text-sm"
              >
                <span className="text-xl">{t.emoji}</span>
                <div>
                  <div className="font-medium">{t.label}</div>
                  <div className="text-xs text-stone-400">{t.hint}</div>
                </div>
              </button>
            ))}
          </div>
          <Button variant="ghost" onClick={() => setChoosingKind(false)}>Cancel</Button>
        </Card>
      ) : (
        <Button variant="secondary" onClick={() => setChoosingKind(true)} className="w-full">
          + Add a fixed-income investment
        </Button>
      )}
    </div>
  );
}
