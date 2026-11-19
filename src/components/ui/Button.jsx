import React from 'react';
import { motion } from 'framer-motion';

const VARIANTS = {
  primary: 'bg-[#C66A45] hover:bg-[#B55A36] text-[#E8E3D4] font-bold shadow-md border border-[#D97D58]/40',
  secondary: 'bg-[#24352C] hover:bg-[#303832] border border-[#303832] text-[#E8E3D4] hover:border-[#C3A45D]/50',
  danger: 'bg-red-900/80 hover:bg-red-800 text-[#E8E3D4] shadow-md border border-red-700/60',
  accent: 'bg-[#C3A45D] hover:bg-[#B2934D] text-[#18251F] font-black shadow-md border border-[#D8BC78]/50',
  ghost: 'bg-transparent hover:bg-[#24352C] text-[#91A08B] hover:text-[#E8E3D4]',
  cyan: 'bg-[#C66A45] hover:bg-[#B55A36] text-[#E8E3D4] font-bold shadow-md border border-[#D97D58]/40',
  gold: 'bg-[#C3A45D] hover:bg-[#B2934D] text-[#18251F] font-black shadow-md border border-[#D8BC78]/50',
  terracotta: 'bg-[#C66A45] hover:bg-[#B55A36] text-[#E8E3D4] font-bold shadow-md border border-[#D97D58]/40',
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
