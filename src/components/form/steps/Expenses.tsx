import type { PartialProfile } from '../../../types/profile';
import { Input } from '../../ui/Input';
import { Card } from '../../ui/Card';

type Props = {
  profile: PartialProfile;
  onChange: (updates: PartialProfile) => void;
};

const EXPENSE_BUCKETS = [
  { label: 'Groceries & household',  emoji: '🛒', placeholder: '15,000' },
  { label: 'Medicines & health',      emoji: '💊', placeholder: '5,000'  },
  { label: 'Utilities (electricity, phone, etc.)', emoji: '💡', placeholder: '3,000' },
  { label: 'Travel & outings',        emoji: '🚗', placeholder: '5,000'  },
  { label: 'Religious & social',      emoji: '🙏', placeholder: '3,000'  },
  { label: 'Clothing & personal',     emoji: '👗', placeholder: '2,000'  },
];

export function ExpensesStep({ profile, onChange }: Props) {
  const monthly = profile.monthlyExpenses ?? 0;

  // Health cover fields
  const health = profile.health ?? { insured: false };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">
          Monthly Expenses &amp; Health Cover
        </h2>
        <p className="text-stone-500">
          How much does the family spend each month? This is the most important number
          for planning — a rough estimate is perfectly fine.
        </p>
      </div>

      <div className="space-y-3">
        <Input
          label={<>Total monthly spending <span className="text-stone-400 font-normal text-sm">(मासिक खर्च)</span></>}
          type="number"
          prefix="₹"
          suffix="/month"
          placeholder="e.g. 55000"
          value={monthly || ''}
          onChange={e => onChange({ monthlyExpenses: parseFloat(e.target.value) || 0 })}
          hint="Include all regular spending — groceries, utilities, medicines, travel, etc."
        />

        <Card className="bg-stone-50 border-stone-200">
          <p className="text-sm font-medium text-stone-600 mb-3">
            Rough breakdown to help you estimate:
          </p>
          <div className="grid grid-cols-2 gap-y-2 text-sm text-stone-500">
            {EXPENSE_BUCKETS.map(b => (
              <div key={b.label} className="flex items-center gap-2">
                <span>{b.emoji}</span>
                <span>{b.label}: ≈ ₹{b.placeholder}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-stone-800">
          Health Insurance <span className="text-stone-400 font-normal text-base">(स्वास्थ्य बीमा)</span>
        </h3>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="has-health"
            checked={health.insured}
            onChange={e => onChange({ health: { ...health, insured: e.target.checked } })}
            className="w-5 h-5 accent-brand-600"
          />
          <label htmlFor="has-health" className="font-medium text-stone-700">
            Yes, we have health insurance
          </label>
        </div>

        {health.insured && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-8">
            <Input
              label="Sum insured (कवर राशि)"
              type="number"
              prefix="₹"
              placeholder="e.g. 1000000"
              value={health.sumInsured ?? ''}
              onChange={e => onChange({
                health: { ...health, sumInsured: parseFloat(e.target.value) || undefined },
              })}
            />
            <Input
              label={<>Annual premium <span className="text-stone-400 font-normal text-xs">(optional)</span></>}
              type="number"
              prefix="₹"
              suffix="/year"
              placeholder="e.g. 28000"
              value={health.annualPremium ?? ''}
              onChange={e => onChange({
                health: { ...health, annualPremium: parseFloat(e.target.value) || undefined },
              })}
            />
          </div>
        )}

        {!health.insured && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <strong>Important:</strong> A senior-citizen health policy (₹10–15 lakh) is strongly
            recommended. Medical costs can wipe out savings without cover.
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-stone-800">
          Cash &amp; Savings <span className="text-stone-400 font-normal text-base">(बचत)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Savings account balance"
            type="number"
            prefix="₹"
            placeholder="e.g. 300000"
            value={profile.cash?.savingsBalance ?? ''}
            onChange={e => onChange({
              cash: { ...profile.cash, savingsBalance: parseFloat(e.target.value) || undefined },
            })}
          />
          <Input
            label={<>Cash at home / elsewhere <span className="text-stone-400 font-normal text-xs">(optional)</span></>}
            type="number"
            prefix="₹"
            placeholder="e.g. 50000"
            value={profile.cash?.idleCash ?? ''}
            onChange={e => onChange({
              cash: { ...profile.cash, idleCash: parseFloat(e.target.value) || undefined },
            })}
          />
        </div>
      </div>
    </div>
  );
}
