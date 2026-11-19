import React from 'react';
import { usePartyGame } from '../../context/PartyGameContext';
import { DumbCharadesSetup } from './views/DumbCharadesSetup';
import { WhoAmISetup } from './views/WhoAmISetup';
import { createDumbCharadesTournament } from '../../services/party/dumbCharadesEngine';

export const PartyGameLobby = () => {
  const {
    selectedGame,
    setActivePlayers,
    returnToArenaHome,
    setPartyView,
  } = usePartyGame();

  if (selectedGame?.id === 'party_who_am_i') {
    return (
      <WhoAmISetup
        onLaunchTournament={(config) => {
          if (config?.selectedTeams) {
            setActivePlayers(config.selectedTeams);
          }
          setPartyView('playing');
        }}
        onBack={returnToArenaHome}
      />
    );
  }

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
