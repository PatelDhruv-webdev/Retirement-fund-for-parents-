// Data model — mirrors the intake questionnaire.
// Every field is optional; "I don't know" is always valid.
// FY 2026-27 context (India).

export type RetirementStage = 'about_to_retire' | 'already_retired';

export type Person = {
  ageDad?: number;
  ageMom?: number;
  city?: string;
  dependents?: number;
  retirementStage: RetirementStage;
  expectedRetirementYear?: number;
};

export type IncomeKind =
  | 'pension_govt'
  | 'pension_private'
  | 'rent'
  | 'nps_annuity'
  | 'other';

export type IncomeSource = {
  id: string;
  kind: IncomeKind;
  label?: string;
  monthlyAmount: number;
  taxable: boolean;
};

export type RetirementBenefitKind =
  | 'gratuity'
  | 'leave_encashment'
  | 'commuted_pension'
  | 'epf'
  | 'gpf'
  | 'nps_lumpsum'
  | 'vrs'
  | 'superannuation'
  | 'other';

export type EmploymentType = 'government' | 'non_government';
export type BenefitStatus = 'expected' | 'received_and_deployed';

export type RetirementBenefit = {
  id: string;
  kind: RetirementBenefitKind;
  label?: string;
  amount: number;
  employmentType: EmploymentType;
  status: BenefitStatus;
  yearsOfService?: number;
  receivesGratuity?: boolean; // for commuted_pension: 1/3 vs 1/2 exempt
};

export type FundCategory =
  | 'equity'
  | 'debt'
  | 'hybrid'
  | 'gold_etf'
  | 'gold_fof'
  | 'stock'    // direct equity shares — same CG rules as equity MF
  | 'unknown';

export type FundMode = 'sip' | 'lumpsum';

export type MutualFund = {
  id: string;
  label: string;
  category: FundCategory;
  mode: FundMode;
  monthlyAmount?: number;
  investedTotal?: number;
  currentValue: number;
  startDate?: string;       // ISO date string, e.g. "2022-01-01"
  dividendMonthly?: number; // monthly dividend / distribution income (taxable at slab)
};

export type PolicyType =
  | 'endowment'
  | 'money_back'
  | 'term'
  | 'ulip'
  | 'pension_annuity'
  | 'unknown';

export type Policy = {
  id: string;
  type: PolicyType;
  label?: string;
  sumAssured?: number;
  annualPremium?: number;
  yearsLeftToPay?: number;
  maturityYear?: number;
  maturityAmount?: number;
  surrenderValue?: number;
};

export type FixedIncomeKind =
  | 'fd'
  | 'scss'
  | 'pomis'
  | 'ppf'
  | 'nsc'
  | 'kvp'
  | 'other';

export type PayoutFrequency = 'monthly' | 'quarterly' | 'cumulative' | 'na';

export type FixedIncome = {
  id: string;
  kind: FixedIncomeKind;
  label?: string;
  amount: number;
  ratePct?: number;
  maturityDate?: string;
  payout: PayoutFrequency;
};

export type PropertyUse = 'self_occupied' | 'rented';

export type Property = {
  id: string;
  use: PropertyUse;
  estimatedValue?: number;
  monthlyRent?: number;
  loanOutstanding?: number;
};

export type LoanKind = 'home' | 'personal' | 'other';

export type Loan = {
  id: string;
  kind: LoanKind;
  outstanding: number;
  monthlyEmi: number;
};

export type GoldForm = 'jewellery' | 'coins' | 'etf_bonds';

export type HealthCover = {
  insured: boolean;
  sumInsured?: number;
  annualPremium?: number;
};

export type RiskAppetite = 'conservative' | 'moderate' | 'aggressive';

export type Profile = {
  person: Person;
  income: IncomeSource[];
  retirementBenefits: RetirementBenefit[];
  mutualFunds: MutualFund[];
  policies: Policy[];
  fixedIncome: FixedIncome[];
  cash: {
    savingsBalance?: number;
    idleCash?: number;
  };
  gold: {
    grams?: number;
    estimatedValue?: number;
    form?: GoldForm;
  };
  property: Property[];
  loans: Loan[];
  monthlyExpenses: number;
  health: HealthCover;
  riskAppetite?: RiskAppetite;
};

export type PartialProfile = Partial<Omit<Profile, 'person'>> & {
  person?: Partial<Person>;
};
