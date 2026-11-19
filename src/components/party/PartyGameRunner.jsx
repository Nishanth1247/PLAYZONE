import React from 'react';
import { usePartyGame } from '../../context/PartyGameContext';
import { DumbCharadesView } from './views/DumbCharadesView';
import { WhoAmIArena } from './views/WhoAmIArena';

export const PartyGameRunner = () => {
  const { selectedGame, setPartyView } = usePartyGame();

  if (selectedGame?.id === 'party_who_am_i') {
    return <WhoAmIArena onExitToSetup={() => setPartyView('lobby')} />;
  }

  // Dumb Charades 2.0 Official Party Arena Game View
  return <DumbCharadesView onExitToSetup={() => setPartyView('lobby')} />;
};
