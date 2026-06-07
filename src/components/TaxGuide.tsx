import { useState } from 'react';
import { Card } from './ui/Card';

type Props = {
  onBack: () => void;
};

type SectionId = 'basics' | 'what-taxed' | 'cg-deep' | 'strategies' | 'invest' | 'monthly-income';

const NAV: Array<{ id: SectionId; label: string; emoji: string }> = [
  { id: 'basics',        emoji: '📋', label: 'Income Tax Basics'       },
  { id: 'what-taxed',   emoji: '🔍', label: 'What Gets Taxed?'        },
  { id: 'cg-deep',      emoji: '📈', label: 'Capital Gains'           },
  { id: 'strategies',   emoji: '💡', label: 'Smart Strategies'        },
  { id: 'invest',       emoji: '🏦', label: 'Where to Invest?'        },
  { id: 'monthly-income', emoji: '💸', label: 'Monthly Income Setup'  },
];

export function TaxGuide({ onBack }: Props) {
  const [active, setActive] = useState<SectionId>('basics');

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-brand-800">Tax &amp; Investment Guide</h1>
            <p className="text-xs text-stone-400">FY 2026-27 · New tax regime · Retirement-focused</p>
          </div>
          <button type="button" onClick={onBack} className="btn btn-ghost text-sm">
            ← Back to report
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* Section nav tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {NAV.map(n => (
            <button
              key={n.id}
              type="button"
              onClick={() => setActive(n.id)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                active === n.id
                  ? 'bg-brand-800 text-white'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-brand-400'
              }`}
            >
              {n.emoji} {n.label}
            </button>
          ))}
        </div>

        {/* Section content */}
        <div className="space-y-6">
          {active === 'basics'       && <BasicsSection />}
          {active === 'what-taxed'  && <WhatTaxedSection />}
          {active === 'cg-deep'     && <CGDeepSection />}
          {active === 'strategies'  && <StrategiesSection />}
          {active === 'invest'      && <InvestSection />}
          {active === 'monthly-income' && <MonthlyIncomeSection />}
        </div>

        {/* Next section prompt */}
        {active !== 'monthly-income' && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                const idx = NAV.findIndex(n => n.id === active);
                if (idx < NAV.length - 1) setActive(NAV[idx + 1].id);
              }}
              className="btn btn-secondary text-sm"
            >
              Next: {NAV[NAV.findIndex(n => n.id === active) + 1]?.label} →
            </button>
          </div>
        )}

        {active === 'monthly-income' && (
          <div className="text-center">
            <button type="button" onClick={onBack} className="btn btn-primary text-sm">
              ← Back to my report
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

/* ─── Section 1 — Income Tax Basics ─────────────────────────────────────── */

function BasicsSection() {
  return (
    <div className="space-y-5">
      <SectionHeader
        emoji="📋"
        title="Income Tax Basics"
        subtitle="आयकर की मूल बातें — new regime, FY 2026-27"
      />

      <Card>
        <h3 className="font-semibold text-stone-800 mb-3">New Regime Tax Slabs — FY 2026-27</h3>
        <p className="text-sm text-stone-500 mb-3">
          Since FY 2024-25, the new regime is the <strong>default</strong>. Most retirees benefit from it
          because there are no complicated deduction filings to worry about.
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-stone-400 border-b border-stone-100">
              <th className="pb-2 font-medium">Annual Income</th>
              <th className="pb-2 font-medium text-right">Tax Rate</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Up to ₹4 lakh', '0% — NIL'],
              ['₹4L – ₹8L', '5%'],
              ['₹8L – ₹12L', '10%'],
              ['₹12L – ₹16L', '15%'],
              ['₹16L – ₹20L', '20%'],
              ['₹20L – ₹24L', '25%'],
              ['Above ₹24L', '30%'],
            ].map(([range, rate]) => (
              <tr key={range} className="border-b border-stone-50 last:border-0">
                <td className="py-2 text-stone-700">{range}</td>
                <td className="py-2 text-right font-medium text-stone-800">{rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 pt-3 border-t border-stone-100 space-y-1 text-xs text-stone-500">
          <p><strong>+ 4% cess</strong> (Health &amp; Education Cess) is added on top of all computed tax.</p>
          <p>Example: tax of ₹10,000 → cess ₹400 → total payable ₹10,400.</p>
        </div>
      </Card>

      <Card accent="green">
        <h3 className="font-semibold text-stone-800 mb-2">Standard Deduction — ₹75,000</h3>
        <p className="text-sm text-stone-600">
          If you receive a <strong>pension or salary</strong>, ₹75,000 is automatically deducted from
          your gross income before tax is calculated. You don't need to claim it — it's automatic.
        </p>
        <div className="bg-green-50 rounded-xl p-3 mt-3 text-sm">
          <p className="font-medium text-green-800">Example:</p>
          <p className="text-green-700">
            Pension ₹5,40,000/year → after std deduction ₹4,65,000 taxable → tax = 5% of ₹65,000 = ₹3,250 + cess.
          </p>
        </div>
      </Card>

      <Card accent="blue">
        <h3 className="font-semibold text-stone-800 mb-2">Section 87A Rebate — Zero Tax on Income up to ₹12L</h3>
        <p className="text-sm text-stone-600 mb-2">
          If your total taxable income (after standard deduction) is <strong>₹12 lakh or less</strong>,
          the government gives a full rebate — effectively making your income tax zero.
        </p>
        <p className="text-sm text-stone-600">
          The rebate is: <strong>min(tax computed, ₹60,000)</strong>. So anyone with taxable income ≤ ₹12L
          pays no income tax at all under the new regime.
        </p>
        <div className="bg-blue-50 rounded-xl p-3 mt-3 text-xs text-blue-700">
          <strong>Important:</strong> Capital gains (STCG/LTCG) are taxed separately at flat rates —
          the 87A rebate does NOT apply to special-rate income like LTCG and STCG.
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-stone-800 mb-3">TDS &amp; Form 15H — Avoid Unnecessary Deductions</h3>
        <div className="space-y-3 text-sm text-stone-600">
          <p>
            Banks deduct <strong>TDS (Tax Deducted at Source)</strong> on FD interest, SCSS interest,
            and other payments. If your total income is below the taxable limit, this TDS is
            being deducted unnecessarily.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="font-semibold text-amber-800 mb-1">Form 15H — Submit Every April</p>
            <p className="text-amber-700">
              Senior citizens (60+) whose total income is below the taxable threshold should submit
              <strong> Form 15H</strong> to every bank and post office where they have FDs, SCSS,
              POMIS, or RDs. This instructs them not to deduct TDS.
            </p>
          </div>
          <ul className="list-disc pl-4 space-y-1">
            <li>Submit at the beginning of every financial year (April)</li>
            <li>Submit to every branch separately if FDs are in different branches</li>
            <li>If TDS is already deducted, claim refund by filing ITR (Income Tax Return)</li>
            <li>Form 15G is for those below 60; Form 15H is specifically for senior citizens</li>
          </ul>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-stone-800 mb-3">Old Regime vs New Regime</h3>
        <div className="text-sm text-stone-600 space-y-2">
          <p>
            Under the <strong>old regime</strong>, you could claim deductions (80C, 80D, HRA, etc.)
            to reduce taxable income, but the tax slabs were higher.
          </p>
          <p>
            Under the <strong>new regime</strong> (default from FY 2024-25), you cannot claim most
            deductions, but the slabs are lower and the 87A rebate is larger (₹60K vs ₹12.5K).
          </p>
          <div className="bg-stone-50 rounded-xl p-3 text-xs">
            <p className="font-medium text-stone-700">For most retirees:</p>
            <p className="text-stone-500 mt-1">
              If your total income is below ₹12 lakh, the new regime is almost always better —
              you pay zero tax either way if the 87A rebate applies, but you save the hassle
              of filing deduction proofs.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ─── Section 2 — What Gets Taxed ───────────────────────────────────────── */

function WhatTaxedSection() {
  return (
    <div className="space-y-5">
      <SectionHeader
        emoji="🔍"
        title="What Gets Taxed?"
        subtitle="कौन सी आय पर कर लगता है — complete retiree income map"
      />

      <Card>
        <h3 className="font-semibold text-stone-800 mb-3">Every Income Type — Tax Treatment</h3>
        <div className="space-y-3">
          {[
            {
              category: 'Pension & Salary',
              color: 'bg-orange-50 border-orange-200',
              textColor: 'text-orange-800',
              items: [
                { name: 'Government pension', tax: 'Taxable at slab rate (−₹75K std deduction)' },
                { name: 'Private pension / NPS annuity', tax: 'Taxable at slab rate' },
                { name: 'VRS amount (up to ₹5L)', tax: 'Exempt under Sec 10(10C)' },
                { name: 'Commuted pension (1/3 or 1/2)', tax: 'Exempt under Sec 10(10A)' },
              ],
            },
            {
              category: 'Lump-sum Retirement Payouts',
              color: 'bg-green-50 border-green-200',
              textColor: 'text-green-800',
              items: [
                { name: 'Gratuity (non-govt, up to ₹20L)', tax: 'Exempt under Sec 10(10)' },
                { name: 'Gratuity above ₹20L', tax: 'Taxable at slab rate' },
                { name: 'Leave encashment (up to ₹25L)', tax: 'Exempt under Sec 10(10AA)' },
                { name: 'EPF (after 5 years service)', tax: 'Fully exempt' },
                { name: 'NPS lump-sum (60% of corpus)', tax: 'Fully exempt under Sec 10(12A)' },
                { name: 'NPS annuity (40% of corpus)', tax: 'Annuity income taxable at slab' },
              ],
            },
            {
              category: 'Interest & Fixed Income',
              color: 'bg-blue-50 border-blue-200',
              textColor: 'text-blue-800',
              items: [
                { name: 'FD interest', tax: 'Taxable at slab rate (TDS applies)' },
                { name: 'SCSS interest', tax: 'Taxable at slab rate (TDS if >₹50K/year)' },
                { name: 'POMIS interest', tax: 'Taxable at slab rate' },
                { name: 'PPF interest & maturity', tax: 'Fully exempt (EEE status)' },
                { name: 'Savings account interest (up to ₹50K for 60+)', tax: 'Deduction under Sec 80TTB (old regime only)' },
                { name: 'Bonds interest', tax: 'Taxable at slab rate' },
              ],
            },
            {
              category: 'Investments — Capital Gains',
              color: 'bg-amber-50 border-amber-200',
              textColor: 'text-amber-800',
              items: [
                { name: 'Equity MF / stocks — held >12m (LTCG)', tax: '12.5% (first ₹1.25L/year exempt)' },
                { name: 'Equity MF / stocks — held ≤12m (STCG)', tax: '20% flat, no exemption' },
                { name: 'Debt MF (sold after Apr 2023)', tax: 'Slab rate regardless of holding period' },
                { name: 'Gold ETF — held >12m', tax: '12.5% LTCG' },
                { name: 'Gold FoF — held >24m', tax: '12.5% LTCG' },
                { name: 'Physical gold — held >36m', tax: '20% with indexation' },
              ],
            },
            {
              category: 'Rental & Other',
              color: 'bg-purple-50 border-purple-200',
              textColor: 'text-purple-800',
              items: [
                { name: 'Rental income', tax: 'Taxable at slab, −30% standard deduction on rent' },
                { name: 'Dividends from stocks/MFs', tax: 'Taxable at slab rate (DDT abolished)' },
                { name: 'Self-occupied house', tax: 'No income tax on notional rent' },
              ],
            },
          ].map(group => (
            <div key={group.category} className={`rounded-xl border p-3 ${group.color}`}>
              <p className={`font-semibold text-sm mb-2 ${group.textColor}`}>{group.category}</p>
              <div className="space-y-1">
                {group.items.map(item => (
                  <div key={item.name} className="flex gap-2 text-xs">
                    <span className="text-stone-600 flex-1">{item.name}</span>
                    <span className="text-stone-700 font-medium text-right shrink-0 max-w-[45%]">{item.tax}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ─── Section 3 — Capital Gains Deep Dive ───────────────────────────────── */

function CGDeepSection() {
  return (
    <div className="space-y-5">
      <SectionHeader
        emoji="📈"
        title="Capital Gains — Deep Dive"
        subtitle="पूंजी लाभ कर — worked examples with real numbers"
      />

      <Card accent="green">
        <h3 className="font-semibold text-stone-800 mb-3">Example 1 — LTCG on Equity Fund (Long Term)</h3>
        <div className="text-sm space-y-2 text-stone-600">
          <p><strong>Scenario:</strong> Your father bought HDFC Flexi Cap Fund in 2020. Invested ₹5,00,000. Current value ₹9,00,000. Held for 5 years.</p>
          <div className="bg-green-50 rounded-xl p-3 space-y-1 font-mono text-xs">
            <p>Total gain          = ₹9,00,000 − ₹5,00,000 = <strong>₹4,00,000</strong></p>
            <p>Annual LTCG exempt  = ₹1,25,000</p>
            <p>Taxable LTCG        = ₹4,00,000 − ₹1,25,000 = <strong>₹2,75,000</strong></p>
            <p>Tax @ 12.5%         = ₹2,75,000 × 12.5% = ₹34,375</p>
            <p>Cess @ 4%           = ₹34,375 × 4% = ₹1,375</p>
            <p className="font-bold text-green-700">Total tax payable   = ₹35,750</p>
          </div>
          <p className="text-xs text-stone-400">Key: held &gt;12 months = LTCG. First ₹1.25L gain is always tax-free every year.</p>
        </div>
      </Card>

      <Card accent="amber">
        <h3 className="font-semibold text-stone-800 mb-3">Example 2 — STCG on Equity (Short Term)</h3>
        <div className="text-sm space-y-2 text-stone-600">
          <p><strong>Scenario:</strong> Bought TCS shares in January 2026 for ₹2,00,000. Sold in September 2026 for ₹2,60,000. Held only 8 months.</p>
          <div className="bg-amber-50 rounded-xl p-3 space-y-1 font-mono text-xs">
            <p>Total gain          = ₹2,60,000 − ₹2,00,000 = <strong>₹60,000</strong></p>
            <p>Annual exempt       = ₹0 (STCG has NO exemption)</p>
            <p>Tax @ 20%           = ₹60,000 × 20% = ₹12,000</p>
            <p>Cess @ 4%           = ₹12,000 × 4% = ₹480</p>
            <p className="font-bold text-amber-700">Total tax payable   = ₹12,480</p>
          </div>
          <p className="text-xs text-stone-400">Key: sold within 12 months = STCG. No exemption. 20% flat rate on full gain.</p>
        </div>
      </Card>

      <Card accent="blue">
        <h3 className="font-semibold text-stone-800 mb-3">Example 3 — Debt Fund (Slab-Rate Tax)</h3>
        <div className="text-sm space-y-2 text-stone-600">
          <p><strong>Scenario:</strong> SBI Short Term Debt Fund. Invested ₹5,00,000 in 2021. Current value ₹6,20,000. Held 4 years.</p>
          <div className="bg-blue-50 rounded-xl p-3 space-y-1 font-mono text-xs">
            <p>Total gain          = ₹6,20,000 − ₹5,00,000 = <strong>₹1,20,000</strong></p>
            <p>Tax rule            = added to regular income (post Apr 2023)</p>
            <p>If total taxable income = ₹8L, this ₹1.2L brings it to ₹9.2L</p>
            <p>Extra tax on ₹1.2L @ 10% slab = ₹12,000 + cess</p>
            <p className="font-bold text-blue-700">Effective tax ≈ ₹12,480</p>
          </div>
          <p className="text-xs text-stone-400">Key: debt fund gains go into your "regular income" and are taxed at your income slab. No flat rate, no exemption.</p>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-stone-800 mb-3">LTCG Harvesting — The Annual ₹1.25L Trick</h3>
        <div className="text-sm text-stone-600 space-y-2">
          <p>
            Every year, you can book up to ₹1,25,000 of LTCG from equity completely tax-free.
            The smart move is to <strong>harvest</strong> this every March:
          </p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Sell enough equity units to realise ₹1.25L in gains</li>
            <li>Buy the same fund back the next day</li>
            <li>Your new "cost basis" is now higher (at today's price)</li>
            <li>Future taxable gains are reduced, and you've used this year's exemption</li>
          </ol>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700">
            <strong>Over 10 years:</strong> If you do this every year, you shelter ₹12.5L of gains completely tax-free.
            At 12.5% LTCG rate, that's ₹1.56L in tax saved — automatically.
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ─── Section 4 — Smart Strategies ──────────────────────────────────────── */

function StrategiesSection() {
  return (
    <div className="space-y-5">
      <SectionHeader
        emoji="💡"
        title="Smart Tax Strategies"
        subtitle="कर बचाने के सात तरीके — actionable tips"
      />

      {[
        {
          number: '1',
          title: 'Submit Form 15H every April',
          color: 'bg-blue-50 border-blue-200 text-blue-800',
          content: 'If your total income is below ₹12 lakh, submit Form 15H to every bank/post office where you hold FDs, SCSS, or POMIS. This stops them from deducting TDS. Do it every April. Each branch of a bank needs its own form.',
        },
        {
          number: '2',
          title: 'LTCG Harvesting — book ₹1.25L gains every March',
          color: 'bg-green-50 border-green-200 text-green-800',
          content: 'Every financial year (April–March), you can realise up to ₹1,25,000 of equity gains completely tax-free. In late March, sell units worth ₹1.25L profit and immediately rebuy — this resets your cost basis and you pay zero tax on that gain.',
        },
        {
          number: '3',
          title: 'Split investments between spouses',
          color: 'bg-purple-50 border-purple-200 text-purple-800',
          content: 'If your mother has lower or zero income, keep investments in her name too. Her income is taxed separately — effectively doubling the ₹12L zero-tax threshold and the ₹1.25L LTCG exemption for the household. Each person gets their own 87A rebate.',
        },
        {
          number: '4',
          title: 'Choose Growth option over Dividend for MFs',
          color: 'bg-amber-50 border-amber-200 text-amber-800',
          content: 'Mutual fund dividends are now taxed at your slab rate (since 2020). Capital gains (growth option) from equity are taxed at only 12.5% LTCG if held 12+ months — often much less. Switch to growth option to control when you are taxed (only when you sell).',
        },
        {
          number: '5',
          title: 'Use SWP instead of lump-sum withdrawals',
          color: 'bg-teal-50 border-teal-200 text-teal-800',
          content: 'Systematic Withdrawal Plan (SWP) from an equity fund gives you a fixed monthly amount. Each instalment is a mix of principal (not taxed) and small gain (LTCG at 12.5% if held long enough). This spreads out your LTCG, staying within the ₹1.25L annual exempt limit each year.',
        },
        {
          number: '6',
          title: 'Keep PPF active — it is completely tax-free',
          color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
          content: 'PPF has EEE status — contributions, interest, and maturity are all tax-free. After maturity (15 years), you can extend in 5-year blocks while continuing to earn 7.1% tax-free interest. No TDS. No declaration needed. Ideal for the conservative bucket.',
        },
        {
          number: '7',
          title: 'Time FD renewals to spread interest across FYs',
          color: 'bg-rose-50 border-rose-200 text-rose-800',
          content: 'FD interest is taxable in the year it accrues (even if not paid out for cumulative FDs). If you have a large FD maturing, consider splitting it across 2-3 smaller FDs with different maturity dates — this spreads the accrued interest across financial years and reduces the year\'s taxable income.',
        },
      ].map(tip => (
        <div key={tip.number} className={`rounded-xl border p-4 ${tip.color}`}>
          <div className="flex gap-3 items-start">
            <div className="shrink-0 w-7 h-7 rounded-full bg-white/70 flex items-center justify-center font-bold text-sm">
              {tip.number}
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">{tip.title}</p>
              <p className="text-sm opacity-90">{tip.content}</p>
            </div>
          </div>
        </div>
      ))}

      <Card>
        <p className="text-xs text-stone-400">
          These are general educational guidelines for FY 2026-27 under the new income tax regime.
          Tax rules can change and individual situations vary. Consult a qualified Chartered Accountant
          for decisions specific to your situation.
        </p>
      </Card>
    </div>
  );
}

/* ─── Section 5 — Where to Invest ───────────────────────────────────────── */

function InvestSection() {
  return (
    <div className="space-y-5">
      <SectionHeader
        emoji="🏦"
        title="Where to Invest?"
        subtitle="पैसे कहाँ लगाएं — 4-bucket strategy for retirement"
      />

      <div className="bg-stone-50 rounded-2xl p-4 text-sm text-stone-600 space-y-2">
        <p className="font-semibold text-stone-800">The 4-Bucket Strategy</p>
        <p>
          Instead of thinking of all money as one pile, divide it into four buckets with different jobs.
          This reduces panic during market falls and ensures regular income.
        </p>
      </div>

      {[
        {
          bucket: '🛡️ Safety Bucket',
          purpose: 'Immediate needs — 6–12 months expenses',
          color: 'bg-blue-50 border-blue-300',
          textColor: 'text-blue-800',
          instruments: [
            { name: 'Savings account', why: 'Instant access, FDIC-like protection up to ₹5L via DICGC' },
            { name: 'Liquid mutual funds', why: 'Better return than savings, redeemable within 1 day' },
          ],
          note: 'Keep 6–12 months of total expenses here. Never invest this in anything with lock-in or market risk.',
        },
        {
          bucket: '📅 Income Bucket',
          purpose: 'Regular monthly income for next 5–7 years',
          color: 'bg-green-50 border-green-300',
          textColor: 'text-green-800',
          instruments: [
            { name: 'SCSS (Senior Citizens Savings Scheme)', why: '8.2% p.a., quarterly payout, backed by govt, max ₹30L per couple' },
            { name: 'POMIS (Post Office Monthly Income Scheme)', why: '7.4% p.a., monthly payout, backed by govt, max ₹15L single / ₹30L joint' },
            { name: 'Bank FDs', why: 'Flexible tenure, 7–8% rates, DICGC protection ₹5L per bank' },
            { name: 'SWP from debt funds', why: 'Tax-efficient withdrawals, better post-tax return than FD for higher tax slabs' },
          ],
          note: 'SCSS is the single best instrument for most retirees — government-backed, highest safe rate, quarterly income.',
        },
        {
          bucket: '📈 Growth Bucket',
          purpose: 'Long-term wealth — beat inflation over 10+ years',
          color: 'bg-amber-50 border-amber-300',
          textColor: 'text-amber-800',
          instruments: [
            { name: 'Equity mutual funds (Flexi Cap / Large Cap)', why: '10–13% historical CAGR, most tax-efficient (12.5% LTCG)' },
            { name: 'Balanced advantage / hybrid funds', why: 'Auto-rebalancing, less volatile than pure equity, still equity-taxed' },
            { name: 'PPF (extension after maturity)', why: '7.1% fully tax-free, risk-free, government-backed' },
          ],
          note: 'Only money not needed for 5+ years should go here. Don\'t panic-sell during corrections — this bucket is for the long run.',
        },
        {
          bucket: '🏛️ Legacy Bucket',
          purpose: 'Preserve wealth to pass on',
          color: 'bg-purple-50 border-purple-300',
          textColor: 'text-purple-800',
          instruments: [
            { name: 'Property', why: 'Appreciates over time, rental income, but illiquid' },
            { name: 'Gold (jewellery / ETF)', why: 'Hedge against inflation, inheritance value, Gold ETF is most liquid form' },
            { name: 'Sovereign Gold Bonds', why: 'Government-backed, 2.5% interest, no capital gains if held to maturity (8 years)' },
          ],
          note: 'This is "don\'t need to touch this money" wealth. Don\'t count it for income planning.',
        },
      ].map(bucket => (
        <Card key={bucket.bucket}>
          <div className={`rounded-xl border p-3 ${bucket.color} mb-3`}>
            <p className={`font-bold text-base ${bucket.textColor}`}>{bucket.bucket}</p>
            <p className={`text-sm ${bucket.textColor} opacity-80`}>{bucket.purpose}</p>
          </div>
          <div className="space-y-2">
            {bucket.instruments.map(inst => (
              <div key={inst.name} className="text-sm">
                <p className="font-medium text-stone-700">{inst.name}</p>
                <p className="text-stone-500 text-xs">{inst.why}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-stone-400 mt-3 pt-3 border-t border-stone-100">{bucket.note}</p>
        </Card>
      ))}

      <Card>
        <h3 className="font-semibold text-stone-800 mb-3">Example — How to Deploy ₹1 Crore Corpus</h3>
        <div className="text-sm space-y-2">
          <p className="text-stone-500 mb-3">Monthly expenses ₹50,000 · Monthly pension ₹20,000 · Monthly gap ₹30,000</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-stone-400 border-b border-stone-100">
                <th className="pb-2 font-medium">Bucket</th>
                <th className="pb-2 font-medium text-right">Amount</th>
                <th className="pb-2 font-medium text-right">Annual return</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Safety (6m expenses)', '₹3,00,000', '6% (liquid fund)'],
                ['Income (SCSS ₹30L cap)', '₹30,00,000', '8.2% → ₹24,600/mo'],
                ['Income (POMIS ₹15L)', '₹15,00,000', '7.4% → ₹9,250/mo'],
                ['Income (FD ₹12L)', '₹12,00,000', '7.5% → ₹7,500/mo'],
                ['Growth (equity MF)', '₹35,00,000', '11% expected CAGR'],
                ['Legacy (gold/PPF)', '₹5,00,000', '7%+ tax-free'],
              ].map(([bucket, amt, ret]) => (
                <tr key={bucket} className="border-b border-stone-50 last:border-0">
                  <td className="py-2 text-stone-700">{bucket}</td>
                  <td className="py-2 text-right font-medium">{amt}</td>
                  <td className="py-2 text-right text-stone-500">{ret}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-green-50 rounded-xl p-3 text-xs text-green-700 mt-2">
            SCSS ₹24,600 + POMIS ₹9,250 + FD ₹7,500 + Pension ₹20,000 = <strong>₹61,350/mo income</strong>
            vs ₹50,000 expenses → ₹11,350 surplus every month!
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ─── Section 6 — Monthly Income Setup ──────────────────────────────────── */

function MonthlyIncomeSection() {
  return (
    <div className="space-y-5">
      <SectionHeader
        emoji="💸"
        title="Monthly Income Setup"
        subtitle="हर महीने तनख्वाह जैसी आय — step-by-step setup"
      />

      <div className="bg-brand-50 border border-brand-200 rounded-2xl p-4 text-sm text-brand-800 space-y-1">
        <p className="font-semibold">The Goal: Create a reliable monthly salary from your corpus</p>
        <p className="opacity-90">After retirement, income stops being automatic. The task is to set up systems that pay you automatically every month — without selling assets or worrying.</p>
      </div>

      <Card>
        <h3 className="font-semibold text-stone-800 mb-3">Step 1 — Calculate Your Monthly Gap</h3>
        <div className="space-y-2 text-sm text-stone-600">
          <p>Your monthly income need − guaranteed pension/income = the gap that investments must cover.</p>
          <div className="bg-stone-50 rounded-xl p-3 font-mono text-xs space-y-1">
            <p>Monthly expenses      =  ₹55,000</p>
            <p>Pension received      = −₹35,000</p>
            <p className="font-bold border-t border-stone-200 pt-1">Monthly gap          =  ₹20,000</p>
          </div>
          <p className="text-xs text-stone-400">This is the amount your investments need to generate every month.</p>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-stone-800 mb-3">Step 2 — First, Fill SCSS and POMIS to the Max</h3>
        <div className="space-y-2 text-sm text-stone-600">
          <p>These are the safest, highest-return guaranteed-income instruments available to Indian retirees.</p>
          <div className="space-y-2">
            {[
              {
                name: 'SCSS — Senior Citizens Savings Scheme',
                limit: '₹30L per couple (₹15L each)',
                rate: '8.2% p.a.',
                payout: 'Quarterly',
                where: 'Any bank or post office',
                note: '₹30L SCSS = ₹2,460/mo per person = ₹4,920/mo for couple',
              },
              {
                name: 'POMIS — Post Office Monthly Income Scheme',
                limit: '₹15L single / ₹30L joint',
                rate: '7.4% p.a.',
                payout: 'Monthly (direct to bank)',
                where: 'Any post office',
                note: '₹15L POMIS = ₹9,250/mo',
              },
            ].map(inst => (
              <div key={inst.name} className="bg-green-50 rounded-xl p-3 text-xs">
                <p className="font-semibold text-green-800 text-sm">{inst.name}</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-1 text-green-700">
                  <span>Limit: {inst.limit}</span>
                  <span>Rate: {inst.rate}</span>
                  <span>Payout: {inst.payout}</span>
                  <span>Where: {inst.where}</span>
                </div>
                <p className="text-green-600 mt-1">{inst.note}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-stone-800 mb-3">Step 3 — Use FDs for the Remaining Gap</h3>
        <div className="space-y-2 text-sm text-stone-600">
          <p>After SCSS and POMIS, park remaining income-corpus in bank FDs.</p>
          <ul className="list-disc pl-4 space-y-1 text-sm">
            <li>Choose FDs with <strong>monthly interest payout</strong> option</li>
            <li>Spread across 2-3 banks to stay within ₹5L DICGC insurance per bank</li>
            <li>Prefer 1–2 year tenures and renew — rates may improve</li>
            <li>Submit Form 15H at the start of each FY to avoid TDS</li>
          </ul>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-stone-800 mb-3">Step 4 — Set Up SWP from Equity MF for Top-up</h3>
        <div className="space-y-2 text-sm text-stone-600">
          <p>
            A <strong>Systematic Withdrawal Plan (SWP)</strong> lets you withdraw a fixed amount from
            a mutual fund automatically every month, direct to your bank account.
          </p>
          <ul className="list-disc pl-4 space-y-1 text-sm">
            <li>Set up via your broker app / AMC website — takes 10 minutes</li>
            <li>Choose the 1st or 5th of the month for withdrawal</li>
            <li>Each withdrawal = mix of principal + gains (only gains are taxed)</li>
            <li>If held &gt;12 months, gains are LTCG — taxed at only 12.5% (and first ₹1.25L/year is exempt)</li>
          </ul>
          <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
            <strong>Example:</strong> ₹20L in equity MF, SWP of ₹10,000/month. Monthly return of ~0.8% = ₹16,000.
            Your SWP takes ₹10,000; the remaining ₹6,000 stays and compounds. Corpus grows while paying you!
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-stone-800 mb-3">Step 5 — Keep a Buffer Account</h3>
        <div className="space-y-2 text-sm text-stone-600">
          <p>
            Keep 3–6 months of expenses in a savings account as a buffer.
            This handles months where SCSS interest is delayed, medical emergencies, or
            any irregular expense — without touching your long-term investments.
          </p>
          <p>
            Auto-top-up: when the savings balance exceeds 6 months, move the excess to an FD.
            When it falls below 3 months, redeem one FD or increase SWP temporarily.
          </p>
        </div>
      </Card>

      <Card accent="green">
        <h3 className="font-semibold text-stone-800 mb-3">The Complete Monthly Salary System</h3>
        <div className="space-y-2 text-sm">
          {[
            ['1st of month', 'POMIS interest credited to bank account'],
            ['1st–10th', 'SCSS quarterly interest (every Jan/Apr/Jul/Oct)'],
            ['5th of month', 'SWP from equity MF auto-credited'],
            ['Any day', 'FD monthly payout credited'],
            ['Daily', 'Savings account earns interest passively'],
          ].map(([when, what]) => (
            <div key={when} className="flex gap-3 items-start text-stone-700">
              <span className="font-medium text-green-700 shrink-0 text-xs w-24">{when}</span>
              <span className="text-stone-600 text-xs">{what}</span>
            </div>
          ))}
          <div className="bg-green-50 rounded-xl p-3 text-xs text-green-700 mt-2">
            <strong>Result:</strong> Your bank account receives money from multiple sources throughout the month —
            like a salary, but tax-efficient and diversified.
          </div>
        </div>
      </Card>

      <Card>
        <p className="text-xs text-stone-400">
          Rates mentioned are as of June 2026. SCSS and POMIS rates are reviewed quarterly by the government.
          Always verify current rates before investing. This is educational information only — not financial advice.
          Consult a SEBI-registered investment advisor or Chartered Accountant for your specific situation.
        </p>
      </Card>
    </div>
  );
}

/* ─── Shared helpers ─────────────────────────────────────────────────────── */

function SectionHeader({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
        <span>{emoji}</span>
        <span>{title}</span>
      </h2>
      <p className="text-stone-500 text-sm mt-1">{subtitle}</p>
    </div>
  );
}
