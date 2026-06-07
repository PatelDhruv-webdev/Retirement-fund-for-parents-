import { useState, type ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  variant?: 'info' | 'tax';
};

export function Expandable({ title, children, defaultOpen = false, variant = 'info' }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const isTax = variant === 'tax';

  return (
    <div className={`rounded-xl border text-sm overflow-hidden
      ${isTax ? 'border-sky-200' : 'border-stone-200'}`}>

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors
          ${isTax
            ? 'bg-sky-50 text-sky-900 hover:bg-sky-100'
            : 'bg-stone-50 text-stone-700 hover:bg-stone-100'}`}
        aria-expanded={open}
      >
        <span className="font-semibold pr-4">{title}</span>
        <span className={`text-xl font-light leading-none shrink-0 select-none transition-transform duration-200
          ${open ? 'rotate-45' : ''}
          ${isTax ? 'text-sky-500' : 'text-stone-400'}`}>
          +
        </span>
      </button>

      {open && (
        <div className={`px-4 py-4 space-y-2
          ${isTax
            ? 'bg-white border-t border-sky-100 text-stone-700'
            : 'bg-white border-t border-stone-100 text-stone-600'}`}>
          {children}
        </div>
      )}
    </div>
  );
}
