import { useState } from 'react';
import type { PartialProfile, RetirementBenefit, RetirementBenefitKind, EmploymentType } from '../../../types/profile';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

type Props = {
  profile: PartialProfile;
  onChange: (updates: PartialProfile) => void;
};

type BenefitMeta = {
  kind: RetirementBenefitKind;
  label: string;
  hint: string;
  emoji: string;
};

const BENEFIT_TYPES: BenefitMeta[] = [
  { kind: 'gratuity',         label: 'Gratuity (ग्रेच्युटी)',          hint: 'Lump sum for long service',           emoji: '🎁' },
  { kind: 'epf',              label: 'EPF / PF Corpus',                  hint: 'Employees\' Provident Fund',          emoji: '🏦' },
  { kind: 'leave_encashment', label: 'Leave Encashment (छुट्टी भुगतान)', hint: 'Payment for unused leave',            emoji: '📅' },
  { kind: 'nps_lumpsum',      label: 'NPS Corpus (पेंशन प्रणाली)',       hint: 'National Pension System balance',     emoji: '📊' },
  { kind: 'commuted_pension', label: 'Commuted Pension',                 hint: 'Lump sum from pension surrender',     emoji: '💰' },
  { kind: 'gpf',              label: 'GPF (सामान्य भविष्य निधि)',        hint: 'General Provident Fund (govt only)',  emoji: '🏛️' },
  { kind: 'vrs',              label: 'VRS Compensation',                 hint: 'Voluntary Retirement Scheme',         emoji: '✍️' },
  { kind: 'superannuation',   label: 'Superannuation Fund',              hint: 'Employer superannuation scheme',      emoji: '📋' },
  { kind: 'other',            label: 'Other Benefit',                    hint: 'Any other one-time payout',           emoji: '➕' },
];

function newBenefit(kind: RetirementBenefitKind): RetirementBenefit {
  return {
    id: `rb-${Date.now()}`,
    kind,
    amount: 0,
    employmentType: 'non_government',
    status: 'expected',
  };
}

export function RetirementBenefitsStep({ profile, onChange }: Props) {
  const benefits = profile.retirementBenefits ?? [];
  const [adding, setAdding] = useState(false);

  function update(id: string, patch: Partial<RetirementBenefit>) {
    onChange({
      retirementBenefits: benefits.map(b => b.id === id ? { ...b, ...patch } : b),
    });
  }

  function remove(id: string) {
    onChange({ retirementBenefits: benefits.filter(b => b.id !== id) });
  }

  function add(kind: RetirementBenefitKind) {
    onChange({ retirementBenefits: [...benefits, newBenefit(kind)] });
    setAdding(false);
  }

  const meta = (kind: RetirementBenefitKind) =>
    BENEFIT_TYPES.find(t => t.kind === kind) ?? BENEFIT_TYPES[BENEFIT_TYPES.length - 1];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">
          Retirement Lump Sums <span className="text-stone-400 font-normal text-base">(एकमुश्त राशि)</span>
        </h2>
        <p className="text-stone-500">
          What one-time amounts will be received when retiring?
          These are the big payouts — add each one separately.
        </p>
      </div>

      {benefits.length === 0 && (
        <div className="text-center py-8 text-stone-400 border-2 border-dashed border-stone-200 rounded-2xl">
          <p className="text-3xl mb-2">💼</p>
          <p>No benefits added yet. Tap "Add a benefit" below.</p>
        </div>
      )}

      <div className="space-y-4">
        {benefits.map(b => {
          const m = meta(b.kind);
          return (
            <Card key={b.id} accent="teal" className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800">
                  {m.emoji} {m.label}
                </span>
                <button
                  type="button"
                  onClick={() => remove(b.id)}
                  className="text-stone-400 hover:text-red-500 transition-colors text-sm"
                  aria-label="Remove"
                >
                  Remove
                </button>
              </div>

              <Input
                label={<>Expected amount <span className="text-stone-400 font-normal text-sm">(राशि)</span></>}
                type="number"
                prefix="₹"
                min={0}
                placeholder="e.g. 2000000"
                value={b.amount || ''}
                onChange={e => update(b.id, { amount: parseFloat(e.target.value) || 0 })}
                hint="Enter the full gross amount before any tax"
              />

              <div className="space-y-2">
                <p className="field-label text-sm">Type of employment (नौकरी का प्रकार)</p>
                <div className="flex gap-3">
                  {(['government', 'non_government'] as EmploymentType[]).map(et => (
                    <button
                      key={et}
                      type="button"
                      onClick={() => update(b.id, { employmentType: et })}
                      className={`btn flex-1 text-sm ${
                        b.employmentType === et ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {et === 'government' ? '🏛️ Government' : '🏢 Private / PSU'}
                    </button>
                  ))}
                </div>
              </div>

              {(b.kind === 'epf' || b.kind === 'gpf' || b.kind === 'gratuity' || b.kind === 'vrs') && (
                <Input
                  label="Years of service"
                  type="number"
                  min={1}
                  max={50}
                  placeholder="e.g. 32"
                  value={b.yearsOfService ?? ''}
                  onChange={e => update(b.id, { yearsOfService: e.target.value ? parseInt(e.target.value) : undefined })}
                  hint="Total years worked at this employer"
                />
              )}

              {b.kind === 'commuted_pension' && b.employmentType === 'non_government' && (
                <div className="space-y-2">
                  <p className="field-label text-sm">Does he also receive Gratuity?</p>
                  <p className="field-hint">This changes how much of the commuted pension is tax-free</p>
                  <div className="flex gap-3">
                    {[{ label: 'Yes', value: true }, { label: 'No', value: false }].map(opt => (
                      <button
                        key={String(opt.value)}
                        type="button"
                        onClick={() => update(b.id, { receivesGratuity: opt.value })}
                        className={`btn flex-1 text-sm ${
                          b.receivesGratuity === opt.value ? 'btn-primary' : 'btn-secondary'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {adding ? (
        <Card className="space-y-3">
          <p className="font-semibold text-stone-700">Choose the type of benefit:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BENEFIT_TYPES.map(t => (
              <button
                key={t.kind}
                type="button"
                onClick={() => add(t.kind)}
                className="btn btn-secondary text-left justify-start gap-2 text-sm"
              >
                <span>{t.emoji}</span>
                <div>
                  <div className="font-medium">{t.label}</div>
                  <div className="text-xs text-stone-400">{t.hint}</div>
                </div>
              </button>
            ))}
          </div>
          <Button variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
        </Card>
      ) : (
        <Button variant="secondary" onClick={() => setAdding(true)} className="w-full">
          + Add a benefit
        </Button>
      )}
    </div>
  );
}
