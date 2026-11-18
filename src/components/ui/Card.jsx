import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  className = '',
  interactive = false,
  glowColor,
  onClick,
  ...props
}) => {
  const Component = interactive ? motion.div : 'div';
  const motionProps = interactive
    ? {
        whileHover: { y: -3, transition: { duration: 0.2 } },
        whileTap: { y: 0 },
      }
    : {};

  return (
    <Component
      onClick={onClick}
      className={`rounded-2xl battle-panel relative overflow-hidden ${
        interactive ? 'battle-panel-interactive cursor-pointer' : ''
      } ${className}`}
      style={{
        boxShadow: glowColor ? `0 10px 30px -10px ${glowColor}33` : undefined,
      }}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};
