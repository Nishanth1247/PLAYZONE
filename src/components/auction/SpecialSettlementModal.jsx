import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Gavel } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../common/CurrencyDisplay';

/**
 * BIDBATTLE 8.3 - Mandatory Last-Bidder Settlement Modal
 * Triggers when a user attempts to close a lot as UNSOLD after one or more valid bids.
 * Explains that the lot cannot become UNSOLD, and that the last accepted bidder
 * will acquire the player at the original base price.
 */
export const SpecialSettlementModal = ({
  dialogData,
  currency,
  onConfirm,
  onCancel,
}) => {
  if (!dialogData) return null;

  const { item, team, basePrice, highestBid } = dialogData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative max-w-lg w-full rounded-3xl battle-panel border-2 border-brand-orange p-6 sm:p-8 shadow-2xl text-center overflow-hidden"
      >
        {/* Glow halo in team color */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ backgroundColor: team?.color || '#FF8A35' }}
        />

        {/* Header Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-500 text-amber-400 flex items-center justify-center shadow-glow-orange mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Rule Heading */}
        <div className="mb-4">
          <Badge variant="orange" className="mb-2 uppercase tracking-wider font-broadcast text-xs">
            Mandatory Settlement Rule
          </Badge>
          <h3 className="text-2xl sm:text-3xl font-black text-white font-broadcast uppercase tracking-wide leading-tight">
            THIS PLAYER HAS RECEIVED A VALID BID
          </h3>
          <p className="text-sm font-broadcast font-bold text-rose-400 mt-1">
            This player cannot be marked UNSOLD.
          </p>
        </div>

        {/* Lot & Award Summary Box */}
        <div className="p-4 rounded-2xl bg-battle-bg border border-battle-border text-left space-y-3 mb-6">
          <div className="flex items-center justify-between border-b border-battle-border pb-2">
            <div>
              <span className="text-[10px] text-battle-muted font-mono uppercase block">PLAYER</span>
              <span className="font-broadcast font-bold text-white text-base">{item?.name}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-battle-muted font-mono uppercase block">ORIGINAL BASE PRICE</span>
              <span className="font-mono font-black text-amber-400 text-base">
                {formatCurrency(basePrice, currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-battle-muted font-mono uppercase block">LAST ACCEPTED BIDDER</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-lg">{team?.logo || '🛡️'}</span>
                <span className="font-broadcast font-bold text-sm" style={{ color: team?.color }}>
                  {team?.name}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-battle-muted font-mono uppercase block">HIGHEST BID REACHED</span>
              <span className="font-mono font-bold text-battle-muted text-xs line-through">
                {formatCurrency(highestBid, currency)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-battle-border text-xs text-battle-text leading-relaxed">
            <strong className="text-white" style={{ color: team?.color }}>{team?.name}</strong> will acquire this player at the original base price of{' '}
            <strong className="text-amber-400 font-mono">{formatCurrency(basePrice, currency)}</strong>.
          </div>
        </div>

        {/* Action Question & Buttons */}
        <p className="text-xs font-broadcast font-bold text-battle-muted uppercase tracking-wider mb-4">
          Confirm special settlement?
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="secondary"
            size="lg"
            onClick={onCancel}
            className="w-full font-broadcast text-xs font-bold border-battle-border hover:border-battle-borderLight text-battle-muted hover:text-white py-3"
          >
            <XCircle className="w-4 h-4 mr-1.5" />
            <span>Cancel</span>
          </Button>

          <Button
            variant="accent"
            size="lg"
            onClick={onConfirm}
            className="w-full font-broadcast text-xs font-bold bg-brand-orange hover:bg-orange-600 text-black shadow-glow-orange py-3"
          >
            <Gavel className="w-4 h-4 mr-1.5 fill-current" />
            <span>Confirm Settlement</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
