import React from 'react';
import { motion } from 'framer-motion';

const VARIANTS = {
  primary: 'bg-gradient-to-r from-brand-purple to-brand-cyan text-white shadow-lg shadow-brand-purple/25 hover:shadow-brand-cyan/40 border border-white/10',
  secondary: 'bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-text hover:border-brand-purple/50',
  danger: 'bg-gradient-to-r from-red-600 to-brand-orange text-white shadow-lg shadow-red-600/30 hover:shadow-red-600/50',
  accent: 'bg-gradient-to-r from-brand-orange via-amber-500 to-brand-neon text-dark-950 font-black shadow-lg shadow-brand-orange/30',
  ghost: 'bg-transparent hover:bg-battle-surface/80 text-battle-muted hover:text-white',
  cyan: 'bg-gradient-to-r from-brand-cyan to-blue-600 text-dark-950 font-black shadow-lg shadow-brand-cyan/30',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-xs font-bold tracking-wide',
  lg: 'px-6 py-3 text-sm font-black tracking-wider uppercase',
  xl: 'px-8 py-3.5 text-base font-black tracking-wider uppercase',
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
      whileHover={disabled ? undefined : { scale: 1.02, translateY: -1 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl inline-flex items-center justify-center gap-2 transition-colors select-none font-broadcast ${
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
