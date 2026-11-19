import React from 'react';
import { useBattleArena } from '../../context/BattleArenaContext';
import { BattleArenaHome } from './BattleArenaHome';
import { BattleAuctionStage } from './BattleAuctionStage';
import { BattleRosterConfirm } from './BattleRosterConfirm';
import { BattleTransitionModal } from './BattleTransitionModal';
import { TacticalDraftBoard } from './TacticalDraftBoard';
import { BattleArenaMatch } from './BattleArenaMatch';
import { BattleResultsScreen } from './BattleResultsScreen';

export const BattleArenaManager = ({ onSwitchToAuction, onSwitchToParty }) => {
  const { battleState } = useBattleArena();

  switch (battleState.phase) {
    case 'setup':
      return (
        <BattleArenaHome
          onSwitchToAuction={onSwitchToAuction}
          onSwitchToParty={onSwitchToParty}
        />
      );
    case 'auction':
      return <BattleAuctionStage />;
    case 'roster_confirm':
      return <BattleRosterConfirm />;
    case 'transition':
      return <BattleTransitionModal />;
    case 'battles':
      // Render Tactical Draft Board until both lineups are locked and active battles are started
      if (!battleState.tacticalDraft?.isLocked || battleState.tacticalDraft?.draftStage !== 'active_matches') {
        return <TacticalDraftBoard />;
      }
      return <BattleArenaMatch />;
    case 'results':
      return <BattleResultsScreen onReturnHome={onSwitchToAuction} />;
    default:
      return (
        <BattleArenaHome
          onSwitchToAuction={onSwitchToAuction}
          onSwitchToParty={onSwitchToParty}
        />
      );
  }
};
