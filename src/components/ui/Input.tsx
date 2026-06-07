import type { InputHTMLAttributes, ReactNode } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  hint?: string;
  error?: string;
  prefix?: string; // e.g. "₹"
  suffix?: string; // e.g. "/month"
};

export function Input({ label, hint, error, prefix, suffix, className = '', id, ...rest }: Props) {
  const inputId = id ?? (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  return (
    <div className={className}>
      <label className="field-label" htmlFor={inputId}>
        {label}
      </label>
      {hint && <span className="field-hint">{hint}</span>}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-4 text-stone-500 font-medium pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          className={`input-base ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-16' : ''}`}
          {...rest}
        />
        {suffix && (
          <span className="absolute right-4 text-stone-500 text-sm pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
