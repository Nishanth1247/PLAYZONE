import React from 'react';
import { motion } from 'framer-motion';

const VARIANTS = {
  primary: 'bg-[#45C4A1] hover:bg-[#3BB090] text-[#101418] font-bold border border-[#45C4A1] shadow-sm',
  secondary: 'bg-[#25313A] hover:bg-[#2B3841] text-[#EDF2F3] font-semibold border border-[#34414A]',
  ivory: 'bg-[#F0EDE5] hover:bg-[#E4E0D6] text-[#101418] font-bold border border-[#F0EDE5] shadow-sm',
  danger: 'bg-[#25313A] hover:bg-[#D87878]/20 text-[#D87878] border border-[#D87878]/40',
  accent: 'bg-[#45C4A1] hover:bg-[#3BB090] text-[#101418] font-bold border border-[#45C4A1] shadow-sm',
  amber: 'bg-[#D6A568] hover:bg-[#C49457] text-[#101418] font-bold border border-[#D6A568] shadow-sm',
  ghost: 'bg-transparent hover:bg-white/5 text-inherit',
  outline: 'bg-transparent border border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-surface-secondary)]',
  sage: 'bg-[#58B68C] hover:bg-[#4AA078] text-[#101418] font-bold border border-[#58B68C]',
  champagne: 'bg-[#D6A568] hover:bg-[#C49457] text-[#101418] font-bold border border-[#D6A568]',
  cyan: 'bg-[#25313A] hover:bg-[#2B3841] text-[#45C4A1] border border-[#45C4A1]/40',
  gold: 'bg-[#D6A568] hover:bg-[#C49457] text-[#101418] font-bold border border-[#D6A568]',
  terracotta: 'bg-[#D87878] hover:bg-[#C76868] text-white font-bold border border-[#D87878]',
  'theme-primary': 'bg-[var(--theme-accent-primary)] hover:opacity-90 text-[#101418] font-bold shadow-sm',
  'theme-action': 'bg-[var(--theme-accent-action)] hover:opacity-90 text-[#101418] font-bold shadow-sm',
  'theme-card': 'bg-[var(--theme-card)] hover:bg-[var(--theme-surface-secondary)] border border-[var(--theme-border)] text-[var(--theme-text)]',
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
