import type { Profile } from '../../types/profile';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { fmt, fmtShort } from '../../utils/format';

type Props = {
  profile: Profile;
  onEdit: (step: number) => void;
  onConfirm: () => void;
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-2 border-b border-stone-100 last:border-0">
      <span className="text-stone-600 text-sm">{label}</span>
      <span className="font-medium text-stone-800 text-sm text-right max-w-[55%]">{value}</span>
    </div>
  );
}

function Section({ title, step, onEdit, children }: {
  title: string;
  step: number;
  onEdit: (s: number) => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-stone-800">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="text-sm text-brand-700 hover:underline"
        >
          Edit
        </button>
      </div>
      {children}
    </Card>
  );
}

export function ReviewScreen({ profile, onEdit, onConfirm }: Props) {
  const p = profile.person;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">Review Your Information</h2>
        <p className="text-stone-500">
          Please check everything below. If something looks wrong, tap "Edit" to fix it.
        </p>
      </div>

      <Section title="About Them" step={0} onEdit={onEdit}>
        {p.ageDad && <Row label="Father's age" value={`${p.ageDad} years`} />}
        {p.ageMom && <Row label="Mother's age" value={`${p.ageMom} years`} />}
        {p.city && <Row label="City" value={p.city} />}
        <Row label="Retirement status" value={
          p.retirementStage === 'about_to_retire'
            ? `Retiring soon${p.expectedRetirementYear ? ` (${p.expectedRetirementYear})` : ''}`
            : 'Already retired'
        } />
      </Section>

      {profile.retirementBenefits.length > 0 && (
        <Section title="Retirement Lump Sums" step={1} onEdit={onEdit}>
          {profile.retirementBenefits.map(b => (
            <Row
              key={b.id}
              label={b.label ?? b.kind}
              value={`${fmtShort(b.amount)} (${b.employmentType === 'government' ? 'Govt' : 'Non-govt'})`}
            />
          ))}
          <Row
            label="Total (gross)"
            value={fmtShort(profile.retirementBenefits.reduce((s, b) => s + b.amount, 0))}
          />
        </Section>
      )}

      {profile.mutualFunds.length > 0 && (
        <Section title="Mutual Funds" step={2} onEdit={onEdit}>
          {profile.mutualFunds.map(f => (
            <Row key={f.id} label={f.label || f.category} value={fmtShort(f.currentValue)} />
          ))}
          <Row
            label="Total current value"
            value={fmtShort(profile.mutualFunds.reduce((s, f) => s + f.currentValue, 0))}
          />
        </Section>
      )}

      {profile.fixedIncome.length > 0 && (
        <Section title="Fixed Deposits & Schemes" step={3} onEdit={onEdit}>
          {profile.fixedIncome.map(fi => (
            <Row
              key={fi.id}
              label={`${fi.label ?? fi.kind.toUpperCase()}${fi.ratePct ? ` @ ${fi.ratePct}%` : ''}`}
              value={fmtShort(fi.amount)}
            />
          ))}
          <Row
            label="Total"
            value={fmtShort(profile.fixedIncome.reduce((s, fi) => s + fi.amount, 0))}
          />
        </Section>
      )}

      {profile.income.length > 0 && (
        <Section title="Monthly Income" step={4} onEdit={onEdit}>
          {profile.income.map(src => (
            <Row
              key={src.id}
              label={src.label ?? src.kind}
              value={`${fmt(src.monthlyAmount)}/month`}
            />
          ))}
          <Row
            label="Total monthly income"
            value={`${fmt(profile.income.reduce((s, i) => s + i.monthlyAmount, 0))}/month`}
          />
        </Section>
      )}

      <Section title="Expenses & Cash" step={5} onEdit={onEdit}>
        <Row label="Monthly expenses" value={`${fmt(profile.monthlyExpenses)}/month`} />
        {(profile.cash.savingsBalance ?? 0) > 0 && (
          <Row label="Savings balance" value={fmtShort(profile.cash.savingsBalance ?? 0)} />
        )}
        <Row
          label="Health insurance"
          value={profile.health.insured
            ? `Yes — ${fmtShort(profile.health.sumInsured ?? 0)} cover`
            : 'Not insured'}
        />
      </Section>

      <div className="pt-4">
        <Button onClick={onConfirm} className="w-full text-lg py-4">
          Calculate My Retirement Picture →
        </Button>
        <p className="text-center text-xs text-stone-400 mt-3">
          This is for information only. Not financial or tax advice. Consult a CA for important decisions.
        </p>
      </div>
    </div>
  );
}
