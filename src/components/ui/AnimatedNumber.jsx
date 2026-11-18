import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export const AnimatedNumber = ({ value, format = (v) => v, className = '' }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <motion.span
      key={value}
      initial={{ scale: 1.15, opacity: 0.8 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`inline-block ${className}`}
    >
      {format(displayValue)}
    </motion.span>
  );
};
