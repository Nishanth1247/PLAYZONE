import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gavel, 
  Swords, 
  Gamepad2, 
  HelpCircle, 
  Play, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Shield, 
  Coins, 
  Users, 
  Trophy, 
  Clock, 
  Flame, 
  Sparkles, 
  Lock, 
  Eye, 
  EyeOff, 
  Zap, 
  Info,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const openGameRules = (tab = 'auction') => {
  window.dispatchEvent(new CustomEvent('bidbattle_open_rules', { detail: { tab } }));
};

export const GameRules = ({ initialTab = 'auction', onClose, onNavigateToGame }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'auction', label: 'Auction Arena', icon: Gavel, subtitle: 'Franchise Bidding & Squad Assembly' },
    { id: 'battle', label: 'Battle Arena', icon: Swords, subtitle: 'Tactical Draft & Combat Clash' },
    { id: 'charades', label: 'Dumb Charades', icon: FilmIconFallback, subtitle: 'Silent Acting & Pass-the-Screen' },
    { id: 'whoami', label: 'Who Am I?', icon: HelpCircle, subtitle: 'Mystery Persona & 20 Questions' },
  ];

  return (
    <div className="min-h-screen bg-[#111827] text-[#F5F3EE] font-sans pb-20 selection:bg-[#D97858] selection:text-[#F5F3EE]">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-[#39465A] bg-[#222F43]/80 backdrop-blur-md sticky top-16 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onClose && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                className="font-heading text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return</span>
              </Button>
            )}
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-[#2C394C] border border-[#39465A] text-[#D4B879]">
                <BookOpen className="w-4 h-4" />
              </span>
              <div>
                <h1 className="font-heading text-xl sm:text-2xl font-black text-[#F5F3EE] tracking-tight">
                  OFFICIAL RULEBOOKS
                </h1>
                <p className="text-xs text-[#AEB9CC]">
                  Pass-and-play local multiplayer competition guidelines & mechanics
                </p>
              </div>
            </div>
          </div>

          {/* Quick tab switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-xl bg-[#111827] border border-[#39465A]">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-heading font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#D97858] text-[#F5F3EE] shadow-md'
                      : 'text-[#AEB9CC] hover:text-[#F5F3EE] hover:bg-[#222F43]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'auction' && (
            <motion.div
              key="auction"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AuctionRulesSection onPlay={() => onNavigateToGame?.('auction')} />
            </motion.div>
          )}

          {activeTab === 'battle' && (
            <motion.div
              key="battle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <BattleRulesSection onPlay={() => onNavigateToGame?.('battle')} />
            </motion.div>
          )}

          {activeTab === 'charades' && (
            <motion.div
              key="charades"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CharadesRulesSection onPlay={() => onNavigateToGame?.('charades')} />
            </motion.div>
          )}

          {activeTab === 'whoami' && (
            <motion.div
              key="whoami"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <WhoAmIRulesSection onPlay={() => onNavigateToGame?.('whoami')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Fallback icon for charades
function FilmIconFallback(props) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18"/>
      <line x1="7" x2="7" y1="2" y2="22"/>
      <line x1="17" x2="17" y1="2" y2="22"/>
      <line x1="2" x2="22" y1="12" y2="12"/>
      <line x1="2" x2="7" y1="7" y2="7"/>
      <line x1="2" x2="7" y1="17" y2="17"/>
      <line x1="17" x2="22" y1="17" y2="17"/>
      <line x1="17" x2="22" y1="7" y2="7"/>
    </svg>
  );
}

// ==========================================
// 3.1 AUCTION ARENA RULEBOOK
// ==========================================
const AuctionRulesSection = ({ onPlay }) => {
  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="bg-[#222F43] rounded-3xl p-6 sm:p-8 border border-[#39465A] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2C394C] border border-[#39465A] text-xs font-mono text-[#D4B879]">
            <Gavel className="w-3.5 h-3.5 text-[#D97858]" />
            <span>BIDBATTLE RULEBOOK 3.1</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#F5F3EE] tracking-tight">
            AUCTION ARENA RULES
          </h2>
          <p className="text-sm text-[#AEB9CC] leading-relaxed">
            Assemble the highest-rated squad within budget limits through dynamic pass-and-play live bidding. Out-strategize opposing franchises, manage purse inflation, and exploit mandatory settlements.
          </p>
        </div>

        {onPlay && (
          <Button
            variant="primary"
            size="lg"
            onClick={onPlay}
            className="flex-shrink-0 font-heading text-sm px-6 py-3 flex items-center gap-2 shadow-lg"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>PLAY AUCTION ARENA</span>
          </Button>
        )}
      </div>

      {/* Grid of Rule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 1. Objective & Team Count */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              1
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Objective & Team Setup
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            Every participating manager competes to assemble the strongest total roster before the talent pool is exhausted.
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#F5F3EE]/90">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#91A98B] flex-shrink-0 mt-0.5" />
              <span><strong>Team Capacity:</strong> Supports 2, 3, or 4 active franchises per tournament (Nishanth, Ajmal, Praneeth, Nagulan).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#91A98B] flex-shrink-0 mt-0.5" />
              <span><strong>Squad Limits:</strong> Configurable target squad size (standard 3 to 15 slots). Every squad slot must be filled by tournament end.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#91A98B] flex-shrink-0 mt-0.5" />
              <span><strong>Starting Purse:</strong> Each franchise begins with an identical budget (e.g. 100 Cr / $100M / 100 Coins).</span>
            </li>
          </ul>
        </div>

        {/* 2. Hidden Ratings During Bidding */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              2
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Strict Rating Concealment
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            To ensure genuine scouting instinct and prevent robotic mathematical bidding, player ratings are completely locked during active bidding.
          </p>
          <div className="p-3.5 rounded-xl bg-[#2C394C] border border-[#39465A] space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D4B879]">
              <Lock className="w-3.5 h-3.5" />
              <span>RATING CONCEALMENT PROTOCOL</span>
            </div>
            <p className="text-xs text-[#AEB9CC] leading-relaxed">
              Official player ratings, tier rankings, and hidden power scores remain masked across the spotlight card, queue drawer, search bar, and franchise sidebars. Ratings are unveiled exclusively on the final Championship Podium!
            </p>
          </div>
        </div>

        {/* 3. Bidding Mechanics & Progressive Increments */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              3
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Bidding & Increments
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            Each player is introduced at their Base Price. Any franchise can place a bid, establishing themselves as the Live Leader.
          </p>
          <div className="overflow-hidden rounded-xl border border-[#39465A] bg-[#111827]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#2C394C] text-[#AEB9CC] border-b border-[#39465A]">
                <tr>
                  <th className="px-3 py-2">Current Bid Tier</th>
                  <th className="px-3 py-2">Increment Step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#39465A]/40 text-[#F5F3EE]">
                <tr>
                  <td className="px-3 py-2">Under 2.0 Cr</td>
                  <td className="px-3 py-2 text-[#91A98B] font-bold">+0.20 Cr</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">2.0 Cr to 5.0 Cr</td>
                  <td className="px-3 py-2 text-[#91A98B] font-bold">+0.50 Cr</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">5.0 Cr to 10.0 Cr</td>
                  <td className="px-3 py-2 text-[#91A98B] font-bold">+1.00 Cr</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">Above 10.0 Cr</td>
                  <td className="px-3 py-2 text-[#91A98B] font-bold">+2.00 Cr</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Mandatory Last-Bidder Settlement */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              4
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Mandatory Last-Bidder Settlement
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            The platform enforces solvency and guarantees every team can complete their squad:
          </p>
          <div className="p-3.5 rounded-xl bg-[#2C394C] border border-[#D97858]/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#D97858]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>THE PURSE PRESERVATION RULE</span>
            </div>
            <p className="text-xs text-[#F5F3EE] leading-relaxed font-sans">
              A franchise cannot place a bid that leaves them with less purse than required to buy their remaining unfilled squad slots at base price (1.0 Cr per player).
            </p>
            <div className="text-[11px] font-mono bg-[#111827] p-2 rounded-lg text-[#AEB9CC] border border-[#39465A]">
              <strong>Example:</strong> Team has 3 slots remaining and 12 Cr purse. Maximum allowed single bid = 12 - (2 slots × 1.0 Cr) = <strong>10.0 Cr</strong>.
            </div>
          </div>
        </div>

        {/* 5. Unsold Player Management */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              5
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Unsold Pool & Recalls
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            If no franchise places a bid before the timer expires or if the Host marks a player Passed, they enter the Unsold Pool.
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-[#AEB9CC]">
            <li className="flex items-start gap-2">
              <span className="text-[#D4B879]">•</span>
              <span>Unsold players can be reviewed at any time via the <strong>Unsold Pool</strong> tab.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4B879]">•</span>
              <span>After round completion, the Host can re-introduce unsold players back onto the auction block at base price or at a discounted reserve.</span>
            </li>
          </ul>
        </div>

        {/* 6. Scoring & 6-Tier Tiebreaker Podium */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              6
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Championship Podium & 6-Tier Tiebreaker
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            When all squads are filled, the auction concludes and final standings are ranked strictly by:
          </p>
          <ol className="space-y-1.5 text-xs font-mono text-[#F5F3EE]">
            <li className="flex items-center gap-2 p-1.5 rounded bg-[#2C394C]">
              <span className="text-[#D4B879] font-bold">#1</span>
              <span>Total Squad Rating (Sum of acquired player ratings)</span>
            </li>
            <li className="flex items-center gap-2 p-1.5 rounded bg-[#2C394C]">
              <span className="text-[#AEB9CC] font-bold">#2</span>
              <span>Remaining Purse (Higher remaining balance wins tie)</span>
            </li>
            <li className="flex items-center gap-2 p-1.5 rounded bg-[#2C394C]">
              <span className="text-[#AEB9CC] font-bold">#3</span>
              <span>Squad Slot Completion (Fulfilled roster requirements)</span>
            </li>
            <li className="flex items-center gap-2 p-1.5 rounded bg-[#2C394C]">
              <span className="text-[#AEB9CC] font-bold">#4</span>
              <span>Top Star Player (Highest single rating in squad)</span>
            </li>
            <li className="flex items-center gap-2 p-1.5 rounded bg-[#2C394C]">
              <span className="text-[#AEB9CC] font-bold">#5</span>
              <span>Cost Efficiency (Rating generated per Cr spent)</span>
            </li>
            <li className="flex items-center gap-2 p-1.5 rounded bg-[#2C394C]">
              <span className="text-[#AEB9CC] font-bold">#6</span>
              <span>Earliest Completion Timestamp</span>
            </li>
          </ol>
        </div>

      </div>
    </div>
  );
};

// ==========================================
// 3.2 BATTLE ARENA RULEBOOK
// ==========================================
const BattleRulesSection = ({ onPlay }) => {
  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="bg-[#222F43] rounded-3xl p-6 sm:p-8 border border-[#39465A] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2C394C] border border-[#39465A] text-xs font-mono text-[#D4B879]">
            <Swords className="w-3.5 h-3.5 text-[#D97858]" />
            <span>BIDBATTLE RULEBOOK 3.2</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#F5F3EE] tracking-tight">
            BATTLE ARENA RULES
          </h2>
          <p className="text-sm text-[#AEB9CC] leading-relaxed">
            A high-stakes two-stage tactical tournament: First draft your combat roster in a blind-rating auction, then secretly deploy your fighters behind the pass-and-play Privacy Shield.
          </p>
        </div>

        {onPlay && (
          <Button
            variant="primary"
            size="lg"
            onClick={onPlay}
            className="flex-shrink-0 font-heading text-sm px-6 py-3 flex items-center gap-2 shadow-lg"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>PLAY BATTLE ARENA</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Round 1: Auction Stage */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              1
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Round 1: Fighter Auction Stage
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            Franchises bid against each other to assemble their squad of fighters.
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#F5F3EE]/90">
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-[#D97858] flex-shrink-0 mt-0.5" />
              <span><strong>Hidden Combat Ratings:</strong> Fighters' true power stats and combat ratings remain hidden during bidding. You must judge by lore, prestige, and tier hints.</span>
            </li>
            <li className="flex items-start gap-2">
              <Coins className="w-4 h-4 text-[#D4B879] flex-shrink-0 mt-0.5" />
              <span><strong>Budget Management:</strong> Conserve enough funds to guarantee you secure your required lineup spots.</span>
            </li>
          </ul>
        </div>

        {/* Round 2: Tactical Draft & Privacy Shield */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              2
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Round 2: Secret Tactical Draft
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            Prior to battle, each franchise privately plans their head-to-head match deployment order on the shared laptop.
          </p>
          <div className="p-3.5 rounded-xl bg-[#2C394C] border border-[#39465A] space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D4B879]">
              <EyeOff className="w-3.5 h-3.5" />
              <span>PASS-THE-LAPTOP PRIVACY SHIELD</span>
            </div>
            <p className="text-xs text-[#AEB9CC] leading-relaxed">
              When it's your franchise's turn, click "Unlock Lineup Shield" to assign your fighters to Bout 1, Bout 2, Bout 3. Once finished, click "Lock Lineup & Pass Device" to obscure your board before handing the laptop to the next franchise!
            </p>
          </div>
        </div>

        {/* Combat Resolution */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              3
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Sequential Bout Reveals & Combat
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            Once all lineups are locked, the tournament enters the live Arena!
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-[#F5F3EE]/90">
            <li className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-[#D4B879] flex-shrink-0 mt-0.5" />
              <span><strong>Dramatic Countdown:</strong> Each bout initiates a 3-2-1 reveal sequence where both secret combatants are exposed simultaneously.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#91A98B] flex-shrink-0 mt-0.5" />
              <span><strong>Rating Resolution:</strong> The fighter with higher official combat power wins the bout. If ratings are identical, the bout is ruled a Stalemate / Draw.</span>
            </li>
          </ul>
        </div>

        {/* Scoring & Tournament Standings */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              4
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Scoring System & Championship
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            Tournament standings update live across every match series:
          </p>
          <div className="grid grid-cols-3 gap-2.5 font-mono text-center text-xs">
            <div className="p-3 rounded-xl bg-[#2C394C] border border-[#91A98B]/50">
              <span className="block text-xl font-bold text-[#91A98B]">3 PTS</span>
              <span className="text-[#AEB9CC]">Match Win</span>
            </div>
            <div className="p-3 rounded-xl bg-[#2C394C] border border-[#D4B879]/50">
              <span className="block text-xl font-bold text-[#D4B879]">1 PT</span>
              <span className="text-[#AEB9CC]">Draw</span>
            </div>
            <div className="p-3 rounded-xl bg-[#2C394C] border border-[#39465A]">
              <span className="block text-xl font-bold text-[#AEB9CC]">0 PTS</span>
              <span className="text-[#AEB9CC]">Loss</span>
            </div>
          </div>
          <p className="text-xs text-[#AEB9CC]">
            Ties in table points are broken by Total Bout Differential (+/-), followed by Total Combat Power.
          </p>
        </div>

      </div>
    </div>
  );
};

// ==========================================
// 3.3 DUMB CHARADES RULEBOOK
// ==========================================
const CharadesRulesSection = ({ onPlay }) => {
  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="bg-[#222F43] rounded-3xl p-6 sm:p-8 border border-[#39465A] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2C394C] border border-[#39465A] text-xs font-mono text-[#D4B879]">
            <FilmIconFallback className="w-3.5 h-3.5 text-[#D97858]" />
            <span>BIDBATTLE RULEBOOK 3.3</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#F5F3EE] tracking-tight">
            DUMB CHARADES RULES
          </h2>
          <p className="text-sm text-[#AEB9CC] leading-relaxed">
            Silent party showdown on a single screen! Act out movies, shows, anime, and games without uttering a single sound. Hand off the screen privately and race against the live timer.
          </p>
        </div>

        {onPlay && (
          <Button
            variant="primary"
            size="lg"
            onClick={onPlay}
            className="flex-shrink-0 font-heading text-sm px-6 py-3 flex items-center gap-2 shadow-lg"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>PLAY DUMB CHARADES</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Turn Structure & Privacy */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              1
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Pass-the-Screen Secrecy
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            Play rotates smoothly between 2, 3, or 4 teams:
          </p>
          <ol className="space-y-2 text-xs sm:text-sm text-[#F5F3EE]/90">
            <li className="flex items-start gap-2">
              <span className="font-mono text-[#D4B879] font-bold">1.</span>
              <span><strong>The Handoff:</strong> When your turn begins, take the laptop so only the Actor can see the screen.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono text-[#D4B879] font-bold">2.</span>
              <span><strong>Reveal Secret Prompt:</strong> Tap "Reveal Title". Study the title, category, and difficulty before starting.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono text-[#D4B879] font-bold">3.</span>
              <span><strong>Start Acting:</strong> Tap "Start Timer" and begin acting immediately. Turn the laptop away from teammates!</span>
            </li>
          </ol>
        </div>

        {/* Acting Restrictions */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              2
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Acting Restrictions
            </h3>
          </div>
          <div className="p-3.5 rounded-xl bg-[#2C394C] border border-[#D97858]/40 space-y-2">
            <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#D97858]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>STRICT SILENCE CODE</span>
            </div>
            <ul className="space-y-1.5 text-xs text-[#AEB9CC]">
              <li>❌ <strong>Zero Speaking:</strong> No talking, whispering, hums, or sound effects.</li>
              <li>❌ <strong>No Lip Syncing:</strong> Do not mouth words or shape syllables silently.</li>
              <li>❌ <strong>No Air Spelling:</strong> Do not draw letters in the air or point to physical letters in the room.</li>
              <li>✅ <strong>Gestures Only:</strong> Use hand signs (e.g. 3 words, 2nd word, rhyming with...).</li>
            </ul>
          </div>
        </div>

        {/* Controls & Scoring */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              3
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Gameplay Action Controls
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            The Actor or teammate records the outcome directly on the screen:
          </p>
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#2C394C] border border-[#91A98B]/40">
              <span className="text-[#91A98B] font-bold">CORRECT (Green)</span>
              <span className="text-[#F5F3EE]">Guessed accurately (+100 pts + Time Bonus)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#2C394C] border border-[#D4B879]/40">
              <span className="text-[#D4B879] font-bold">SKIP (Yellow)</span>
              <span className="text-[#AEB9CC]">Pass difficult title (1 skip per round)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#2C394C] border border-[#39465A]">
              <span className="text-[#AEB9CC] font-bold">NOT FOUND / TIME OUT</span>
              <span className="text-[#AEB9CC]">Timer reached 0s without answer</span>
            </div>
          </div>
        </div>

        {/* Streaks & Time Bonuses */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              4
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Streaks & Dynamic Bonuses
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            Fast guessing and accuracy multiply your team's score:
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#F5F3EE]/90">
            <li className="flex items-start gap-2">
              <Flame className="w-4 h-4 text-[#D97858] flex-shrink-0 mt-0.5" />
              <span><strong>Hot Streaks:</strong> 3 consecutive correct turns activates a 1.5x multiplier. 5 streaks unlock a 2x bonus!</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#D4B879] flex-shrink-0 mt-0.5" />
              <span><strong>Speed Bonus:</strong> Solving the title in under 15 seconds awards +50 lightning points.</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};

// ==========================================
// 3.4 WHO AM I? RULEBOOK
// ==========================================
const WhoAmIRulesSection = ({ onPlay }) => {
  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="bg-[#222F43] rounded-3xl p-6 sm:p-8 border border-[#39465A] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2C394C] border border-[#39465A] text-xs font-mono text-[#D4B879]">
            <HelpCircle className="w-3.5 h-3.5 text-[#D97858]" />
            <span>BIDBATTLE RULEBOOK 3.4</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#F5F3EE] tracking-tight">
            WHO AM I? RULES
          </h2>
          <p className="text-sm text-[#AEB9CC] leading-relaxed">
            The classic mystery identity deduction party game. The active guesser sits facing away from the screen, interrogating friends with rapid-fire Yes/No questions.
          </p>
        </div>

        {onPlay && (
          <Button
            variant="primary"
            size="lg"
            onClick={onPlay}
            className="flex-shrink-0 font-heading text-sm px-6 py-3 flex items-center gap-2 shadow-lg"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>PLAY WHO AM I?</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Guesser Positioning */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              1
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Guesser Positioning & Setup
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            Perfect physical setup is essential for fair play:
          </p>
          <div className="p-3.5 rounded-xl bg-[#2C394C] border border-[#39465A] space-y-2">
            <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#D4B879]">
              <EyeOff className="w-3.5 h-3.5" />
              <span>FACING AWAY FROM SCREEN</span>
            </div>
            <p className="text-xs text-[#AEB9CC] leading-relaxed">
              The active player whose identity is being guessed must sit <strong>facing away from the laptop</strong> or cover their eyes while the secret persona card is revealed to the rest of the room.
            </p>
          </div>
        </div>

        {/* Question Format */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              2
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Binary Questioning Format
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            The guesser asks strictly binary questions to narrow down traits:
          </p>
          <div className="space-y-1.5 text-xs font-sans text-[#F5F3EE]">
            <div className="p-2 rounded bg-[#2C394C]">
              <strong>Allowed:</strong> "Am I a real human?", "Am I fictional?", "Am I still alive?", "Am I an athlete?"
            </div>
            <div className="p-2 rounded bg-[#2C394C] text-[#AEB9CC]">
              <strong>Prohibited:</strong> "What movie am I from?", "What is my first letter?", "How old am I?"
            </div>
          </div>
        </div>

        {/* Room Responses */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              3
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Audience Response Controls
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            The audience answers truthfully by tapping the live tracker:
          </p>
          <div className="grid grid-cols-3 gap-2 font-mono text-center text-xs">
            <div className="p-2.5 rounded-lg bg-[#2C394C] border border-[#91A98B]/50">
              <span className="text-[#91A98B] font-bold block">YES</span>
              <span className="text-[10px] text-[#AEB9CC]">Affirmative</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#2C394C] border border-rose-500/50">
              <span className="text-rose-400 font-bold block">NO</span>
              <span className="text-[10px] text-[#AEB9CC]">Negative</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#2C394C] border border-[#D4B879]/50">
              <span className="text-[#D4B879] font-bold block">MAYBE</span>
              <span className="text-[10px] text-[#AEB9CC]">Contextual</span>
            </div>
          </div>
        </div>

        {/* Scoring & Hints */}
        <div className="bg-[#222F43] rounded-2xl p-6 border border-[#39465A] space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#2C394C] border border-[#39465A] flex items-center justify-center font-heading font-black text-sm text-[#D97858]">
              4
            </span>
            <h3 className="font-heading text-lg font-bold text-[#F5F3EE]">
              Hints, Limits & Scoring
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            Each round balances questions asked against the clock:
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#F5F3EE]/90">
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#D4B879] flex-shrink-0 mt-0.5" />
              <span><strong>Progressive Hints:</strong> Up to 3 tiered hints can be unlocked if stuck (cost: -20 pts per hint).</span>
            </li>
            <li className="flex items-start gap-2">
              <Trophy className="w-4 h-4 text-[#91A98B] flex-shrink-0 mt-0.5" />
              <span><strong>Efficiency Bonus:</strong> Solving the identity within 10 questions awards a Master Deduction bonus.</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};
