import { useState } from 'react';
import type { PartialProfile, IncomeSource, IncomeKind } from '../../../types/profile';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

type Props = {
  profile: PartialProfile;
  onChange: (updates: PartialProfile) => void;
};

const INCOME_TYPES: { kind: IncomeKind; label: string; hint: string; emoji: string; taxable: boolean }[] = [
  { kind: 'pension_govt',    label: 'Government Pension',         hint: 'Central / state govt monthly pension',  emoji: '🏛️', taxable: true  },
  { kind: 'pension_private', label: 'Private / PSU Pension',      hint: 'Company monthly pension',               emoji: '🏢', taxable: true  },
  { kind: 'nps_annuity',    label: 'NPS Annuity',                 hint: 'Monthly annuity from NPS (taxable)',    emoji: '📊', taxable: true  },
  { kind: 'rent',            label: 'Rental Income (किराया)',      hint: 'Rent from house / shop',                emoji: '🏠', taxable: true  },
  { kind: 'other',           label: 'Other Income',               hint: 'Any other regular monthly income',      emoji: '➕', taxable: true  },
];

function newSource(kind: IncomeKind, taxable: boolean): IncomeSource {
  return { id: `inc-${Date.now()}`, kind, monthlyAmount: 0, taxable };
}

export function PensionIncomeStep({ profile, onChange }: Props) {
  const sources = profile.income ?? [];
  const [choosingKind, setChoosingKind] = useState(false);
  const isAboutToRetire = profile.person?.retirementStage === 'about_to_retire';

  function update(id: string, patch: Partial<IncomeSource>) {
    onChange({ income: sources.map(s => s.id === id ? { ...s, ...patch } : s) });
  }

  function remove(id: string) {
    onChange({ income: sources.filter(s => s.id !== id) });
  }

  function add(kind: IncomeKind, taxable: boolean) {
    onChange({ income: [...sources, newSource(kind, taxable)] });
    setChoosingKind(false);
  }

  const meta = (kind: IncomeKind) => INCOME_TYPES.find(t => t.kind === kind);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">
          Pension &amp; Monthly Income <span className="text-stone-400 font-normal text-base">(मासिक आय)</span>
        </h2>
        <p className="text-stone-500">
          {isAboutToRetire
            ? 'Add the pension and other income that will start after retirement.'
            : 'Add all regular monthly income — pension, rent, annuity, etc.'}
        </p>
      </div>

      {isAboutToRetire && (
        <div className="bg-brand-50 border border-brand-200 rounded-xl p-4 text-sm text-brand-800">
          <strong>Note:</strong> Since retirement is upcoming, enter the <em>expected</em> monthly amounts
          that will start after retirement. This helps project your post-retirement cash flow.
        </div>
      )}

      {sources.length === 0 && !choosingKind && (
        <div className="text-center py-8 text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl">
          <p className="text-3xl mb-2">💸</p>
          <p>No income sources added yet. Add pension, rent, etc.</p>
        </div>
      )}

      <div className="space-y-4">
        {sources.map(s => {
          const m = meta(s.kind);
          return (
            <Card key={s.id} accent="green" className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-stone-700">
                  {m?.emoji ?? '💰'} {m?.label ?? 'Income'}
                </span>
                <button type="button" onClick={() => remove(s.id)} className="text-sm text-stone-400 hover:text-red-500">
                  Remove
                </button>
              </div>

              <Input
                label={<>Monthly amount <span className="text-stone-400 font-normal text-sm">(प्रति माह)</span></>}
                type="number"
                prefix="₹"
                suffix="/month"
                placeholder="e.g. 35000"
                value={s.monthlyAmount || ''}
                onChange={e => update(s.id, { monthlyAmount: parseFloat(e.target.value) || 0 })}
              />

              <Input
                label={<>Label <span className="text-stone-400 font-normal text-xs">(optional)</span></>}
                placeholder="e.g. BSNL pension, or House rent"
                value={s.label ?? ''}
                onChange={e => update(s.id, { label: e.target.value || undefined })}
              />

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`taxable-${s.id}`}
                  checked={s.taxable}
                  onChange={e => update(s.id, { taxable: e.target.checked })}
                  className="w-5 h-5 accent-brand-600"
                />
                <label htmlFor={`taxable-${s.id}`} className="text-sm text-stone-700">
                  This income is taxable
                </label>
              </div>
            </Card>
          );
        })}
      </div>

      {choosingKind ? (
        <Card className="space-y-3">
          <p className="font-semibold text-stone-700">What type of income?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {INCOME_TYPES.map(t => (
              <button
                key={t.kind}
                type="button"
                onClick={() => add(t.kind, t.taxable)}
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
          + Add an income source
        </Button>
      )}
    </div>
  );
}
