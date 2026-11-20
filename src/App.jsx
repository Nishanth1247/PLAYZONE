import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import { PartyGameProvider, usePartyGame } from './context/PartyGameContext';
import { BattleArenaProvider, useBattleArena } from './context/BattleArenaContext';
import { Navbar } from './components/common/Navbar';
import { Home } from './components/landing/Home';
import { SetupWizard } from './components/setup/SetupWizard';
import { LiveAuction } from './components/auction/LiveAuction';
import { TeamDashboard } from './components/teams/TeamDashboard';
import { UnsoldManager } from './components/unsold/UnsoldManager';
import { ResultsScreen } from './components/results/ResultsScreen';
import { PartyArenaHome } from './components/party/PartyArenaHome';
import { PartyGameLobby } from './components/party/PartyGameLobby';
import { PartyGameRunner } from './components/party/PartyGameRunner';
import { PartyResultsScreen } from './components/party/PartyResultsScreen';
import { BattleArenaManager } from './components/battle/BattleArenaManager';
import { GameRules } from './components/rules/GameRules';
import { FranchiseManager } from './components/franchise/FranchiseManager';
import { TournamentHub } from './components/tournaments/TournamentHub';
import { GAME_REGISTRY } from './services/party/gameRegistry';
import { Toaster } from './components/ui/Toaster';
import { WifiOff, Heart, BookOpen } from 'lucide-react';

const MainContent = ({ platformMode, setPlatformMode, rulesTab, setRulesTab, previousMode }) => {
  const { activePage, setActivePage, launchHubTournament } = useAuction();
  const { launchBattleHubTournament } = useBattleArena();
  const { partyView, openGameLobby } = usePartyGame();

  return (
    <main className="flex-1 pb-12">
      {platformMode === 'tournaments' ? (
        <div key="tournament_hub" className="transition-opacity duration-300">
          <TournamentHub
            onNavigateToArena={(arena, tournament) => {
              if (arena === 'auction') {
                if (tournament) {
                  launchHubTournament(tournament);
                } else {
                  setActivePage('setup');
                }
                setPlatformMode('auction');
              } else if (arena === 'battle') {
                if (tournament) {
                  launchBattleHubTournament(tournament);
                }
                setPlatformMode('battle');
              } else if (arena === 'party') {
                setPlatformMode('party');
              }
            }}
          />
        </div>
      ) : platformMode === 'rules' ? (
        <div key={`rules_${rulesTab}`} className="transition-opacity duration-300">
          <GameRules
            initialTab={rulesTab}
            onClose={() => setPlatformMode(previousMode || 'auction')}
            onNavigateToGame={(game) => {
              if (game === 'auction') {
                setPlatformMode('auction');
                setActivePage('setup');
              } else if (game === 'battle') {
                setPlatformMode('battle');
              } else if (game === 'charades') {
                setPlatformMode('party');
                const charadesGame = GAME_REGISTRY.find(g => g.id === 'party_dumb_charades');
                if (charadesGame) openGameLobby(charadesGame);
              } else if (game === 'whoami') {
                setPlatformMode('party');
                const whoAmIGame = GAME_REGISTRY.find(g => g.id === 'party_who_am_i');
                if (whoAmIGame) openGameLobby(whoAmIGame);
              }
            }}
          />
        </div>
      ) : platformMode === 'franchises' ? (
        <div key="franchise_manager" className="transition-opacity duration-300">
          <FranchiseManager onNavigateToArena={(arena) => setPlatformMode(arena || 'auction')} />
        </div>
      ) : platformMode === 'party' ? (
        <div key={`party_${partyView}`} className="transition-opacity duration-300">
          {partyView === 'arena' && (
            <PartyArenaHome onSwitchToAuction={() => setPlatformMode('auction')} />
          )}
          {partyView === 'lobby' && <PartyGameLobby />}
          {partyView === 'playing' && <PartyGameRunner />}
          {partyView === 'results' && <PartyResultsScreen />}
        </div>
      ) : platformMode === 'battle' ? (
        <div key="battle_arena" className="transition-opacity duration-300">
          <BattleArenaManager
            onSwitchToAuction={() => setPlatformMode('auction')}
            onSwitchToParty={() => setPlatformMode('party')}
          />
        </div>
      ) : (
        <div key={`auction_${activePage}`} className="transition-opacity duration-300">
          {activePage === 'home' && (
            <Home onSwitchToParty={() => setPlatformMode('party')} />
          )}
          {activePage === 'setup' && <SetupWizard />}
          {activePage === 'live' && <LiveAuction />}
          {activePage === 'teams' && <TeamDashboard />}
          {activePage === 'unsold' && <UnsoldManager />}
          {activePage === 'results' && <ResultsScreen />}
        </div>
      )}
    </main>
  );
};

export function AppContent() {
  const [platformMode, setPlatformMode] = useState('party'); // 'party' | 'auction' | 'battle' | 'rules'
  const [previousMode, setPreviousMode] = useState('party');
  const [rulesTab, setRulesTab] = useState('auction');

  React.useEffect(() => {
    const handleOpenRules = (e) => {
      if (platformMode !== 'rules' && platformMode !== 'franchises') {
        setPreviousMode(platformMode);
      }
      setRulesTab(e.detail?.tab || 'auction');
      setPlatformMode('rules');
    };

    const handleOpenFranchises = () => {
      if (platformMode !== 'rules' && platformMode !== 'franchises') {
        setPreviousMode(platformMode);
      }
      setPlatformMode('franchises');
    };

    const handleOpenTournaments = () => {
      if (platformMode !== 'rules' && platformMode !== 'tournaments') {
        setPreviousMode(platformMode);
      }
      setPlatformMode('tournaments');
    };

    window.addEventListener('bidbattle_open_rules', handleOpenRules);
    window.addEventListener('bidbattle_open_franchises', handleOpenFranchises);
    window.addEventListener('bidbattle_open_tournaments', handleOpenTournaments);
    return () => {
      window.removeEventListener('bidbattle_open_rules', handleOpenRules);
      window.removeEventListener('bidbattle_open_franchises', handleOpenFranchises);
      window.removeEventListener('bidbattle_open_tournaments', handleOpenTournaments);
    };
  }, [platformMode]);

  const handleModeChange = (mode) => {
    if (mode === 'rules') {
      if (platformMode !== 'rules') {
        setPreviousMode(platformMode);
      }
      setPlatformMode('rules');
    } else {
      setPlatformMode(mode);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-[#F5F3EE] flex flex-col font-sans selection:bg-[#D97858] selection:text-[#F5F3EE] relative">
      <Navbar 
        platformMode={platformMode} 
        setPlatformMode={handleModeChange} 
      />
      <MainContent 
        platformMode={platformMode} 
        setPlatformMode={handleModeChange}
        rulesTab={rulesTab}
        setRulesTab={setRulesTab}
        previousMode={previousMode}
      />
      <Toaster />

      {/* Global Footer */}
      <footer className="border-t border-[#39465A] bg-[#111827] py-4 px-6 text-center text-xs text-[#AEB9CC] print:hidden">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-heading tracking-wide">
            <span className="font-bold text-[#F5F3EE]">BIDBATTLE</span>
            <span>•</span>
            <span className="text-[#AEB9CC]">Auction & Battle Arena</span>
            <span>•</span>
            <span className="text-[#AEB9CC]">Party Game Showdown</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (platformMode !== 'rules') setPreviousMode(platformMode);
                setPlatformMode('rules');
              }}
              className="flex items-center gap-1.5 text-[11px] text-[#D4B879] hover:text-[#F5F3EE] font-semibold font-heading tracking-wider transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              OFFICIAL RULEBOOKS
            </button>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-[11px] text-[#AEB9CC] font-semibold font-heading tracking-wider">
              <WifiOff className="w-3.5 h-3.5 text-[#AEB9CC]" />
              100% PASS-AND-PLAY OFFLINE
            </span>
            <span>•</span>
            <span className="text-[#AEB9CC]">1 Laptop • 2–4 Friends • Zero Login</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AuctionProvider>
      <PartyGameProvider>
        <BattleArenaProvider>
          <AppContent />
        </BattleArenaProvider>
      </PartyGameProvider>
    </AuctionProvider>
  );
}

export default App;
