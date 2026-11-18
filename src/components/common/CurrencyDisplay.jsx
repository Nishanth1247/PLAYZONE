import React from 'react';

export const formatCurrency = (amount, currency = { symbol: '₹', unit: 'Cr' }) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '—';
  
  const num = Number(amount);
  const symbol = currency.symbol || '₹';
  
  // Format depending on currency symbol and magnitude
  if (symbol === '₹') {
    // If unit is Cr
    return `${symbol} ${num.toFixed(2)} Cr`;
  } else if (symbol === '€' || symbol === '$' || symbol === '£') {
    return `${symbol}${num.toFixed(1)}M`;
  } else if (symbol === '🪙') {
    return `${symbol} ${num.toLocaleString()}`;
  }
  
  return `${symbol} ${num.toLocaleString()}`;
};

export const CurrencyDisplay = ({ amount, currency, className = '', highlight = false }) => {
  return (
    <span className={`inline-flex items-baseline font-mono tracking-tight ${highlight ? 'text-amber-400 font-bold' : ''} ${className}`}>
      {formatCurrency(amount, currency)}
    </span>
  );
};
