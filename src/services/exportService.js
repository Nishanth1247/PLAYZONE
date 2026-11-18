// Export Service for CSV and Printing
export const exportService = {
  // Export all players to CSV
  exportPlayersCSV(auction) {
    if (!auction || !auction.items) return;

    const headers = [
      'Lot #',
      'Name',
      'Role / Category',
      'Rating / Score',
      'Base Price',
      'Status',
      'Sold Price',
      'Sold To (Team)',
      'Total Bids'
    ];

    const teamMap = {};
    (auction.teams || []).forEach(t => {
      teamMap[t.id] = t.name;
    });

    const rows = auction.items.map((item, idx) => {
      const soldToName = item.soldTo ? teamMap[item.soldTo] || item.soldTo : '—';
      const soldPrice = item.soldPrice !== undefined && item.soldPrice !== null ? item.soldPrice : '—';
      return [
        idx + 1,
        `"${(item.name || '').replace(/"/g, '""')}"`,
        `"${(item.role || item.category || 'Standard').replace(/"/g, '""')}"`,
        item.rating || 0,
        item.basePrice,
        item.status ? item.status.toUpperCase() : 'PENDING',
        soldPrice,
        `"${soldToName}"`,
        item.bidCount || 0
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadFile(csvContent, `${auction.name || 'auction'}_players.csv`, 'text/csv;charset=utf-8;');
  },

  // Export team summaries to CSV
  exportTeamsCSV(auction) {
    if (!auction || !auction.teams) return;

    const headers = [
      'Team Name',
      'Total Rating Score',
      'Initial Purse',
      'Remaining Purse',
      'Total Spent',
      'Heroes Acquired',
      'Avg Price Per Hero',
      'Highest Purchase',
      'Roster'
    ];

    const maxSquadSize = auction.rules?.maxSquadSize || 8;

    const rows = auction.teams.map(t => {
      const squad = (auction.items || []).filter(item => item.soldTo === t.id);
      const sortedSquad = [...squad].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
      const totalScore = sortedSquad.slice(0, maxSquadSize).reduce((sum, h) => sum + (Number(h.rating) || 0), 0);
      const totalSpent = squad.reduce((sum, i) => sum + (Number(i.soldPrice) || 0), 0);
      const avgPrice = squad.length > 0 ? (totalSpent / squad.length).toFixed(2) : 0;
      const highestPrice = squad.reduce((max, i) => Math.max(max, Number(i.soldPrice) || 0), 0);
      const rosterNames = squad.map(i => `${i.name} [★${i.rating} pts - ${i.soldPrice}]`).join(' | ');

      return [
        `"${t.name.replace(/"/g, '""')}"`,
        totalScore,
        t.initialPurse,
        t.purse,
        totalSpent,
        squad.length,
        avgPrice,
        highestPrice,
        `"${rosterNames.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    this.downloadFile(csvContent, `${auction.name || 'auction'}_teams.csv`, 'text/csv;charset=utf-8;');
  },

  // Helper download trigger
  downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },

  // Printable Summary trigger
  printSummary() {
    window.print();
  }
};
