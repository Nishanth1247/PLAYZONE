import React from 'react';
import { usePartyGame } from '../../context/PartyGameContext';
import { DumbCharadesSetup } from './views/DumbCharadesSetup';
import { createDumbCharadesTournament } from '../../services/party/dumbCharadesEngine';

export const PartyGameLobby = () => {
  const {
    setActivePlayers,
    returnToArenaHome,
    setPartyView,
  } = usePartyGame();

  return (
    <DumbCharadesSetup
      onLaunchTournament={(config) => {
        if (!config?.isResume) {
          createDumbCharadesTournament(config);
          setActivePlayers(config.selectedTeams);
        }
        setPartyView('playing');
      }}
      onBack={returnToArenaHome}
    />
  );
};
