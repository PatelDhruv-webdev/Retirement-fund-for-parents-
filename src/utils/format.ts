import Decimal from 'decimal.js';

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const INR_WITH_PAISE = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Format as Indian rupees: ₹12,34,567
export function fmt(value: Decimal | number): string {
  const n = value instanceof Decimal ? value.toDecimalPlaces(0).toNumber() : Math.round(value);
  return INR.format(n);
}

// Format with paise: ₹1,23,456.78
export function fmtPaise(value: Decimal | number): string {
  const n = value instanceof Decimal ? value.toNumber() : value;
  return INR_WITH_PAISE.format(n);
}

// Smart format: shows as lakhs or crores depending on magnitude.
export function fmtSmart(value: Decimal | number): string {
  const n = value instanceof Decimal ? value.toDecimalPlaces(0).toNumber() : Math.round(value);
  const abs = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (abs >= 1_00_00_000) {
    return `${sign}₹${(abs / 1_00_00_000).toFixed(2)} cr`;
  }
  if (abs >= 1_00_000) {
    return `${sign}₹${(abs / 1_00_000).toFixed(2)} lakh`;
  }
  return fmt(n);
}

// Short label format for charts/cards: "₹45L" or "₹2.3Cr"
export function fmtShort(value: Decimal | number): string {
  const n = value instanceof Decimal ? value.toDecimalPlaces(0).toNumber() : Math.round(value);
  const abs = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (abs >= 1_00_00_000) {
    const cr = abs / 1_00_00_000;
    return `${sign}₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)}Cr`;
  }
  if (abs >= 1_00_000) {
    const lk = abs / 1_00_000;
    return `${sign}₹${lk % 1 === 0 ? lk.toFixed(0) : lk.toFixed(1)}L`;
  }
  if (abs >= 1_000) {
    return `${sign}₹${(abs / 1_000).toFixed(0)}K`;
  }
  return fmt(n);
}

// Plain number in Indian format without ₹ symbol.
export function fmtNum(value: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.round(value));
}

// Percentage to one decimal place.
export function fmtPct(value: Decimal | number): string {
  const n = value instanceof Decimal ? value.toNumber() : value;
  return `${(n * 100).toFixed(1)}%`;
}
