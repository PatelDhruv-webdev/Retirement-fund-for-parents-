import { useState, type ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  variant?: 'info' | 'tax';
};

export function Expandable({ title, children, defaultOpen = false, variant = 'info' }: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const headerClass = variant === 'tax'
    ? 'bg-blue-50 border border-blue-200 text-blue-800'
    : 'bg-stone-50 border border-stone-200 text-stone-700';

  return (
    <div className="rounded-xl overflow-hidden text-sm">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 ${headerClass} transition-colors`}
        aria-expanded={open}
      >
        <span className="font-medium">{title}</span>
        <span className="text-lg leading-none select-none">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className={`px-4 py-3 ${variant === 'tax' ? 'bg-blue-50 border-x border-b border-blue-200 text-blue-900' : 'bg-stone-50 border-x border-b border-stone-200 text-stone-700'} space-y-2`}>
          {children}
        </div>
      )}
    </div>
  );
}
