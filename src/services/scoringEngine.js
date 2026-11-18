// BIDBATTLE 3.0 — Competitive Winner Determination & Scoring Engine
// Rules:
// 1. Every purchased hero contributes their assigned rating (1-100) to the team's total score.
// 2. Best eligible heroes up to the configured maximum squad size are counted towards the score.
// 3. Teams are ranked strictly by Total Score (sum of ratings) — NOT by money spent!
// 4. Tie-breaker 1: Higher remaining purse wins.
// 5. Tie-breaker 2: Higher single-hero rating (MVP) wins.
// 6. If still tied: Shared position.

export function calculateTeamRankings(teams = [], items = [], maxSquadSize = 8) {
  if (!teams || teams.length === 0) return { rankedTeams: [], champion: null, winningMargin: 0 };

  const parsedMaxSquad = Number(maxSquadSize) || 8;

  const teamScores = teams.map((team) => {
    // All heroes acquired by this team
    const squad = (items || []).filter((item) => item.soldTo === team.id);

    // Sort squad by rating descending to count the top N eligible heroes
    const sortedSquad = [...squad].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    const eligibleSquad = sortedSquad.slice(0, parsedMaxSquad);

    const totalScore = eligibleSquad.reduce((sum, hero) => sum + (Number(hero.rating) || 0), 0);
    const strongestHero = sortedSquad[0] || null;
    const totalSpent = squad.reduce((sum, hero) => sum + (Number(hero.soldPrice) || 0), 0);
    const averageRating = squad.length > 0 ? (totalScore / eligibleSquad.length).toFixed(1) : 0;

    return {
      ...team,
      squad,
      eligibleSquad,
      totalScore,
      strongestHero,
      totalSpent: Number(totalSpent.toFixed(2)),
      remainingPurse: Number(team.purse.toFixed(2)),
      heroesCount: squad.length,
      averageRating: Number(averageRating),
    };
  });

  // Ranking Order:
  // 1. Total Score (sum of top ratings) descending
  // 2. Tie-breaker 1: Remaining Purse descending
  // 3. Tie-breaker 2: Highest individual hero rating descending
  teamScores.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    if (b.remainingPurse !== a.remainingPurse) {
      return b.remainingPurse - a.remainingPurse;
    }
    const aTop = a.strongestHero?.rating || 0;
    const bTop = b.strongestHero?.rating || 0;
    return bTop - aTop;
  });

  // Assign 1st, 2nd, 3rd, 4th positions (with shared ranks for true ties)
  let currentRank = 1;
  const rankedTeams = teamScores.map((t, idx, arr) => {
    if (idx > 0) {
      const prev = arr[idx - 1];
      const isTie =
        prev.totalScore === t.totalScore &&
        prev.remainingPurse === t.remainingPurse &&
        (prev.strongestHero?.rating || 0) === (t.strongestHero?.rating || 0);

      if (!isTie) {
        currentRank = idx + 1;
      }
    }
    return {
      ...t,
      rank: currentRank,
    };
  });

  const champion = rankedTeams[0] || null;
  const runnerUp = rankedTeams[1] || null;
  const winningMargin = champion && runnerUp ? champion.totalScore - runnerUp.totalScore : 0;

  return {
    rankedTeams,
    champion,
    runnerUp,
    winningMargin,
    maxSquadSize: parsedMaxSquad,
    explanation: `Total Team Score = Sum of ratings for the top ${parsedMaxSquad} acquired heroes. Higher remaining purse breaks ties.`,
  };
}
