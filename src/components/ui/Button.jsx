import React from 'react';
import { motion } from 'framer-motion';

const VARIANTS = {
  primary: 'bg-[#F2F2F0] hover:bg-[#E2E2E0] text-[#090909] font-bold border border-[#F2F2F0] shadow-sm',
  secondary: 'bg-[#303030] hover:bg-[#3D3D3D] text-[#F2F2F0] font-semibold border border-[#3E3E3E]',
  danger: 'bg-[#191919] hover:bg-rose-950/50 text-rose-300 border border-rose-900/40',
  accent: 'bg-[#F2F2F0] hover:bg-[#E2E2E0] text-[#090909] font-bold border border-[#F2F2F0] shadow-sm',
  ghost: 'bg-transparent hover:bg-[#191919] text-[#A3A3A3] hover:text-[#F2F2F0]',
  outline: 'bg-transparent hover:bg-[#191919] border border-[#303030] text-[#F2F2F0] hover:border-[#505050]',
  cyan: 'bg-[#F2F2F0] hover:bg-[#E2E2E0] text-[#090909] font-bold border border-[#F2F2F0]',
  gold: 'bg-[#F2F2F0] hover:bg-[#E2E2E0] text-[#090909] font-bold border border-[#F2F2F0]',
  terracotta: 'bg-[#F2F2F0] hover:bg-[#E2E2E0] text-[#090909] font-bold border border-[#F2F2F0]',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-xs font-semibold tracking-wide',
  lg: 'px-6 py-2.5 text-sm font-bold tracking-wider uppercase',
  xl: 'px-8 py-3 text-base font-bold tracking-wider uppercase',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  icon: Icon,
  type = 'button',
  ...props
}) => {
  return (
    <motion.button
      type={type}
      whileHover={disabled ? undefined : { scale: 1.01, translateY: -1 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.12 }}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg inline-flex items-center justify-center gap-2 transition-all select-none font-heading ${
        SIZES[size] || SIZES.md
      } ${VARIANTS[variant] || VARIANTS.primary} ${
        disabled ? 'opacity-40 cursor-not-allowed filter grayscale' : 'cursor-pointer'
      } ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </motion.button>
  );
};
