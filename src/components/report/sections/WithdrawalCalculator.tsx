import { useState } from 'react';
import Decimal from 'decimal.js';
import type { MutualFund } from '../../../types/profile';
import { computeMFCapitalGains } from '../../../engine';
import { fmt, fmtSmart } from '../../../utils/format';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

type Props = {
  funds: MutualFund[];
  asOf: Date;
};

export function WithdrawalCalculator({ funds, asOf }: Props) {
  const [selectedFundId, setSelectedFundId] = useState<string>(funds[0]?.id ?? '');
  const [amount, setAmount] = useState('');

  const selectedFund = funds.find(f => f.id === selectedFundId);

  const result = (() => {
    if (!selectedFund || !amount || parseFloat(amount) <= 0) return null;
    const redemption = new Decimal(parseFloat(amount));
    if (redemption.gt(selectedFund.currentValue)) return null;
    return computeMFCapitalGains(selectedFund, redemption, new Decimal(0), asOf);
  })();

  if (funds.length === 0) return null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-stone-800 mb-1">
          Withdrawal Calculator
        </h2>
        <p className="text-stone-500 text-sm">
          If you sell a mutual fund, how much do you keep after tax?
        </p>
      </div>

      <Card className="space-y-4">
        <div className="space-y-2">
          <label className="field-label">Which fund?</label>
          <select
            className="input-base"
            value={selectedFundId}
            onChange={e => setSelectedFundId(e.target.value)}
          >
            {funds.map(f => (
              <option key={f.id} value={f.id}>
                {f.label || f.category} — {fmt(f.currentValue)}
              </option>
            ))}
          </select>
        </div>

        {selectedFund && (
          <div className="text-sm text-stone-500 bg-stone-50 rounded-lg p-3">
            Current value: <strong>{fmt(selectedFund.currentValue)}</strong>
            {selectedFund.investedTotal && (
              <> · Invested: <strong>{fmt(selectedFund.investedTotal)}</strong></>
            )}
            {selectedFund.startDate && (
              <> · Since: <strong>{selectedFund.startDate.slice(0, 7)}</strong></>
            )}
          </div>
        )}

        <Input
          label="How much do you want to withdraw?"
          type="number"
          prefix="₹"
          placeholder={selectedFund ? String(selectedFund.currentValue) : ''}
          value={amount}
          onChange={e => setAmount(e.target.value)}
          hint="Enter the amount you want to take out"
        />

        {result && (
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <p className="font-semibold text-stone-800">Tax breakdown:</p>

            {result.note && (
              <p className="text-xs text-stone-400 bg-stone-50 rounded-lg p-2">{result.note}</p>
            )}

            <div className="space-y-2 text-sm">
              {result.stcgGain.gt(0) && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Short-term gain (20%)</span>
                  <span>
                    {fmt(result.stcgGain)} → tax: {fmt(result.stcgTax)}
                  </span>
                </div>
              )}
              {result.ltcgGain.gt(0) && (
                <>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Long-term gain (12.5%)</span>
                    <span>{fmtSmart(result.ltcgGain)}</span>
                  </div>
                  {result.ltcgExemptApplied.gt(0) && (
                    <div className="flex justify-between text-green-700">
                      <span>₹1.25L annual exemption applied</span>
                      <span>− {fmt(result.ltcgExemptApplied)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-stone-500">LTCG tax</span>
                    <span>{fmt(result.ltcgTax)}</span>
                  </div>
                </>
              )}
              {result.slabRateGain.gt(0) && (
                <div className="flex justify-between text-amber-700">
                  <span>Added to slab income (debt fund)</span>
                  <span>{fmt(result.slabRateGain)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500 text-xs">
                <span>Cess (4%)</span>
                <span>{fmt(result.cess)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-stone-200">
                <span>Total tax</span>
                <span className="text-amber-700">{fmt(result.totalTax)}</span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-green-800">You keep</p>
                <p className="text-xs text-green-600">After all taxes</p>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {fmt(new Decimal(parseFloat(amount)).minus(result.totalTax))}
              </p>
            </div>
          </div>
        )}

        {selectedFund && amount && parseFloat(amount) > selectedFund.currentValue && (
          <p className="text-sm text-red-600">
            Amount exceeds current fund value of {fmt(selectedFund.currentValue)}.
          </p>
        )}

        {result === null && amount && parseFloat(amount) > 0 && (
          <Button variant="ghost" className="w-full text-stone-400" disabled>
            Enter a valid amount above
          </Button>
        )}
      </Card>
    </div>
  );
}
