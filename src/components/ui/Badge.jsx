import React from 'react';

const VARIANTS = {
  purple: 'bg-[#9147FF]/15 text-[#9147FF] border-[#9147FF]/35 shadow-sm shadow-[#9147FF]/10',
  cyan: 'bg-[#00D9FF]/15 text-[#00D9FF] border-[#00D9FF]/35 shadow-sm shadow-[#00D9FF]/10',
  orange: 'bg-[#FF8A35]/15 text-[#FF8A35] border-[#FF8A35]/35 shadow-sm shadow-[#FF8A35]/10',
  neon: 'bg-[#B7F34A]/15 text-[#B7F34A] border-[#B7F34A]/35 shadow-sm shadow-[#B7F34A]/10',
  pink: 'bg-[#FF4FA3]/15 text-[#FF4FA3] border-[#FF4FA3]/35 shadow-sm shadow-[#FF4FA3]/10',
  gold: 'bg-[#FFD027]/15 text-[#FFD027] border-[#FFD027]/35 shadow-sm shadow-[#FFD027]/10',
  slate: 'bg-battle-surface text-battle-muted border-battle-border',
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
