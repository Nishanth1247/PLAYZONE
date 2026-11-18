import React from 'react';
import { DumbCharadesArena } from './DumbCharadesArena';
import { usePartyGame } from '../../../context/PartyGameContext';

export const DumbCharadesView = ({ onExitToSetup }) => {
  const { setPartyView } = usePartyGame();
  const handleExit = onExitToSetup || (() => setPartyView('lobby'));

  return <DumbCharadesArena onExitToSetup={handleExit} />;
};
