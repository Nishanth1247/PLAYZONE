import React from 'react';
import { motion } from 'framer-motion';

const VARIANTS = {
  primary: 'bg-[#D97858] hover:bg-[#C86747] text-[#F5F3EE] font-bold border border-[#D97858] shadow-sm',
  secondary: 'bg-[#2C394C] hover:bg-[#34445A] text-[#F5F3EE] font-semibold border border-[#39465A]',
  ivory: 'bg-[#F0EDE5] hover:bg-[#E4E0D6] text-[#111827] font-bold border border-[#F0EDE5] shadow-sm',
  danger: 'bg-[#222F43] hover:bg-rose-950/50 text-rose-300 border border-rose-900/40',
  accent: 'bg-[#D97858] hover:bg-[#C86747] text-[#F5F3EE] font-bold border border-[#D97858] shadow-sm',
  ghost: 'bg-transparent hover:bg-[#2C394C] text-[#AEB9CC] hover:text-[#F5F3EE]',
  outline: 'bg-transparent hover:bg-[#222F43] border border-[#39465A] text-[#F5F3EE] hover:border-[#4B5A70]',
  sage: 'bg-[#91A98B] hover:bg-[#80997A] text-[#111827] font-bold border border-[#91A98B]',
  champagne: 'bg-[#D4B879] hover:bg-[#C5A866] text-[#111827] font-bold border border-[#D4B879]',
  cyan: 'bg-[#2C394C] hover:bg-[#34445A] text-[#71999B] border border-[#71999B]/40',
  gold: 'bg-[#D4B879] hover:bg-[#C5A866] text-[#111827] font-bold border border-[#D4B879]',
  terracotta: 'bg-[#D97858] hover:bg-[#C86747] text-[#F5F3EE] font-bold border border-[#D97858]',
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
