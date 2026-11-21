import React from 'react';

const VARIANTS = {
  // Midnight Obsidian System Variants
  default: 'bg-[#25313A] text-[#EDF2F3] border-[#34414A]',
  mono: 'bg-[#25313A] text-[#EDF2F3] border-[#34414A]',
  outline: 'bg-transparent text-[#A5B2B8] border-[#34414A]',
  subtle: 'bg-[#1C252D] text-[#A5B2B8] border-[#34414A]',
  dark: 'bg-[#101418] text-[#EDF2F3] border-[#34414A]',
  primary: 'bg-[#45C4A1]/15 text-[#45C4A1] border-[#45C4A1]/35',
  jade: 'bg-[#45C4A1]/15 text-[#45C4A1] border-[#45C4A1]/35',
  amber: 'bg-[#D6A568]/15 text-[#D6A568] border-[#D6A568]/35',
  coral: 'bg-[#D87878]/15 text-[#D87878] border-[#D87878]/35',
  terracotta: 'bg-[#D87878]/15 text-[#D87878] border-[#D87878]/35',
  sage: 'bg-[#58B68C]/15 text-[#58B68C] border-[#58B68C]/35',
  champagne: 'bg-[#D6A568]/15 text-[#D6A568] border-[#D6A568]/35',
  gold: 'bg-[#D6A568]/15 text-[#D6A568] border-[#D6A568]/35',
  slate: 'bg-[#25313A] text-[#A5B2B8] border-[#34414A]',
  forest: 'bg-[#15352D] text-[#58B68C] border-[#244F43]',
  theme: 'bg-[var(--theme-surface-secondary)] text-[var(--theme-text)] border-[var(--theme-border)]',
  'theme-accent': 'bg-[var(--theme-accent-primary)]/15 text-[var(--theme-accent-primary)] border-[var(--theme-accent-primary)]/35',
  'theme-action': 'bg-[var(--theme-accent-action)]/15 text-[var(--theme-accent-action)] border-[var(--theme-accent-action)]/35',
  // Preserved franchise color identities
  purple: 'bg-[#8875A8]/15 text-[#8875A8] border-[#8875A8]/30',
  cyan: 'bg-[#71999B]/15 text-[#71999B] border-[#71999B]/30',
  orange: 'bg-[#B68B68]/15 text-[#B68B68] border-[#B68B68]/30',
  neon: 'bg-[#84977B]/15 text-[#84977B] border-[#84977B]/30',
  nishanth: 'bg-[#8875A8]/15 text-[#8875A8] border-[#8875A8]/30',
  ajmal: 'bg-[#71999B]/15 text-[#71999B] border-[#71999B]/30',
  praneeth: 'bg-[#B68B68]/15 text-[#B68B68] border-[#B68B68]/30',
  nagulan: 'bg-[#84977B]/15 text-[#84977B] border-[#84977B]/30',
};

export const Badge = ({ children, variant = 'mono', className = '', pulse = false, icon: Icon }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-heading font-semibold tracking-wide border uppercase ${
        VARIANTS[variant] || VARIANTS.mono
      } ${className}`}
    >
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
      {Icon && <Icon className="w-3 h-3 stroke-[2.5]" />}
      {children}
    </span>
  );
};
