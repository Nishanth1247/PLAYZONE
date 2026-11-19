import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import { PartyGameProvider, usePartyGame } from './context/PartyGameContext';
import { BattleArenaProvider } from './context/BattleArenaContext';
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
import { Toaster } from './components/ui/Toaster';
import { WifiOff, Heart } from 'lucide-react';

const MainContent = ({ platformMode, setPlatformMode }) => {
  const { activePage } = useAuction();
  const { partyView } = usePartyGame();

  return (
    <main className="flex-1 pb-12">
      {platformMode === 'party' ? (
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
  const [platformMode, setPlatformMode] = useState('party'); // 'party' | 'auction' | 'battle'

  return (
    <div className="min-h-screen bg-battle-bg text-battle-text flex flex-col font-sans selection:bg-brand-purple selection:text-white relative">
      <Navbar platformMode={platformMode} setPlatformMode={setPlatformMode} />
      <MainContent platformMode={platformMode} setPlatformMode={setPlatformMode} />
      <Toaster />

      {/* Global Footer */}
      <footer className="border-t border-[#303030] bg-[#090909] py-4 px-6 text-center text-xs text-[#737373] print:hidden">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-heading tracking-wide">
            <span className="font-bold text-[#F2F2F0]">BIDBATTLE</span>
            <span>•</span>
            <span className="text-[#A3A3A3]">Auction & Battle Arena</span>
            <span>•</span>
            <span className="text-[#737373]">Party Game Showdown</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px] text-[#A3A3A3] font-semibold font-heading tracking-wider">
              <WifiOff className="w-3.5 h-3.5 text-[#A3A3A3]" />
              100% PASS-AND-PLAY OFFLINE
            </span>
            <span>•</span>
            <span className="text-[#737373]">1 Laptop • 2–4 Friends • Zero Login</span>
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
