import type { PartialProfile } from '../../../types/profile';
import { Input } from '../../ui/Input';
import { Card } from '../../ui/Card';

type Props = {
  profile: PartialProfile;
  onChange: (updates: PartialProfile) => void;
};

const CURRENT_YEAR = new Date().getFullYear();

export function AboutYou({ profile, onChange }: Props) {
  const p = profile.person ?? {};

  function set(key: string, value: unknown) {
    onChange({ person: { ...p, [key]: value } });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">
          About Your Parents
        </h2>
        <p className="text-stone-500">
          Just a few basics. Every field is optional — skip anything you're unsure about.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Input
          label={<>Father's current age <span className="text-stone-400 font-normal text-sm">(पिताजी की उम्र)</span></>}
          type="number"
          min={40}
          max={100}
          placeholder="e.g. 60"
          value={p.ageDad ?? ''}
          onChange={e => set('ageDad', e.target.value ? parseInt(e.target.value) : undefined)}
        />
        <Input
          label={<>Mother's current age <span className="text-stone-400 font-normal text-sm">(माताजी की उम्र)</span></>}
          type="number"
          min={40}
          max={100}
          placeholder="e.g. 57"
          value={p.ageMom ?? ''}
          onChange={e => set('ageMom', e.target.value ? parseInt(e.target.value) : undefined)}
        />
      </div>

      <Input
        label="City (optional)"
        type="text"
        placeholder="e.g. Pune, Delhi, Mumbai"
        value={p.city ?? ''}
        onChange={e => set('city', e.target.value || undefined)}
        hint="Helps with local cost-of-living context"
      />

      <div className="space-y-3">
        <p className="field-label">
          Has your father retired yet? <span className="text-stone-400 font-normal text-sm">(क्या रिटायर हो चुके हैं?)</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Card
            className={`flex-1 cursor-pointer border-2 transition-colors ${
              p.retirementStage === 'about_to_retire'
                ? 'border-brand-600 bg-brand-50'
                : 'border-stone-200 hover:border-brand-300'
            }`}
            onClick={() => set('retirementStage', 'about_to_retire')}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <div>
                <p className="font-semibold">Retiring soon</p>
                <p className="text-sm text-stone-500">The big payout is still coming</p>
              </div>
            </div>
          </Card>
          <Card
            className={`flex-1 cursor-pointer border-2 transition-colors ${
              p.retirementStage === 'already_retired'
                ? 'border-brand-600 bg-brand-50'
                : 'border-stone-200 hover:border-brand-300'
            }`}
            onClick={() => set('retirementStage', 'already_retired')}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold">Already retired</p>
                <p className="text-sm text-stone-500">Money has been received / deployed</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {p.retirementStage === 'about_to_retire' && (
        <div className="space-y-3">
          <p className="field-label">When do you expect retirement?</p>
          <div className="flex flex-wrap gap-3">
            {[CURRENT_YEAR, CURRENT_YEAR + 1, CURRENT_YEAR + 2, CURRENT_YEAR + 3].map(yr => (
              <button
                key={yr}
                type="button"
                onClick={() => set('expectedRetirementYear', yr)}
                className={`btn min-w-[100px] ${
                  p.expectedRetirementYear === yr ? 'btn-primary' : 'btn-secondary'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
