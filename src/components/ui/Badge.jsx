import React from 'react';

const VARIANTS = {
  // Monochrome system variants
  default: 'bg-[#191919] text-[#F2F2F0] border-[#303030]',
  mono: 'bg-[#191919] text-[#F2F2F0] border-[#303030]',
  outline: 'bg-transparent text-[#A3A3A3] border-[#303030]',
  subtle: 'bg-[#222222] text-[#A3A3A3] border-[#303030]',
  dark: 'bg-[#090909] text-[#F2F2F0] border-[#303030]',
  // Aliases mapping cleanly to monochrome
  gold: 'bg-[#191919] text-[#F2F2F0] border-[#303030]',
  terracotta: 'bg-[#191919] text-[#F2F2F0] border-[#303030]',
  sage: 'bg-[#191919] text-[#A3A3A3] border-[#303030]',
  ivory: 'bg-[#222222] text-[#F2F2F0] border-[#303030]',
  slate: 'bg-[#191919] text-[#A3A3A3] border-[#303030]',
  forest: 'bg-[#111111] text-[#F2F2F0] border-[#303030]',
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
