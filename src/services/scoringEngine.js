// BIDBATTLE 8.2 — Official Competitive Winner Determination & 6-Tier Ranking Algorithm
// Ranking Priority:
// 1. Total points – descending (sum of ratings for eligible top maxSquadSize heroes).
// 2. Remaining purse – descending.
// 3. Highest individual acquired-player rating – descending (MVP).
// 4. Second-highest individual rating, then subsequent ratings – descending.
// 5. Combined acquired-player rating – descending (sum of all acquired squad ratings).
// 6. Shared rank if all criteria are identical.

/**
 * Compares two teams according to the official 6-tier ranking priority
 * Returns < 0 if teamA ranks higher than teamB, > 0 if teamB ranks higher, 0 if identical
 */
export function compareTeamsOfficialRanking(teamA, teamB, maxSquadCap) {
  // 1. Total Points (descending)
  if (teamB.totalScore !== teamA.totalScore) {
    return teamB.totalScore - teamA.totalScore;
  }

  // 2. Remaining Purse (descending)
  if (teamB.remainingPurse !== teamA.remainingPurse) {
    return teamB.remainingPurse - teamA.remainingPurse;
  }

  // 3. Highest individual acquired-player rating (descending)
  const aRatings = teamA.sortedRatings || [];
  const bRatings = teamB.sortedRatings || [];
  const aTop = aRatings[0] || 0;
  const bTop = bRatings[0] || 0;
  if (bTop !== aTop) {
    return bTop - aTop;
  }

  // 4. Second-highest individual rating, then subsequent ratings in scoring squad (descending)
  const squadCap = teamA.maxSquadSize || teamB.maxSquadSize || maxSquadCap || 8;
  const maxLen = Math.min(squadCap, Math.max(aRatings.length, bRatings.length));
  for (let i = 1; i < maxLen; i++) {
    const rA = aRatings[i] || 0;
    const rB = bRatings[i] || 0;
    if (rB !== rA) {
      return rB - rA;
    }
  }

  // 5. Combined acquired-player rating (descending)
  if (teamB.combinedSquadRating !== teamA.combinedSquadRating) {
    return teamB.combinedSquadRating - teamA.combinedSquadRating;
  }

  // 6. Shared rank if all criteria are identical
  return 0;
}

/**
 * Returns the exact first criterion that differentiates teamA from teamB
 */
export function getDifferentiatingCriterion(teamA, teamB, maxSquadCap) {
  if (!teamA || !teamB) return 'N/A';

  if (teamA.totalScore !== teamB.totalScore) {
    const margin = teamA.totalScore - teamB.totalScore;
    return margin > 0
      ? `Points Margin (+${margin} pts)`
      : `Points Deficit (${margin} pts)`;
  }

  if (teamA.remainingPurse !== teamB.remainingPurse) {
    const margin = Number((teamA.remainingPurse - teamB.remainingPurse).toFixed(2));
    return margin > 0
      ? `Remaining Purse (+₹${margin} Cr)`
      : `Remaining Purse (-₹${Math.abs(margin)} Cr)`;
  }

  const aRatings = teamA.sortedRatings || [];
  const bRatings = teamB.sortedRatings || [];
  const aTop = aRatings[0] || 0;
  const bTop = bRatings[0] || 0;
  if (aTop !== bTop) {
    return `Highest Player Rating (${aTop} vs ${bTop})`;
  }

  const squadCap = teamA.maxSquadSize || teamB.maxSquadSize || maxSquadCap || 8;
  const maxLen = Math.min(squadCap, Math.max(aRatings.length, bRatings.length));
  for (let i = 1; i < maxLen; i++) {
    const rA = aRatings[i] || 0;
    const rB = bRatings[i] || 0;
    if (rA !== rB) {
      const suffix = i === 1 ? '2nd' : i === 2 ? '3rd' : `${i + 1}th`;
      return `${suffix}-Highest Rating (${rA} vs ${rB})`;
    }
  }

  if (teamA.combinedSquadRating !== teamB.combinedSquadRating) {
    return `Combined Squad Rating (${teamA.combinedSquadRating} vs ${teamB.combinedSquadRating})`;
  }

  return 'Tied on All Criteria (Shared Rank)';
}

/**
 * Generates dynamic tournament conclusion narrative and metadata
 */
export function generateTournamentConclusion({
  rankedTeams = [],
  name = 'Auction Tournament',
  maxSquadSize = 8,
  currency = { symbol: '₹' },
}) {
  if (!rankedTeams || rankedTeams.length === 0) {
    return null;
  }

  const champions = rankedTeams.filter((t) => t.rank === 1);
  const isSharedChampion = champions.length > 1;
  const primaryChampion = champions[0];
  const runnerUp = rankedTeams.find((t) => t.rank > 1) || null;

  let tiebreakerUsed = null;
  let victoryType = 'Outright Points Victory';
  let conclusionNarrative = '';

  if (isSharedChampion) {
    victoryType = 'Shared Championship (True Tie)';
    tiebreakerUsed = 'None — Teams tied on every official ranking criterion';
    conclusionNarrative = `An extraordinary and historic finish in ${name}! Both ${champions.map((c) => c.name).join(' and ')} achieved identical total points (${primaryChampion.totalPoints} pts), remaining purse (${currency.symbol || '₹'}${primaryChampion.remainingPurse} Cr), individual player ratings, and combined squad ratings (${primaryChampion.combinedSquadRating} pts). Both franchises are officially crowned Joint Champions!`;
  } else {
    if (runnerUp) {
      if (primaryChampion.totalPoints !== runnerUp.totalPoints) {
        const margin = primaryChampion.totalPoints - runnerUp.totalPoints;
        victoryType = `Outright Points Victory (+${margin} pts)`;
        tiebreakerUsed = 'None (Decided by Total Points)';
        conclusionNarrative = `${primaryChampion.name} conquers the auction arena with ${primaryChampion.totalPoints} points, securing an outright ${margin}-point championship victory over runner-up ${runnerUp.name} (${runnerUp.totalPoints} pts). ${primaryChampion.name} built a championship roster led by MVP ${primaryChampion.strongestHero?.name || 'their top pick'} (${primaryChampion.highestRating} rating) while preserving ${currency.symbol || '₹'}${primaryChampion.remainingPurse} Cr in purse reserve.`;
      } else {
        const diffReason = getDifferentiatingCriterion(primaryChampion, runnerUp);
        victoryType = 'Tiebreaker Decision';
        tiebreakerUsed = diffReason;
        conclusionNarrative = `${primaryChampion.name} and ${runnerUp.name} finished deadlocked at ${primaryChampion.totalPoints} points! Under the official 6-tier championship ranking priority, the title was decided by: ${diffReason}. ${primaryChampion.name} clinches the crown with ${primaryChampion.highestRating} MVP rating and ${currency.symbol || '₹'}${primaryChampion.remainingPurse} Cr in reserve.`;
      }
    } else {
      conclusionNarrative = `${primaryChampion.name} wins ${name} as sole franchise champion with ${primaryChampion.totalPoints} points and ${currency.symbol || '₹'}${primaryChampion.remainingPurse} Cr remaining.`;
    }
  }

  return {
    isSharedChampion,
    champions,
    primaryChampion,
    runnerUp,
    victoryType,
    tiebreakerUsed,
    conclusionNarrative,
  };
}

/**
 * Calculates official tournament rankings for participating teams
 */
export function calculateTeamRankings(teams = [], items = [], maxSquadSize = 8) {
  if (!teams || teams.length === 0) return { rankedTeams: [], champion: null, winningMargin: 0, conclusion: null };

  const parsedMaxSquad = Number(maxSquadSize) || 8;

  const teamScores = teams.map((team) => {
    // All heroes acquired by this team
    const squad = (items || []).filter((item) => item.soldTo === team.id);

    // Sort squad by rating descending
    const sortedSquad = [...squad].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    const sortedRatings = sortedSquad.map((h) => Number(h.rating) || 0);

    // Count top N eligible heroes for official total score
    const eligibleSquad = sortedSquad.slice(0, parsedMaxSquad);
    const totalScore = eligibleSquad.reduce((sum, hero) => sum + (Number(hero.rating) || 0), 0);
    const combinedSquadRating = squad.reduce((sum, hero) => sum + (Number(hero.rating) || 0), 0);

    const strongestHero = sortedSquad[0] || null;
    const highestRating = strongestHero ? Number(strongestHero.rating) || 0 : 0;
    const totalSpent = squad.reduce((sum, hero) => sum + (Number(hero.soldPrice) || 0), 0);
    const averageRating = squad.length > 0 ? Number((totalScore / eligibleSquad.length).toFixed(1)) : 0;
    const remainingPurse = Number((team.purse || 0).toFixed(2));

    return {
      ...team,
      maxSquadSize: parsedMaxSquad,
      squad,
      eligibleSquad,
      sortedRatings,
      totalScore,
      totalPoints: totalScore,
      highestRating,
      combinedSquadRating,
      strongestHero,
      totalSpent: Number(totalSpent.toFixed(2)),
      remainingPurse,
      heroesCount: squad.length,
      averageRating,
    };
  });

  // Sort strictly by the official 6-tier ranking priority
  teamScores.sort((a, b) => compareTeamsOfficialRanking(a, b, parsedMaxSquad));

  // Assign 1st, 2nd, 3rd, 4th positions (with shared ranks for true ties)
  let currentRank = 1;
  const rankedTeams = teamScores.map((t, idx, arr) => {
    if (idx > 0) {
      const prev = arr[idx - 1];
      const isTie = compareTeamsOfficialRanking(prev, t, parsedMaxSquad) === 0;
      if (!isTie) {
        currentRank = idx + 1;
      }
    }

    // Determine differentiation reason vs next team (or vs previous if tied)
    let differentiatingReason = '';
    if (idx < arr.length - 1) {
      differentiatingReason = getDifferentiatingCriterion(t, arr[idx + 1], parsedMaxSquad);
    } else if (idx > 0) {
      differentiatingReason = `Ranked #${currentRank}`;
    } else {
      differentiatingReason = 'Championship Leader';
    }

    return {
      ...t,
      rank: currentRank,
      differentiatingReason,
    };
  });

  const champion = rankedTeams[0] || null;
  const runnerUp = rankedTeams[1] || null;
  const winningMargin = champion && runnerUp ? champion.totalScore - runnerUp.totalScore : 0;

  const conclusion = generateTournamentConclusion({
    rankedTeams,
    maxSquadSize: parsedMaxSquad,
  });

  return {
    rankedTeams,
    champion,
    runnerUp,
    winningMargin,
    maxSquadSize: parsedMaxSquad,
    conclusion,
    explanation: `Official 6-Tier Ranking Priority: 1. Total Points (top ${parsedMaxSquad} heroes) → 2. Remaining Purse → 3. Highest Player Rating (MVP) → 4. Subsequent Player Ratings → 5. Combined Squad Rating → 6. Shared Rank.`,
  };
}
