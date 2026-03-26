interface WeakSpotsProps { accuracies: { drillType: string; accuracy: number }[]; }

export function WeakSpots({ accuracies }: WeakSpotsProps) {
  const weak = accuracies.filter((a) => a.accuracy < 0.6 && a.accuracy > 0).sort((a, b) => a.accuracy - b.accuracy);
  const suggestions: Record<string, string> = {
    preflop: 'Practice your opening ranges — focus on position-dependent hand selection.',
    potOdds: 'Work on pot odds math — practice converting bet sizes to required equity.',
    equity: 'Improve your equity intuition — practice estimating hand vs range matchups.',
    postflop: 'Review postflop play — focus on EV-based decision making.',
  };

  if (weak.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-bold mb-2">Areas to Improve</h3>
        <p className="text-xs text-gray-400">
          {accuracies.some((a) => a.accuracy > 0) ? 'Looking good! No major weak spots detected.' : 'Complete some drills to see your weak areas.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-bold mb-2">Areas to Improve</h3>
      <div className="flex flex-col gap-2">
        {weak.map((item) => (
          <div key={item.drillType} className="text-sm">
            <span className="text-red-400 font-medium capitalize">{item.drillType}</span>
            <span className="text-gray-400"> — {Math.round(item.accuracy * 100)}% accuracy</span>
            <p className="text-xs text-gray-500 mt-0.5">{suggestions[item.drillType]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
