import React from 'react';
import { usePartyGame } from '../../context/PartyGameContext';
import { DumbCharadesView } from './views/DumbCharadesView';

export const PartyGameRunner = () => {
  const { setPartyView } = usePartyGame();

  // Dumb Charades 2.0 Official Party Arena Game View
  return <DumbCharadesView onExitToSetup={() => setPartyView('lobby')} />;
};
