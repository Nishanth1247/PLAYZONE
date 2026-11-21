import React from 'react';

const VARIANTS = {
  // Midnight Navy & Deep Slate system variants
  default: 'bg-[#222F43] text-[#F5F3EE] border-[#39465A]',
  mono: 'bg-[#222F43] text-[#F5F3EE] border-[#39465A]',
  outline: 'bg-transparent text-[#AEB9CC] border-[#39465A]',
  subtle: 'bg-[#2C394C] text-[#AEB9CC] border-[#39465A]',
  dark: 'bg-[#111827] text-[#F5F3EE] border-[#39465A]',
  primary: 'bg-[#D97858] text-[#F5F3EE] border-[#D97858]',
  coral: 'bg-[#D97858]/15 text-[#D97858] border-[#D97858]/35',
  terracotta: 'bg-[#D97858]/15 text-[#D97858] border-[#D97858]/35',
  sage: 'bg-[#91A98B]/15 text-[#91A98B] border-[#91A98B]/35',
  champagne: 'bg-[#D4B879]/15 text-[#D4B879] border-[#D4B879]/35',
  gold: 'bg-[#D4B879]/15 text-[#D4B879] border-[#D4B879]/35',
  ivory: 'bg-[#F0EDE5] text-[#111827] border-[#F0EDE5]',
  slate: 'bg-[#2C394C] text-[#AEB9CC] border-[#39465A]',
  forest: 'bg-[#222F43] text-[#91A98B] border-[#39465A]',
  theme: 'bg-[var(--theme-surface-secondary)] text-[var(--theme-text)] border-[var(--theme-border)]',
  'theme-accent': 'bg-[var(--theme-accent-primary)]/15 text-[var(--theme-accent-primary)] border-[var(--theme-accent-primary)]/30',
  'theme-action': 'bg-[var(--theme-accent-action)]/15 text-[var(--theme-accent-action)] border-[var(--theme-accent-action)]/30',
  // Muted franchise color identities
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
