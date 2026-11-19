import React from 'react';

const VARIANTS = {
  gold: 'bg-[#C3A45D]/20 text-[#C3A45D] border-[#C3A45D]/40',
  terracotta: 'bg-[#C66A45]/20 text-[#C66A45] border-[#C66A45]/40',
  sage: 'bg-[#91A08B]/20 text-[#91A08B] border-[#91A08B]/40',
  ivory: 'bg-[#E8E3D4]/15 text-[#E8E3D4] border-[#E8E3D4]/30',
  slate: 'bg-[#24352C] text-[#91A08B] border-[#303832]',
  forest: 'bg-[#18251F] text-[#E8E3D4] border-[#303832]',
  // Franchise color identities
  purple: 'bg-[#9147FF]/15 text-[#9147FF] border-[#9147FF]/35 shadow-sm',
  cyan: 'bg-[#00D9FF]/15 text-[#00D9FF] border-[#00D9FF]/35 shadow-sm',
  orange: 'bg-[#C66A45]/20 text-[#C66A45] border-[#C66A45]/40',
  neon: 'bg-[#B7F34A]/15 text-[#B7F34A] border-[#B7F34A]/35 shadow-sm',
  pink: 'bg-[#FF4FA3]/15 text-[#FF4FA3] border-[#FF4FA3]/35 shadow-sm',
};

export const Badge = ({ children, variant = 'purple', className = '', pulse = false, icon: Icon }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border uppercase ${
        VARIANTS[variant] || VARIANTS.purple
      } ${className}`}
    >
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
      {Icon && <Icon className="w-3 h-3 stroke-[2.5]" />}
      {children}
    </span>
  );
};
