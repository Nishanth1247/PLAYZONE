/**
 * PLAYZONE TOURNAMENT FORMAT & CHAMPIONSHIP BRACKET ENGINE
 * Authoritative service for generating, validating, progressing, and resolving:
 * 1. League / Round Robin
 * 2. Single Elimination / Knockout (with fair byes for non-power-of-two team counts & 3rd place playoff)
 * 3. Double Elimination (Winners Bracket, Losers Bracket, Grand Final, and optional Grand Final Reset)
 * 4. Group Stage + Knockout (Multi-group round robins with qualification and linked knockout)
 * 5. Custom Tournament Format (Configurable multi-stage builder)
 *
 * Zero duplicate match execution. Pure deterministic bracket logic. Full state persistence.
 */

export const FORMAT_TYPES = {
  ROUND_ROBIN: 'round_robin',
  SINGLE_ELIMINATION: 'single_elimination',
  DOUBLE_ELIMINATION: 'double_elimination',
  GROUP_STAGE_KNOCKOUT: 'group_stage_knockout',
  CUSTOM: 'custom',
};

export const FORMAT_METADATA = {
  [FORMAT_TYPES.ROUND_ROBIN]: {
    id: FORMAT_TYPES.ROUND_ROBIN,
    name: 'League / Round Robin',
    shortDescription: 'Every franchise battles every other franchise. Consistent and comprehensive league standings.',
    supportedTeams: '2 to 12 teams (odd team counts supported with fair byes)',
    structure: 'All vs All league schedule with configurable single or double rounds',
    badge: 'LEAGUE',
    icon: 'Trophy',
  },
  [FORMAT_TYPES.SINGLE_ELIMINATION]: {
    id: FORMAT_TYPES.SINGLE_ELIMINATION,
    name: 'Single Elimination / Knockout',
    shortDescription: 'High-stakes sudden death. One loss eliminates a franchise. Advancing winners battle for the championship.',
    supportedTeams: '2 to 16 teams (fair byes for non-power-of-2 counts)',
    structure: 'Quarter-finals → Semi-finals → Final (Optional 3rd-Place Playoff)',
    badge: 'KNOCKOUT',
    icon: 'Swords',
  },
  [FORMAT_TYPES.DOUBLE_ELIMINATION]: {
    id: FORMAT_TYPES.DOUBLE_ELIMINATION,
    name: 'Double Elimination',
    shortDescription: 'Two losses required for elimination. Teams falling in Winners Bracket battle through the Losers Bracket.',
    supportedTeams: '4, 6, 8, 10 or 12 teams',
    structure: 'Winners Bracket + Losers Bracket + Grand Final (Optional Reset Final)',
    badge: 'DOUBLE ELIM',
    icon: 'Shield',
  },
  [FORMAT_TYPES.GROUP_STAGE_KNOCKOUT]: {
    id: FORMAT_TYPES.GROUP_STAGE_KNOCKOUT,
    name: 'Group Stage + Knockout',
    shortDescription: 'World-cup style. Franchises compete in round-robin groups; top qualifiers advance into single elimination.',
    supportedTeams: '4 to 16 teams (multi-group partitioning)',
    structure: 'Groups Round Robin → Knockout Bracket (Quarter/Semi/Final)',
    badge: 'HYBRID',
    icon: 'Layers',
  },
  [FORMAT_TYPES.CUSTOM]: {
    id: FORMAT_TYPES.CUSTOM,
    name: 'Custom Tournament Format',
    shortDescription: 'Tailor-made format. Design stage-by-stage progression, group configurations, and playoff matches.',
    supportedTeams: '2 to 16 teams',
    structure: 'Customizable multi-stage tournament structure',
    badge: 'CUSTOM',
    icon: 'Settings',
  },
};

/**
 * Calculates total match count estimate for a format and team count
 */
export function estimateMatchCount(format, teamCount, config = {}) {
  const n = Number(teamCount) || 4;
  if (n < 2) return 0;

  switch (format) {
    case FORMAT_TYPES.ROUND_ROBIN: {
      const singleMatches = (n * (n - 1)) / 2;
      return config.roundRobinType === 'double' ? singleMatches * 2 : singleMatches;
    }
    case FORMAT_TYPES.SINGLE_ELIMINATION: {
      const base = n - 1;
      return config.thirdPlacePlayoff ? base + 1 : base;
    }
    case FORMAT_TYPES.DOUBLE_ELIMINATION: {
      // For double elimination: 2*N - 2 matches (or 2*N - 1 if reset final occurs)
      const base = 2 * n - 2;
      return config.resetFinal ? base + 1 : base;
    }
    case FORMAT_TYPES.GROUP_STAGE_KNOCKOUT: {
      const groups = Math.max(2, config.groupCount || 2);
      const teamsPerGroup = Math.ceil(n / groups);
      const matchesPerGroup = (teamsPerGroup * (teamsPerGroup - 1)) / 2;
      const groupMatches = matchesPerGroup * groups;
      const qualified = Math.max(2, (config.qualifyCountPerGroup || 2) * groups);
      const knockoutMatches = qualified - 1 + (config.thirdPlacePlayoff ? 1 : 0);
      return groupMatches + knockoutMatches;
    }
    case FORMAT_TYPES.CUSTOM:
      return n - 1;
    default:
      return (n * (n - 1)) / 2;
  }
}

/**
 * Generates initial bracket data for any chosen format
 */
export function generateTournamentBracket({
  tournamentId,
  format = FORMAT_TYPES.ROUND_ROBIN,
  franchises = [],
  config = {},
}) {
  if (!Array.isArray(franchises) || franchises.length < 2) {
    throw new Error('At least 2 franchises are required to generate a tournament bracket.');
  }

  // Apply seeding order if configured
  const seededFranchises = seedFranchises(franchises, config.seedingMethod);

  switch (format) {
    case FORMAT_TYPES.SINGLE_ELIMINATION:
      return generateSingleEliminationBracket({ tournamentId, franchises: seededFranchises, config });
    case FORMAT_TYPES.DOUBLE_ELIMINATION:
      return generateDoubleEliminationBracket({ tournamentId, franchises: seededFranchises, config });
    case FORMAT_TYPES.GROUP_STAGE_KNOCKOUT:
      return generateGroupStageKnockoutBracket({ tournamentId, franchises: seededFranchises, config });
    case FORMAT_TYPES.CUSTOM:
      return generateCustomBracket({ tournamentId, franchises: seededFranchises, config });
    case FORMAT_TYPES.ROUND_ROBIN:
    default:
      return generateRoundRobinBracket({ tournamentId, franchises: seededFranchises, config });
  }
}

/**
 * Seeds franchises based on selected method
 */
export function seedFranchises(franchises, method = 'standard') {
  const list = [...franchises];
  if (method === 'random') {
    // Fisher-Yates shuffle
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }
  // Default: retain original / ranking order
  return list;
}

/**
 * ----------------------------------------------------------------------------------
 * 1. LEAGUE / ROUND ROBIN GENERATOR
 * Standard circle / polygon algorithm supporting any N teams, odd counts with byes
 * ----------------------------------------------------------------------------------
 */
export function generateRoundRobinBracket({ tournamentId, franchises, config = {} }) {
  const isDouble = config.roundRobinType === 'double';
  const teams = [...franchises];
  const originalCount = teams.length;

  // If odd team count, add a virtual bye team
  const hasBye = teams.length % 2 !== 0;
  if (hasBye) {
    teams.push({ id: '__BYE__', name: 'BYE', isBye: true });
  }

  const numTeams = teams.length;
  const numRounds = numTeams - 1;
  const half = numTeams / 2;

  const matches = [];
  let matchCounter = 1;

  // Single round robin generation
  const roundsList = [];
  const rotation = [...teams];

  for (let r = 0; r < numRounds; r++) {
    const roundMatches = [];
    for (let i = 0; i < half; i++) {
      const teamA = rotation[i];
      const teamB = rotation[numTeams - 1 - i];

      // Skip bye match from actual play schedule
      if (teamA.isBye || teamB.isBye) {
        continue;
      }

      const matchId = `match_rr_${tournamentId}_r${r + 1}_m${matchCounter}`;
      roundMatches.push({
        id: matchId,
        matchNumber: matchCounter++,
        round: r + 1,
        leg: 1,
        stageId: 'stage_league',
        stageName: 'League Stage',
        bracketType: 'round_robin',
        teamAId: teamA.id,
        teamBId: teamB.id,
        teamAName: teamA.name,
        teamBName: teamB.name,
        teamAColor: teamA.color || '#D4B879',
        teamBColor: teamB.color || '#00D9FF',
        teamALogo: teamA.logo || '👑',
        teamBLogo: teamB.logo || '🛡️',
        winnerId: null,
        loserId: null,
        isDraw: false,
        teamAScore: 0,
        teamBScore: 0,
        status: r === 0 ? 'ready' : 'pending',
      });
    }
    roundsList.push(roundMatches);
    matches.push(...roundMatches);

    // Rotate circle array preserving team 0 at index 0
    const fixed = rotation[0];
    const rest = rotation.slice(1);
    const last = rest.pop();
    rest.unshift(last);
    rotation.splice(0, rotation.length, fixed, ...rest);
  }

  // Double round robin if configured
  if (isDouble) {
    const doubleMatches = matches.map((m) => ({
      ...m,
      id: `${m.id}_leg2`,
      matchNumber: matchCounter++,
      round: m.round + numRounds,
      leg: 2,
      // Reverse home and away
      teamAId: m.teamBId,
      teamBId: m.teamAId,
      teamAName: m.teamBName,
      teamBName: m.teamAName,
      teamAColor: m.teamBColor,
      teamBColor: m.teamAColor,
      teamALogo: m.teamBLogo,
      teamBLogo: m.teamALogo,
      status: 'pending',
    }));
    matches.push(...doubleMatches);
  }

  // Initial standings
  const standings = franchises.map((f) => ({
    id: f.id,
    name: f.name,
    color: f.color || '#D4B879',
    logo: f.logo || '👑',
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
  }));

  return {
    format: FORMAT_TYPES.ROUND_ROBIN,
    formatConfig: {
      roundRobinType: isDouble ? 'double' : 'single',
      pointsWin: config.pointsWin ?? 3,
      pointsDraw: config.pointsDraw ?? 1,
      pointsLoss: config.pointsLoss ?? 0,
      tieBreakerOrder: config.tieBreakerOrder || ['points', 'wins', 'headToHead', 'goalDiff'],
    },
    stages: [
      {
        id: 'stage_league',
        name: isDouble ? 'Double Round Robin League' : 'League Round Robin',
        type: 'round_robin',
        status: 'active',
        matches,
      },
    ],
    standings,
    championId: null,
    runnerUpId: null,
    thirdPlaceId: null,
    eliminatedTeamIds: [],
    completedMatchesCount: 0,
    totalMatchesCount: matches.length,
  };
}

/**
 * ----------------------------------------------------------------------------------
 * 2. SINGLE ELIMINATION / KNOCKOUT GENERATOR
 * Supports any team count (2 to 16) with fair top-seed byes for non-powers-of-2
 * Optional third-place playoff
 * ----------------------------------------------------------------------------------
 */
export function generateSingleEliminationBracket({ tournamentId, franchises, config = {} }) {
  const n = franchises.length;
  // Smallest power of 2 >= n
  let power = 2;
  while (power < n) {
    power *= 2;
  }

  const byesCount = power - n; // Top seeds get byes
  const totalRounds = Math.log2(power);

  // Generate round names
  const roundNames = [];
  for (let r = 0; r < totalRounds; r++) {
    const teamsInRound = power / Math.pow(2, r);
    if (teamsInRound === 2) roundNames.push('Championship Final');
    else if (teamsInRound === 4) roundNames.push('Semi Finals');
    else if (teamsInRound === 8) roundNames.push('Quarter Finals');
    else if (teamsInRound === 16) roundNames.push('Round of 16');
    else roundNames.push(`Round ${r + 1}`);
  }

  const stages = [];
  const matchesByRound = {};
  let matchCounter = 1;

  // Build bracket slots from Final down to Round 1
  // We create matches in forward order (Round 1 to Final)
  let currentRoundSlots = power / 2;

  // Standard tournament pairing order for power of 2
  const seedPairs = getTournamentSeedPairs(power);

  // Round 1 matches
  const round1Matches = [];
  for (let m = 0; m < currentRoundSlots; m++) {
    const [seedA, seedB] = seedPairs[m];
    const teamA = franchises[seedA - 1] || null;
    const teamB = franchises[seedB - 1] || null;

    const isByeA = !teamA;
    const isByeB = !teamB;

    const matchId = `match_se_${tournamentId}_r1_${m + 1}`;

    const matchObj = {
      id: matchId,
      matchNumber: matchCounter++,
      round: 1,
      roundName: roundNames[0],
      stageId: `stage_r1`,
      bracketType: 'winners',
      teamAId: teamA ? teamA.id : null,
      teamBId: teamB ? teamB.id : null,
      teamAName: teamA ? teamA.name : 'BYE',
      teamBName: teamB ? teamB.name : 'BYE',
      teamAColor: teamA?.color || '#D4B879',
      teamBColor: teamB?.color || '#00D9FF',
      teamALogo: teamA?.logo || '👑',
      teamBLogo: teamB?.logo || '🛡️',
      winnerId: null,
      loserId: null,
      isDraw: false,
      teamAScore: 0,
      teamBScore: 0,
      status: 'pending',
      nextMatchId: null,
      nextMatchSlot: m % 2 === 0 ? 'teamA' : 'teamB',
      isByeMatch: isByeA || isByeB,
    };

    // If one team has a bye, it auto-wins this match immediately!
    if (teamA && isByeB) {
      matchObj.winnerId = teamA.id;
      matchObj.status = 'completed';
      matchObj.autoBye = true;
    } else if (teamB && isByeA) {
      matchObj.winnerId = teamB.id;
      matchObj.status = 'completed';
      matchObj.autoBye = true;
    } else if (teamA && teamB) {
      matchObj.status = 'ready'; // Ready to battle!
    }

    round1Matches.push(matchObj);
  }
  matchesByRound[1] = round1Matches;

  // Generate subsequent rounds (Round 2 to Final)
  for (let r = 2; r <= totalRounds; r++) {
    const numMatchesInRound = matchesByRound[r - 1].length / 2;
    const roundMatches = [];

    for (let m = 0; m < numMatchesInRound; m++) {
      const matchId = `match_se_${tournamentId}_r${r}_${m + 1}`;
      const isFinal = r === totalRounds;

      const matchObj = {
        id: matchId,
        matchNumber: matchCounter++,
        round: r,
        roundName: roundNames[r - 1],
        stageId: `stage_r${r}`,
        bracketType: isFinal ? 'final' : 'winners',
        teamAId: null,
        teamBId: null,
        teamAName: 'TBD',
        teamBName: 'TBD',
        teamAColor: '#39465A',
        teamBColor: '#39465A',
        teamALogo: '⏳',
        teamBLogo: '⏳',
        winnerId: null,
        loserId: null,
        isDraw: false,
        teamAScore: 0,
        teamBScore: 0,
        status: 'pending',
        nextMatchId: null,
        nextMatchSlot: m % 2 === 0 ? 'teamA' : 'teamB',
      };

      // Link previous round matches to this match
      const prevA = matchesByRound[r - 1][m * 2];
      const prevB = matchesByRound[r - 1][m * 2 + 1];
      prevA.nextMatchId = matchId;
      prevA.nextMatchSlot = 'teamA';
      prevB.nextMatchId = matchId;
      prevB.nextMatchSlot = 'teamB';

      // Propagate auto-byes if previous was completed
      if (prevA.winnerId) {
        const team = franchises.find((f) => f.id === prevA.winnerId);
        if (team) {
          matchObj.teamAId = team.id;
          matchObj.teamAName = team.name;
          matchObj.teamAColor = team.color;
          matchObj.teamALogo = team.logo;
        }
      }
      if (prevB.winnerId) {
        const team = franchises.find((f) => f.id === prevB.winnerId);
        if (team) {
          matchObj.teamBId = team.id;
          matchObj.teamBName = team.name;
          matchObj.teamBColor = team.color;
          matchObj.teamBLogo = team.logo;
        }
      }

      // If both teams arrived through byes, unlock this match
      if (matchObj.teamAId && matchObj.teamBId) {
        matchObj.status = 'ready';
      }

      roundMatches.push(matchObj);
    }
    matchesByRound[r] = roundMatches;
  }

  // Optional Third Place Playoff match
  let thirdPlaceMatch = null;
  if (config.thirdPlacePlayoff && totalRounds >= 2) {
    const semiRound = matchesByRound[totalRounds - 1]; // Semi finals
    if (semiRound && semiRound.length === 2) {
      thirdPlaceMatch = {
        id: `match_se_${tournamentId}_third_place`,
        matchNumber: matchCounter++,
        round: totalRounds,
        roundName: '3rd Place Playoff',
        stageId: 'stage_third_place',
        bracketType: 'third_place',
        teamAId: null,
        teamBId: null,
        teamAName: 'Semi-Final 1 Loser',
        teamBName: 'Semi-Final 2 Loser',
        teamAColor: '#39465A',
        teamBColor: '#39465A',
        teamALogo: '🥉',
        teamBLogo: '🥉',
        winnerId: null,
        loserId: null,
        isDraw: false,
        teamAScore: 0,
        teamBScore: 0,
        status: 'pending',
      };

      // Set loser pointer from semi finals
      semiRound[0].loserNextMatchId = thirdPlaceMatch.id;
      semiRound[0].loserNextMatchSlot = 'teamA';
      semiRound[1].loserNextMatchId = thirdPlaceMatch.id;
      semiRound[1].loserNextMatchSlot = 'teamB';
    }
  }

  // Combine stages
  for (let r = 1; r <= totalRounds; r++) {
    stages.push({
      id: `stage_r${r}`,
      name: roundNames[r - 1],
      round: r,
      type: 'knockout',
      status: r === 1 ? 'active' : 'pending',
      matches: matchesByRound[r],
    });
  }

  if (thirdPlaceMatch) {
    stages.push({
      id: 'stage_third_place',
      name: '3rd Place Playoff',
      round: totalRounds,
      type: 'knockout',
      status: 'pending',
      matches: [thirdPlaceMatch],
    });
  }

  // Count total non-bye matches
  const allMatches = stages.flatMap((s) => s.matches);
  const playableMatches = allMatches.filter((m) => !m.autoBye);
  const completedMatches = allMatches.filter((m) => m.status === 'completed');

  return {
    format: FORMAT_TYPES.SINGLE_ELIMINATION,
    formatConfig: {
      seedingMethod: config.seedingMethod || 'standard',
      thirdPlacePlayoff: Boolean(config.thirdPlacePlayoff),
      byesCount,
    },
    stages,
    standings: franchises.map((f) => ({
      id: f.id,
      name: f.name,
      color: f.color || '#D4B879',
      logo: f.logo || '👑',
      eliminatedRound: null,
      rank: null,
    })),
    championId: null,
    runnerUpId: null,
    thirdPlaceId: null,
    eliminatedTeamIds: [],
    completedMatchesCount: completedMatches.length,
    totalMatchesCount: playableMatches.length,
  };
}

/**
 * ----------------------------------------------------------------------------------
 * 3. DOUBLE ELIMINATION GENERATOR
 * Winners Bracket, Losers Bracket, Grand Final, and optional Grand Final Reset
 * Teams drop down into Losers Bracket on first loss; eliminated on second loss
 * ----------------------------------------------------------------------------------
 */
export function generateDoubleEliminationBracket({ tournamentId, franchises, config = {} }) {
  const n = franchises.length;
  // Best suited for 4, 8 teams (or powers of 2). Non-powers pad with byes.
  let power = 4;
  while (power < n) {
    power *= 2;
  }

  const byesCount = power - n;
  const numWinnersRounds = Math.log2(power);
  const stages = [];
  let matchCounter = 1;

  // 1. Winners Bracket Matches
  const winnersMatches = [];
  const seedPairs = getTournamentSeedPairs(power);
  const round1Slots = power / 2;

  // WB Round 1
  const wbR1 = [];
  for (let m = 0; m < round1Slots; m++) {
    const [seedA, seedB] = seedPairs[m];
    const teamA = franchises[seedA - 1] || null;
    const teamB = franchises[seedB - 1] || null;
    const isByeA = !teamA;
    const isByeB = !teamB;

    const matchId = `match_de_wb_r1_${m + 1}`;
    const matchObj = {
      id: matchId,
      matchNumber: matchCounter++,
      round: 1,
      roundName: 'Winners Round 1',
      stageId: 'stage_de_wb_r1',
      bracketType: 'winners',
      teamAId: teamA?.id || null,
      teamBId: teamB?.id || null,
      teamAName: teamA?.name || 'BYE',
      teamBName: teamB?.name || 'BYE',
      teamAColor: teamA?.color || '#D4B879',
      teamBColor: teamB?.color || '#00D9FF',
      teamALogo: teamA?.logo || '👑',
      teamBLogo: teamB?.logo || '🛡️',
      winnerId: null,
      loserId: null,
      isDraw: false,
      teamAScore: 0,
      teamBScore: 0,
      status: 'pending',
      nextMatchId: null, // to next WB
      nextMatchSlot: m % 2 === 0 ? 'teamA' : 'teamB',
      loserNextMatchId: null, // to Losers Bracket
      loserNextMatchSlot: m % 2 === 0 ? 'teamA' : 'teamB',
    };

    if (teamA && isByeB) {
      matchObj.winnerId = teamA.id;
      matchObj.status = 'completed';
      matchObj.autoBye = true;
    } else if (teamB && isByeA) {
      matchObj.winnerId = teamB.id;
      matchObj.status = 'completed';
      matchObj.autoBye = true;
    } else if (teamA && teamB) {
      matchObj.status = 'ready';
    }

    wbR1.push(matchObj);
  }
  winnersMatches.push(wbR1);

  // Subsequent WB Rounds
  for (let r = 2; r <= numWinnersRounds; r++) {
    const prevMatches = winnersMatches[r - 2];
    const count = prevMatches.length / 2;
    const isWbFinal = r === numWinnersRounds;
    const roundMatches = [];

    for (let m = 0; m < count; m++) {
      const matchId = `match_de_wb_r${r}_${m + 1}`;
      const matchObj = {
        id: matchId,
        matchNumber: matchCounter++,
        round: r,
        roundName: isWbFinal ? 'Winners Final' : `Winners Round ${r}`,
        stageId: `stage_de_wb_r${r}`,
        bracketType: 'winners',
        teamAId: null,
        teamBId: null,
        teamAName: 'TBD',
        teamBName: 'TBD',
        teamAColor: '#39465A',
        teamBColor: '#39465A',
        teamALogo: '⏳',
        teamBLogo: '⏳',
        winnerId: null,
        loserId: null,
        isDraw: false,
        teamAScore: 0,
        teamBScore: 0,
        status: 'pending',
        nextMatchId: null, // To next WB or Grand Final
        nextMatchSlot: m % 2 === 0 ? 'teamA' : 'teamB',
        loserNextMatchId: null, // to Losers Bracket
        loserNextMatchSlot: 'teamB',
      };

      prevMatches[m * 2].nextMatchId = matchId;
      prevMatches[m * 2].nextMatchSlot = 'teamA';
      prevMatches[m * 2 + 1].nextMatchId = matchId;
      prevMatches[m * 2 + 1].nextMatchSlot = 'teamB';

      roundMatches.push(matchObj);
    }
    winnersMatches.push(roundMatches);
  }

  // 2. Losers Bracket Matches
  // For 4 teams: LB Round 1 (1 match) -> LB Final (1 match)
  // For 8 teams: LB R1 (2) -> LB R2 (2) -> LB R3 (1) -> LB Final (1)
  const losersMatches = [];
  const numLosersRounds = (numWinnersRounds - 1) * 2;

  let currentLbSlots = round1Slots / 2;
  for (let lr = 1; lr <= numLosersRounds; lr++) {
    const isLbFinal = lr === numLosersRounds;
    const roundMatches = [];
    const matchCount = Math.max(1, Math.floor(currentLbSlots));

    for (let m = 0; m < matchCount; m++) {
      const matchId = `match_de_lb_r${lr}_${m + 1}`;
      const matchObj = {
        id: matchId,
        matchNumber: matchCounter++,
        round: lr,
        roundName: isLbFinal ? 'Losers Final' : `Losers Round ${lr}`,
        stageId: `stage_de_lb_r${lr}`,
        bracketType: 'losers',
        teamAId: null,
        teamBId: null,
        teamAName: 'TBD',
        teamBName: 'TBD',
        teamAColor: '#39465A',
        teamBColor: '#39465A',
        teamALogo: '🛡️',
        teamBLogo: '🛡️',
        winnerId: null,
        loserId: null,
        isDraw: false,
        teamAScore: 0,
        teamBScore: 0,
        status: 'pending',
        nextMatchId: null,
        nextMatchSlot: m % 2 === 0 ? 'teamA' : 'teamB',
      };
      roundMatches.push(matchObj);
    }
    losersMatches.push(roundMatches);

    // Losers bracket halves matches every 2 rounds
    if (lr % 2 === 0) {
      currentLbSlots /= 2;
    }
  }

  // Link Losers Bracket progression internally
  for (let lr = 0; lr < losersMatches.length - 1; lr++) {
    const curr = losersMatches[lr];
    const next = losersMatches[lr + 1];
    if (curr.length === next.length) {
      for (let i = 0; i < curr.length; i++) {
        curr[i].nextMatchId = next[i].id;
        curr[i].nextMatchSlot = 'teamA';
      }
    } else {
      for (let i = 0; i < curr.length; i++) {
        const nextIdx = Math.floor(i / 2);
        if (next[nextIdx]) {
          curr[i].nextMatchId = next[nextIdx].id;
          curr[i].nextMatchSlot = i % 2 === 0 ? 'teamA' : 'teamB';
        }
      }
    }
  }

  // Link WB losers into Losers Bracket:
  // WB R1 losers go to LB R1
  if (winnersMatches[0] && losersMatches[0]) {
    for (let i = 0; i < winnersMatches[0].length; i++) {
      const lbIdx = Math.floor(i / 2);
      if (losersMatches[0][lbIdx]) {
        winnersMatches[0][i].loserNextMatchId = losersMatches[0][lbIdx].id;
        winnersMatches[0][i].loserNextMatchSlot = i % 2 === 0 ? 'teamA' : 'teamB';
      }
    }
  }

  // WB Final loser drops into Losers Final
  const wbFinal = winnersMatches[winnersMatches.length - 1][0];
  const lbFinal = losersMatches[losersMatches.length - 1][0];
  if (wbFinal && lbFinal) {
    wbFinal.loserNextMatchId = lbFinal.id;
    wbFinal.loserNextMatchSlot = 'teamB';
  }

  // 3. Grand Final
  const grandFinalId = `match_de_grand_final_${tournamentId}`;
  const grandFinalMatch = {
    id: grandFinalId,
    matchNumber: matchCounter++,
    round: numWinnersRounds + 1,
    roundName: 'Grand Final',
    stageId: 'stage_de_grand_final',
    bracketType: 'grand_final',
    teamAId: null, // Winner of Winners Final
    teamBId: null, // Winner of Losers Final
    teamAName: 'Winners Champion',
    teamBName: 'Losers Champion',
    teamAColor: '#D4B879',
    teamBColor: '#00D9FF',
    teamALogo: '👑',
    teamBLogo: '⚔️',
    winnerId: null,
    loserId: null,
    isDraw: false,
    teamAScore: 0,
    teamBScore: 0,
    status: 'pending',
  };

  wbFinal.nextMatchId = grandFinalId;
  wbFinal.nextMatchSlot = 'teamA';

  lbFinal.nextMatchId = grandFinalId;
  lbFinal.nextMatchSlot = 'teamB';

  // 4. Grand Final Reset Match (if Losers finalist wins Grand Final)
  let resetMatch = null;
  const allowReset = config.resetFinal !== false;
  if (allowReset) {
    const resetMatchId = `match_de_grand_final_reset_${tournamentId}`;
    resetMatch = {
      id: resetMatchId,
      matchNumber: matchCounter++,
      round: numWinnersRounds + 2,
      roundName: 'Grand Final Reset (Sudden Death)',
      stageId: 'stage_de_grand_final_reset',
      bracketType: 'grand_final_reset',
      teamAId: null,
      teamBId: null,
      teamAName: 'Grand Finalist A',
      teamBName: 'Grand Finalist B',
      teamAColor: '#D4B879',
      teamBColor: '#00D9FF',
      teamALogo: '👑',
      teamBLogo: '⚔️',
      winnerId: null,
      loserId: null,
      isDraw: false,
      teamAScore: 0,
      teamBScore: 0,
      status: 'pending',
      isConditionalReset: true,
    };
    grandFinalMatch.resetMatchId = resetMatchId;
  }

  // Package into stages
  winnersMatches.forEach((roundArr, idx) => {
    stages.push({
      id: `stage_de_wb_r${idx + 1}`,
      name: roundArr[0]?.roundName || `Winners Round ${idx + 1}`,
      round: idx + 1,
      type: 'winners_knockout',
      status: idx === 0 ? 'active' : 'pending',
      matches: roundArr,
    });
  });

  losersMatches.forEach((roundArr, idx) => {
    stages.push({
      id: `stage_de_lb_r${idx + 1}`,
      name: roundArr[0]?.roundName || `Losers Round ${idx + 1}`,
      round: idx + 1,
      type: 'losers_knockout',
      status: 'pending',
      matches: roundArr,
    });
  });

  stages.push({
    id: 'stage_de_grand_final',
    name: 'Championship Grand Final',
    type: 'grand_final',
    status: 'pending',
    matches: resetMatch ? [grandFinalMatch, resetMatch] : [grandFinalMatch],
  });

  const allMatches = stages.flatMap((s) => s.matches);
  const playableMatches = allMatches.filter((m) => !m.autoBye && !m.isConditionalReset);

  return {
    format: FORMAT_TYPES.DOUBLE_ELIMINATION,
    formatConfig: {
      seedingMethod: config.seedingMethod || 'standard',
      resetFinal: allowReset,
      byesCount,
    },
    stages,
    standings: franchises.map((f) => ({
      id: f.id,
      name: f.name,
      color: f.color || '#D4B879',
      logo: f.logo || '👑',
      losses: 0,
      eliminated: false,
    })),
    championId: null,
    runnerUpId: null,
    thirdPlaceId: null,
    eliminatedTeamIds: [],
    completedMatchesCount: 0,
    totalMatchesCount: playableMatches.length,
  };
}

/**
 * ----------------------------------------------------------------------------------
 * 4. GROUP STAGE + KNOCKOUT GENERATOR
 * Multi-group round robin with standings + top qualifiers advance to knockout
 * ----------------------------------------------------------------------------------
 */
export function generateGroupStageKnockoutBracket({ tournamentId, franchises, config = {} }) {
  const n = franchises.length;
  const groupCount = Math.max(2, Math.min(4, Number(config.groupCount) || 2));
  const qualifyCount = Math.max(1, Number(config.qualifyCountPerGroup) || 2);
  const thirdPlacePlayoff = Boolean(config.thirdPlacePlayoff);

  // Distribute teams into groups (snake seeding)
  const groupLetters = ['A', 'B', 'C', 'D'].slice(0, groupCount);
  const groups = {};
  groupLetters.forEach((letter) => {
    groups[letter] = {
      key: letter,
      name: `Group ${letter}`,
      teams: [],
      standings: [],
    };
  });

  franchises.forEach((f, idx) => {
    const cycle = Math.floor(idx / groupCount);
    const rem = idx % groupCount;
    // Snake: even cycle 0->G, odd cycle G->0
    const groupIndex = cycle % 2 === 0 ? rem : groupCount - 1 - rem;
    const letter = groupLetters[groupIndex];
    groups[letter].teams.push(f);
    groups[letter].standings.push({
      id: f.id,
      name: f.name,
      color: f.color || '#D4B879',
      logo: f.logo || '👑',
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      rank: 1,
      qualified: false,
    });
  });

  const stages = [];
  let matchCounter = 1;
  const groupMatches = [];

  // Generate round robin matches for each group
  groupLetters.forEach((letter) => {
    const groupTeams = groups[letter].teams;
    const gMatches = [];
    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        const teamA = groupTeams[i];
        const teamB = groupTeams[j];
        const matchId = `match_gsk_grp_${letter}_m${matchCounter}`;
        const matchObj = {
          id: matchId,
          matchNumber: matchCounter++,
          groupKey: letter,
          groupName: `Group ${letter}`,
          stageId: `stage_group_${letter}`,
          bracketType: 'group_stage',
          teamAId: teamA.id,
          teamBId: teamB.id,
          teamAName: teamA.name,
          teamBName: teamB.name,
          teamAColor: teamA.color || '#D4B879',
          teamBColor: teamB.color || '#00D9FF',
          teamALogo: teamA.logo || '👑',
          teamBLogo: teamB.logo || '🛡️',
          winnerId: null,
          loserId: null,
          isDraw: false,
          teamAScore: 0,
          teamBScore: 0,
          status: 'ready',
        };
        gMatches.push(matchObj);
        groupMatches.push(matchObj);
      }
    }

    stages.push({
      id: `stage_group_${letter}`,
      name: `Group ${letter} Round Robin`,
      type: 'group_stage',
      groupKey: letter,
      status: 'active',
      matches: gMatches,
    });
  });

  // Knockout stage for qualifiers (top qualifiers from each group)
  // Example for 2 groups with 2 qualifiers = 4 teams (Semi Final 1: A1 vs B2, Semi Final 2: B1 vs A2 -> Final)
  const totalQualifiers = groupCount * qualifyCount;
  const knockoutStages = [];

  if (totalQualifiers === 4) {
    const sf1Id = `match_gsk_sf_1`;
    const sf2Id = `match_gsk_sf_2`;
    const finalId = `match_gsk_final`;
    const thirdPlaceId = thirdPlacePlayoff ? `match_gsk_third_place` : null;

    const sf1 = {
      id: sf1Id,
      matchNumber: matchCounter++,
      round: 1,
      roundName: 'Semi Final 1',
      stageId: 'stage_knockout_sf',
      bracketType: 'winners',
      qualifierSourceA: { groupKey: 'A', rank: 1 },
      qualifierSourceB: { groupKey: 'B', rank: 2 },
      teamAId: null,
      teamBId: null,
      teamAName: 'Group A 1st Place',
      teamBName: 'Group B 2nd Place',
      teamAColor: '#39465A',
      teamBColor: '#39465A',
      teamALogo: '⏳',
      teamBLogo: '⏳',
      winnerId: null,
      loserId: null,
      isDraw: false,
      teamAScore: 0,
      teamBScore: 0,
      status: 'pending',
      nextMatchId: finalId,
      nextMatchSlot: 'teamA',
      loserNextMatchId: thirdPlaceId,
      loserNextMatchSlot: 'teamA',
    };

    const sf2 = {
      id: sf2Id,
      matchNumber: matchCounter++,
      round: 1,
      roundName: 'Semi Final 2',
      stageId: 'stage_knockout_sf',
      bracketType: 'winners',
      qualifierSourceA: { groupKey: 'B', rank: 1 },
      qualifierSourceB: { groupKey: 'A', rank: 2 },
      teamAId: null,
      teamBId: null,
      teamAName: 'Group B 1st Place',
      teamBName: 'Group A 2nd Place',
      teamAColor: '#39465A',
      teamBColor: '#39465A',
      teamALogo: '⏳',
      teamBLogo: '⏳',
      winnerId: null,
      loserId: null,
      isDraw: false,
      teamAScore: 0,
      teamBScore: 0,
      status: 'pending',
      nextMatchId: finalId,
      nextMatchSlot: 'teamB',
      loserNextMatchId: thirdPlaceId,
      loserNextMatchSlot: 'teamB',
    };

    const finalMatch = {
      id: finalId,
      matchNumber: matchCounter++,
      round: 2,
      roundName: 'Championship Final',
      stageId: 'stage_knockout_final',
      bracketType: 'final',
      teamAId: null,
      teamBId: null,
      teamAName: 'Semi Final 1 Winner',
      teamBName: 'Semi Final 2 Winner',
      teamAColor: '#D4B879',
      teamBColor: '#00D9FF',
      teamALogo: '👑',
      teamBLogo: '🛡️',
      winnerId: null,
      loserId: null,
      isDraw: false,
      teamAScore: 0,
      teamBScore: 0,
      status: 'pending',
    };

    stages.push({
      id: 'stage_knockout_sf',
      name: 'Knockout Semi Finals',
      type: 'knockout',
      status: 'pending',
      matches: [sf1, sf2],
    });

    const finalMatches = [finalMatch];
    if (thirdPlacePlayoff) {
      finalMatches.push({
        id: thirdPlaceId,
        matchNumber: matchCounter++,
        round: 2,
        roundName: '3rd Place Playoff',
        stageId: 'stage_knockout_final',
        bracketType: 'third_place',
        teamAId: null,
        teamBId: null,
        teamAName: 'Semi Final 1 Loser',
        teamBName: 'Semi Final 2 Loser',
        teamAColor: '#39465A',
        teamBColor: '#39465A',
        teamALogo: '🥉',
        teamBLogo: '🥉',
        winnerId: null,
        loserId: null,
        isDraw: false,
        teamAScore: 0,
        teamBScore: 0,
        status: 'pending',
      });
    }

    stages.push({
      id: 'stage_knockout_final',
      name: 'Knockout Finals',
      type: 'knockout',
      status: 'pending',
      matches: finalMatches,
    });
  } else {
    // 2 qualifiers total (direct final)
    const finalId = `match_gsk_final`;
    stages.push({
      id: 'stage_knockout_final',
      name: 'Championship Final',
      type: 'knockout',
      status: 'pending',
      matches: [
        {
          id: finalId,
          matchNumber: matchCounter++,
          round: 1,
          roundName: 'Championship Final',
          stageId: 'stage_knockout_final',
          bracketType: 'final',
          qualifierSourceA: { groupKey: 'A', rank: 1 },
          qualifierSourceB: { groupKey: 'B', rank: 1 },
          teamAId: null,
          teamBId: null,
          teamAName: 'Group A Winner',
          teamBName: 'Group B Winner',
          teamAColor: '#D4B879',
          teamBColor: '#00D9FF',
          teamALogo: '👑',
          teamBLogo: '🛡️',
          winnerId: null,
          loserId: null,
          isDraw: false,
          teamAScore: 0,
          teamBScore: 0,
          status: 'pending',
        },
      ],
    });
  }

  const allMatches = stages.flatMap((s) => s.matches);

  return {
    format: FORMAT_TYPES.GROUP_STAGE_KNOCKOUT,
    formatConfig: {
      groupCount,
      qualifyCountPerGroup: qualifyCount,
      thirdPlacePlayoff,
      pointsWin: config.pointsWin ?? 3,
      pointsDraw: config.pointsDraw ?? 1,
      pointsLoss: config.pointsLoss ?? 0,
    },
    groups,
    stages,
    standings: [],
    championId: null,
    runnerUpId: null,
    thirdPlaceId: null,
    eliminatedTeamIds: [],
    completedMatchesCount: 0,
    totalMatchesCount: allMatches.length,
  };
}

/**
 * ----------------------------------------------------------------------------------
 * 5. CUSTOM TOURNAMENT FORMAT GENERATOR
 * Flexible stage-by-stage tournament configuration
 * ----------------------------------------------------------------------------------
 */
export function generateCustomBracket({ tournamentId, franchises, config = {} }) {
  // Validate custom config
  if (config.stages && Array.isArray(config.stages) && config.stages.length > 0) {
    // Custom configured stages
    return {
      format: FORMAT_TYPES.CUSTOM,
      formatConfig: config,
      stages: config.stages,
      standings: [],
      championId: null,
      runnerUpId: null,
      thirdPlaceId: null,
      eliminatedTeamIds: [],
      completedMatchesCount: 0,
      totalMatchesCount: config.stages.flatMap((s) => s.matches || []).length,
    };
  }

  // Fallback / default custom: Group stage of 2 + Knockout
  return generateGroupStageKnockoutBracket({
    tournamentId,
    franchises,
    config: {
      groupCount: 2,
      qualifyCountPerGroup: 2,
      thirdPlacePlayoff: true,
      ...config,
    },
  });
}

/**
 * ----------------------------------------------------------------------------------
 * MATCH PROGRESSION & ADVANCEMENT ENGINE
 * When a Battle match is confirmed:
 * 1. Confirms match result and stores scores
 * 2. Advances winner to nextMatchId and loser to loserNextMatchId
 * 3. Handles Losers Bracket in Double Elimination
 * 4. Handles Grand Final Reset in Double Elimination
 * 5. Updates Group Standings and unlocks Knockout Stage when groups conclude
 * 6. Updates Overall Standings, Champion, Runner-up, 3rd Place
 * ----------------------------------------------------------------------------------
 */
export function advanceMatchResult({
  bracketData,
  matchId,
  result,
  allFranchises = [],
}) {
  if (!bracketData || !matchId || !result) {
    throw new Error('Invalid parameters for advanceMatchResult.');
  }

  // Deep clone bracketData to ensure immutable purity
  const data = JSON.parse(JSON.stringify(bracketData));

  // 1. Locate the target match across all stages
  let targetMatch = null;
  let targetStage = null;

  for (const stage of data.stages) {
    for (const match of stage.matches) {
      if (match.id === matchId) {
        targetMatch = match;
        targetStage = stage;
        break;
      }
    }
    if (targetMatch) break;
  }

  if (!targetMatch) {
    throw new Error(`Match with ID "${matchId}" not found in tournament bracket.`);
  }

  // Guard against re-settlement of already completed matches
  if (targetMatch.status === 'completed' && targetMatch.winnerId) {
    console.warn(`Match ${matchId} is already completed. Skipping redundant settlement.`);
    return data;
  }

  // 2. Record match scores and outcome
  const {
    winnerId,
    loserId,
    isDraw = false,
    teamAScore = 0,
    teamBScore = 0,
    teamAPlayer = null,
    teamBPlayer = null,
    details = null,
  } = result;

  targetMatch.winnerId = winnerId;
  targetMatch.loserId = loserId || (isDraw ? null : targetMatch.teamAId === winnerId ? targetMatch.teamBId : targetMatch.teamAId);
  targetMatch.isDraw = Boolean(isDraw);
  targetMatch.teamAScore = Number(teamAScore) || 0;
  targetMatch.teamBScore = Number(teamBScore) || 0;
  targetMatch.teamAPlayer = teamAPlayer;
  targetMatch.teamBPlayer = teamBPlayer;
  targetMatch.status = 'completed';
  targetMatch.completedAt = new Date().toISOString();
  if (details) targetMatch.details = details;

  // 3. Update League / Group Standings if applicable
  if (data.format === FORMAT_TYPES.ROUND_ROBIN) {
    updateLeagueStandings(data, targetMatch);
  } else if (targetMatch.bracketType === 'group_stage') {
    updateGroupStageStandings(data, targetMatch, allFranchises);
  }

  // 4. Progress Winner and Loser to Dependent Matches
  const winningTeam = allFranchises.find((f) => f.id === targetMatch.winnerId) || null;
  const losingTeam = allFranchises.find((f) => f.id === targetMatch.loserId) || null;

  // Next match for Winner
  if (targetMatch.nextMatchId && winningTeam) {
    propagateTeamToMatch(data, targetMatch.nextMatchId, targetMatch.nextMatchSlot || 'teamA', winningTeam);
  }

  // Next match for Loser (Double Elimination Losers Bracket or 3rd Place Playoff)
  if (targetMatch.loserNextMatchId && losingTeam) {
    propagateTeamToMatch(data, targetMatch.loserNextMatchId, targetMatch.loserNextMatchSlot || 'teamB', losingTeam);
  }

  // 5. Special Double Elimination: Grand Final & Reset Final Rule
  if (data.format === FORMAT_TYPES.DOUBLE_ELIMINATION) {
    handleDoubleEliminationFinals(data, targetMatch, winningTeam, losingTeam);
  }

  // 6. Check stage status and unlock newly eligible matches
  data.stages.forEach((stage) => {
    const allMatchesCompleted = stage.matches.every((m) => m.status === 'completed' || m.autoBye);
    if (allMatchesCompleted) {
      stage.status = 'completed';
    } else {
      const anyMatchReady = stage.matches.some((m) => m.status === 'ready' || m.status === 'completed');
      if (anyMatchReady && stage.status === 'pending') {
        stage.status = 'active';
      }
    }

    // Unlock ready matches
    stage.matches.forEach((m) => {
      if (m.status === 'pending' && m.teamAId && m.teamBId && !m.autoBye) {
        m.status = 'ready';
      }
    });
  });

  // 7. Update tournament elimination list and completion state
  updateEliminationsAndPodium(data, allFranchises);

  // Recount completed matches
  const allM = data.stages.flatMap((s) => s.matches);
  data.completedMatchesCount = allM.filter((m) => m.status === 'completed').length;

  return data;
}

/**
 * Propagates a team into a designated match slot
 */
function propagateTeamToMatch(data, targetMatchId, slot, team) {
  for (const stage of data.stages) {
    for (const match of stage.matches) {
      if (match.id === targetMatchId) {
        if (slot === 'teamA') {
          match.teamAId = team.id;
          match.teamAName = team.name;
          match.teamAColor = team.color || '#D4B879';
          match.teamALogo = team.logo || '👑';
        } else {
          match.teamBId = team.id;
          match.teamBName = team.name;
          match.teamBColor = team.color || '#00D9FF';
          match.teamBLogo = team.logo || '🛡️';
        }

        // If both slots filled, match is ready!
        if (match.teamAId && match.teamBId) {
          match.status = 'ready';
        }
        return;
      }
    }
  }
}

/**
 * Updates League Standings on Round Robin match completion
 */
function updateLeagueStandings(data, match) {
  const ptsWin = data.formatConfig?.pointsWin ?? 3;
  const ptsDraw = data.formatConfig?.pointsDraw ?? 1;
  const ptsLoss = data.formatConfig?.pointsLoss ?? 0;

  const entryA = data.standings.find((s) => s.id === match.teamAId);
  const entryB = data.standings.find((s) => s.id === match.teamBId);

  if (entryA) {
    entryA.played += 1;
    entryA.goalsFor += match.teamAScore;
    entryA.goalsAgainst += match.teamBScore;
    entryA.goalDiff = entryA.goalsFor - entryA.goalsAgainst;

    if (match.isDraw) {
      entryA.drawn += 1;
      entryA.points += ptsDraw;
    } else if (match.winnerId === match.teamAId) {
      entryA.won += 1;
      entryA.points += ptsWin;
    } else {
      entryA.lost += 1;
      entryA.points += ptsLoss;
    }
  }

  if (entryB) {
    entryB.played += 1;
    entryB.goalsFor += match.teamBScore;
    entryB.goalsAgainst += match.teamAScore;
    entryB.goalDiff = entryB.goalsFor - entryB.goalsAgainst;

    if (match.isDraw) {
      entryB.drawn += 1;
      entryB.points += ptsDraw;
    } else if (match.winnerId === match.teamBId) {
      entryB.won += 1;
      entryB.points += ptsWin;
    } else {
      entryB.lost += 1;
      entryB.points += ptsLoss;
    }
  }

  // Sort standings by points -> wins -> goalDiff -> goalsFor
  data.standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.won !== a.won) return b.won - a.won;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsFor - a.goalsFor;
  });

  // Check if all matches completed
  const allM = data.stages.flatMap((s) => s.matches);
  const allDone = allM.every((m) => m.status === 'completed');
  if (allDone && data.standings.length >= 2) {
    data.championId = data.standings[0].id;
    data.runnerUpId = data.standings[1].id;
    if (data.standings.length >= 3) {
      data.thirdPlaceId = data.standings[2].id;
    }
  }
}

/**
 * Updates Group Stage Standings and qualifies top teams into Knockout
 */
function updateGroupStageStandings(data, match, allFranchises) {
  const letter = match.groupKey;
  if (!letter || !data.groups?.[letter]) return;

  const groupObj = data.groups[letter];
  const ptsWin = data.formatConfig?.pointsWin ?? 3;
  const ptsDraw = data.formatConfig?.pointsDraw ?? 1;
  const ptsLoss = data.formatConfig?.pointsLoss ?? 0;

  const entryA = groupObj.standings.find((s) => s.id === match.teamAId);
  const entryB = groupObj.standings.find((s) => s.id === match.teamBId);

  if (entryA) {
    entryA.played += 1;
    entryA.goalsFor += match.teamAScore;
    entryA.goalsAgainst += match.teamBScore;
    entryA.goalDiff = entryA.goalsFor - entryA.goalsAgainst;
    if (match.isDraw) {
      entryA.drawn += 1;
      entryA.points += ptsDraw;
    } else if (match.winnerId === match.teamAId) {
      entryA.won += 1;
      entryA.points += ptsWin;
    } else {
      entryA.lost += 1;
      entryA.points += ptsLoss;
    }
  }

  if (entryB) {
    entryB.played += 1;
    entryB.goalsFor += match.teamBScore;
    entryB.goalsAgainst += match.teamAScore;
    entryB.goalDiff = entryB.goalsFor - entryB.goalsAgainst;
    if (match.isDraw) {
      entryB.drawn += 1;
      entryB.points += ptsDraw;
    } else if (match.winnerId === match.teamBId) {
      entryB.won += 1;
      entryB.points += ptsWin;
    } else {
      entryB.lost += 1;
      entryB.points += ptsLoss;
    }
  }

  // Re-sort group standings
  groupObj.standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.won !== a.won) return b.won - a.won;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    return b.goalsFor - a.goalsFor;
  });

  // Assign ranks
  groupObj.standings.forEach((s, idx) => {
    s.rank = idx + 1;
  });

  // Check if ALL group matches across ALL groups are completed
  const allGroupStages = data.stages.filter((s) => s.type === 'group_stage');
  const allGroupMatches = allGroupStages.flatMap((s) => s.matches);
  const allGroupsDone = allGroupMatches.every((m) => m.status === 'completed');

  if (allGroupsDone) {
    // Flag qualifiers
    const qualifyCount = data.formatConfig?.qualifyCountPerGroup || 2;
    Object.values(data.groups).forEach((g) => {
      g.standings.forEach((s, idx) => {
        s.qualified = idx < qualifyCount;
      });
    });

    // Populate dependent Knockout matches
    const knockoutStages = data.stages.filter((s) => s.type === 'knockout');
    knockoutStages.forEach((kStage) => {
      kStage.matches.forEach((kMatch) => {
        if (kMatch.qualifierSourceA) {
          const { groupKey, rank } = kMatch.qualifierSourceA;
          const qualTeam = data.groups[groupKey]?.standings[rank - 1];
          if (qualTeam) {
            const team = allFranchises.find((f) => f.id === qualTeam.id) || qualTeam;
            kMatch.teamAId = team.id;
            kMatch.teamAName = team.name;
            kMatch.teamAColor = team.color;
            kMatch.teamALogo = team.logo;
          }
        }
        if (kMatch.qualifierSourceB) {
          const { groupKey, rank } = kMatch.qualifierSourceB;
          const qualTeam = data.groups[groupKey]?.standings[rank - 1];
          if (qualTeam) {
            const team = allFranchises.find((f) => f.id === qualTeam.id) || qualTeam;
            kMatch.teamBId = team.id;
            kMatch.teamBName = team.name;
            kMatch.teamBColor = team.color;
            kMatch.teamBLogo = team.logo;
          }
        }

        if (kMatch.teamAId && kMatch.teamBId) {
          kMatch.status = 'ready';
        }
      });
    });
  }
}

/**
 * Handles Double Elimination Grand Final and Conditional Reset Final logic
 */
function handleDoubleEliminationFinals(data, match, winningTeam, losingTeam) {
  // If match was Grand Final
  if (match.bracketType === 'grand_final') {
    const wbWinnerId = match.teamAId; // Entered from Winners Bracket (0 losses)
    const lbWinnerId = match.teamBId; // Entered from Losers Bracket (1 loss)

    if (match.winnerId === wbWinnerId) {
      // Winners Bracket finalist won! Tournament over cleanly. No reset required.
      data.championId = wbWinnerId;
      data.runnerUpId = lbWinnerId;

      // Cancel or mark unnecessary reset match
      if (match.resetMatchId) {
        const resetM = findMatchById(data, match.resetMatchId);
        if (resetM) {
          resetM.status = 'unneeded';
          resetM.notes = 'Unneeded: Winners bracket finalist won Grand Final without reset.';
        }
      }
    } else {
      // Losers Bracket finalist beat Winners Bracket finalist!
      // Both teams now have 1 loss.
      if (data.formatConfig?.resetFinal && match.resetMatchId) {
        // Trigger Grand Final Reset Match
        const resetM = findMatchById(data, match.resetMatchId);
        if (resetM && winningTeam && losingTeam) {
          resetM.teamAId = wbWinnerId;
          resetM.teamBId = lbWinnerId;
          resetM.teamAName = losingTeam.name;
          resetM.teamBName = winningTeam.name;
          resetM.teamAColor = losingTeam.color;
          resetM.teamBColor = winningTeam.color;
          resetM.teamALogo = losingTeam.logo;
          resetM.teamBLogo = winningTeam.logo;
          resetM.status = 'ready';
          resetM.notes = 'GRAND FINAL RESET: Both finalists have 1 defeat. Sudden death match for championship!';
        }
      } else {
        // No reset configured: LB finalist is champion
        data.championId = lbWinnerId;
        data.runnerUpId = wbWinnerId;
      }
    }
  } else if (match.bracketType === 'grand_final_reset') {
    // Grand Final Reset completed!
    data.championId = match.winnerId;
    data.runnerUpId = match.loserId;
  }
}

/**
 * Resolves tournament elimination and podium states
 */
function updateEliminationsAndPodium(data, allFranchises) {
  const allMatches = data.stages.flatMap((s) => s.matches);

  // 1. Single Elimination / Knockout Podium Check
  if (data.format === FORMAT_TYPES.SINGLE_ELIMINATION) {
    const finalMatch = allMatches.find((m) => m.bracketType === 'final');
    if (finalMatch?.status === 'completed' && finalMatch.winnerId) {
      data.championId = finalMatch.winnerId;
      data.runnerUpId = finalMatch.loserId;
    }

    const thirdPlaceMatch = allMatches.find((m) => m.bracketType === 'third_place');
    if (thirdPlaceMatch?.status === 'completed' && thirdPlaceMatch.winnerId) {
      data.thirdPlaceId = thirdPlaceMatch.winnerId;
    }
  }

  // 2. Group Stage + Knockout Podium Check
  if (data.format === FORMAT_TYPES.GROUP_STAGE_KNOCKOUT) {
    const finalMatch = allMatches.find((m) => m.bracketType === 'final');
    if (finalMatch?.status === 'completed' && finalMatch.winnerId) {
      data.championId = finalMatch.winnerId;
      data.runnerUpId = finalMatch.loserId;
    }

    const thirdPlaceMatch = allMatches.find((m) => m.bracketType === 'third_place');
    if (thirdPlaceMatch?.status === 'completed' && thirdPlaceMatch.winnerId) {
      data.thirdPlaceId = thirdPlaceMatch.winnerId;
    }
  }

  // Compile eliminated teams list
  const eliminated = new Set();
  if (data.format === FORMAT_TYPES.SINGLE_ELIMINATION) {
    allMatches.forEach((m) => {
      if (m.status === 'completed' && m.loserId && m.bracketType !== 'third_place') {
        eliminated.add(m.loserId);
      }
    });
  } else if (data.format === FORMAT_TYPES.DOUBLE_ELIMINATION) {
    // Losers in Losers Bracket are permanently eliminated
    allMatches.forEach((m) => {
      if (m.status === 'completed' && m.loserId && (m.bracketType === 'losers' || m.bracketType === 'grand_final_reset')) {
        eliminated.add(m.loserId);
      }
    });
  }
  data.eliminatedTeamIds = Array.from(eliminated);
}

/**
 * Helper to find match by ID in bracket
 */
function findMatchById(data, matchId) {
  for (const s of data.stages) {
    for (const m of s.matches) {
      if (m.id === matchId) return m;
    }
  }
  return null;
}

/**
 * Standard tournament pairing generator for powers of 2
 * e.g., 4 teams -> [[1,4], [2,3]]
 * 8 teams -> [[1,8], [4,5], [2,7], [3,6]]
 */
function getTournamentSeedPairs(numTeams) {
  let rounds = [1, 2];
  while (rounds.length < numTeams) {
    const nextRounds = [];
    const sum = rounds.length * 2 + 1;
    for (let i = 0; i < rounds.length; i++) {
      nextRounds.push(rounds[i]);
      nextRounds.push(sum - rounds[i]);
    }
    rounds = nextRounds;
  }

  const pairs = [];
  for (let i = 0; i < rounds.length; i += 2) {
    pairs.push([rounds[i], rounds[i + 1]]);
  }
  return pairs;
}

export const tournamentFormatService = {
  FORMAT_TYPES,
  FORMAT_METADATA,
  estimateMatchCount,
  generateTournamentBracket,
  advanceMatchResult,
  seedFranchises,
};
