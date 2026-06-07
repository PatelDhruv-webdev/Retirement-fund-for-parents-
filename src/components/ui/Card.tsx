import type { ReactNode, MouseEventHandler } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  accent?: 'green' | 'amber' | 'blue' | 'teal';
  onClick?: MouseEventHandler<HTMLDivElement>;
};

const accentClass: Record<string, string> = {
  green: 'border-l-4 border-l-green-500',
  amber: 'border-l-4 border-l-amber-500',
  blue:  'border-l-4 border-l-blue-500',
  teal:  'border-l-4 border-l-brand-600',
};

export function Card({ children, className = '', accent, onClick }: Props) {
  const accentStyle = accent ? accentClass[accent] : '';
  return (
    <div className={`card ${accentStyle} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}
