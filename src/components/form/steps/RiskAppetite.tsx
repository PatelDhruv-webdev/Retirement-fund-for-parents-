import type { PartialProfile, RiskAppetite } from '../../../types/profile';
import { Card } from '../../ui/Card';

type Props = {
  profile: PartialProfile;
  onChange: (updates: PartialProfile) => void;
};

type Option = {
  value: RiskAppetite;
  title: string;
  titleHindi: string;
  emoji: string;
  description: string;
  suited: string;
  color: string;
  selectedColor: string;
};

const OPTIONS: Option[] = [
  {
    value: 'conservative',
    title: 'Conservative',
    titleHindi: 'सुरक्षित',
    emoji: '🛡️',
    description: 'Safety first. Put most of the money in SCSS, FDs, and POMIS. Lower returns but zero worry.',
    suited: 'Best for: Parents who want guaranteed monthly income and sleep well at night.',
    color: 'border-stone-200 hover:border-green-300',
    selectedColor: 'border-green-500 bg-green-50',
  },
  {
    value: 'moderate',
    title: 'Moderate',
    titleHindi: 'संतुलित',
    emoji: '⚖️',
    description: 'A balance between safe income and long-term growth. Mix of FDs/SCSS and some balanced mutual funds.',
    suited: 'Best for: Parents who want income now but also want to grow wealth for 10+ years.',
    color: 'border-stone-200 hover:border-blue-300',
    selectedColor: 'border-blue-500 bg-blue-50',
  },
  {
    value: 'aggressive',
    title: 'Aggressive',
    titleHindi: 'विकासोन्मुख',
    emoji: '🚀',
    description: 'Higher equity allocation for higher long-term growth. More ups and downs — requires patience.',
    suited: 'Best for: Parents who are comfortable with market fluctuations and have a 10+ year horizon.',
    color: 'border-stone-200 hover:border-violet-300',
    selectedColor: 'border-violet-500 bg-violet-50',
  },
];

export function RiskAppetiteStep({ profile, onChange }: Props) {
  const current = profile.riskAppetite;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">
          How Should We Invest the Money?
        </h2>
        <p className="text-stone-500">
          This helps us suggest the right mix of investments — from safe bank schemes to mutual funds.
          There is no wrong answer. Choose what feels right.
        </p>
      </div>

      <div className="space-y-4">
        {OPTIONS.map(opt => (
          <Card
            key={opt.value}
            className={`cursor-pointer border-2 transition-all ${
              current === opt.value ? opt.selectedColor : opt.color
            }`}
            onClick={() => onChange({ riskAppetite: opt.value })}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl mt-1 shrink-0">{opt.emoji}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-stone-800 text-lg">{opt.title}</p>
                  <span className="text-stone-400 text-sm">({opt.titleHindi})</span>
                  {current === opt.value && (
                    <span className="ml-auto text-green-600 font-semibold text-sm">✓ Selected</span>
                  )}
                </div>
                <p className="text-stone-600 text-sm mb-2">{opt.description}</p>
                <p className="text-xs text-stone-400 italic">{opt.suited}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!current && (
        <p className="text-sm text-stone-400 text-center">
          If unsure, choose <strong>Conservative</strong> — it's the right choice for most retirees.
        </p>
      )}

      <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm text-stone-600">
        <strong>This is for planning only.</strong> Based on your choice, we will show you
        how to split the retirement corpus — SCSS, POMIS, FDs, and mutual funds — to
        generate the best income while protecting your money.
      </div>
    </div>
  );
}
