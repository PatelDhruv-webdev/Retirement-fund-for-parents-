import { useState, useCallback } from 'react';
import type { Profile, PartialProfile } from '../../types/profile';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { AboutYou } from './steps/AboutYou';
import { RetirementBenefitsStep } from './steps/RetirementBenefits';
import { MutualFundsStep } from './steps/MutualFunds';
import { StocksSharesStep } from './steps/StocksShares';
import { FixedIncomeStep } from './steps/FixedIncome';
import { PensionIncomeStep } from './steps/PensionIncome';
import { ExpensesStep } from './steps/Expenses';
import { RiskAppetiteStep } from './steps/RiskAppetite';
import { ReviewScreen } from './ReviewScreen';

type Props = {
  initial: PartialProfile;
  onComplete: (profile: Profile) => void;
};

const STEPS = [
  { title: 'About Them',          short: 'About'    },
  { title: 'Retirement Benefits', short: 'Benefits' },
  { title: 'Mutual Funds',        short: 'MFs'      },
  { title: 'Stocks & Shares',     short: 'Stocks'   },
  { title: 'Fixed Deposits',      short: 'FDs'      },
  { title: 'Pension & Income',    short: 'Income'   },
  { title: 'Expenses & Health',   short: 'Expenses' },
  { title: 'Investment Approach', short: 'Risk'     },
];

const REVIEW_STEP = STEPS.length;

function toProfile(partial: PartialProfile): Profile {
  return {
    person: {
      retirementStage: 'about_to_retire',
      ...partial.person,
    },
    income: partial.income ?? [],
    retirementBenefits: partial.retirementBenefits ?? [],
    mutualFunds: partial.mutualFunds ?? [],
    policies: partial.policies ?? [],
    fixedIncome: partial.fixedIncome ?? [],
    cash: partial.cash ?? {},
    gold: partial.gold ?? {},
    property: partial.property ?? [],
    loans: partial.loans ?? [],
    monthlyExpenses: partial.monthlyExpenses ?? 0,
    health: partial.health ?? { insured: false },
    riskAppetite: partial.riskAppetite ?? 'conservative',
  };
}

export function FormWizard({ initial, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<PartialProfile>(initial);

  const update = useCallback((updates: PartialProfile) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, []);

  function next() { if (step < REVIEW_STEP) setStep(s => s + 1); }
  function back() { if (step > 0) setStep(s => s - 1); }

  function renderStep() {
    switch (step) {
      case 0: return <AboutYou profile={profile} onChange={update} />;
      case 1: return <RetirementBenefitsStep profile={profile} onChange={update} />;
      case 2: return <MutualFundsStep profile={profile} onChange={update} />;
      case 3: return <StocksSharesStep profile={profile} onChange={update} />;
      case 4: return <FixedIncomeStep profile={profile} onChange={update} />;
      case 5: return <PensionIncomeStep profile={profile} onChange={update} />;
      case 6: return <ExpensesStep profile={profile} onChange={update} />;
      case 7: return <RiskAppetiteStep profile={profile} onChange={update} />;
      case REVIEW_STEP:
        return (
          <ReviewScreen
            profile={toProfile(profile)}
            onEdit={setStep}
            onConfirm={() => onComplete(toProfile(profile))}
          />
        );
      default: return null;
    }
  }

  const isReview = step === REVIEW_STEP;
  const currentStepTitle = STEPS[step]?.title ?? 'Review';

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-4 no-print">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="section-label">Retirement Clarity</p>
              <p className="font-bold text-stone-900 text-lg leading-tight">{currentStepTitle}</p>
            </div>
            {!isReview && (
              <span className="text-sm text-stone-400 shrink-0 mt-1">
                Step {step + 1} of {STEPS.length}
              </span>
            )}
          </div>
          {!isReview && (
            <ProgressBar
              current={step + 1}
              total={STEPS.length + 1}
              label={`Step ${step + 1} of ${STEPS.length + 1}`}
            />
          )}
        </div>
      </header>

      {/* Step content */}
      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">{renderStep()}</div>
      </main>

      {/* Navigation footer */}
      {!isReview && (
        <footer className="bg-white border-t border-stone-200 px-4 py-4 no-print">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              {step > 0 && (
                <Button variant="ghost" onClick={back} className="flex-1">Back</Button>
              )}
              <Button onClick={next} className={step === 0 ? 'w-full' : 'flex-[2]'}>
                {step === STEPS.length - 1 ? 'Review answers' : 'Continue'}
              </Button>
            </div>
            {step > 1 && (
              <p className="text-center text-xs text-stone-400 mt-2">
                All fields are optional — skip anything you're unsure about
              </p>
            )}
          </div>
        </footer>
      )}
    </div>
  );
}
