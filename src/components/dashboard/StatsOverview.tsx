interface StatsOverviewProps { handsPlayed: number; bbWonLost: number; overallAccuracy: number; drillsCompleted: number; }

export function StatsOverview({ handsPlayed, bbWonLost, overallAccuracy, drillsCompleted }: StatsOverviewProps) {
  const cards = [
    { label: 'Hands Played', value: handsPlayed.toString() },
    { label: 'BB Won/Lost', value: `${bbWonLost >= 0 ? '+' : ''}${bbWonLost.toFixed(1)}`, color: bbWonLost >= 0 ? 'text-green-400' : 'text-red-400' },
    { label: 'Drill Accuracy', value: `${Math.round(overallAccuracy * 100)}%` },
    { label: 'Drills Completed', value: drillsCompleted.toString() },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="bg-gray-800 rounded-lg p-3">
          <div className="text-xs text-gray-400">{card.label}</div>
          <div className={`text-xl font-bold ${card.color ?? 'text-white'}`}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}
