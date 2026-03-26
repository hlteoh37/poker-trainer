type DrillType = 'preflop' | 'potOdds' | 'equity' | 'postflop';

interface DrillSelectorProps { onSelect: (drill: DrillType) => void; accuracies: Record<DrillType, number>; }

const DRILLS: { id: DrillType; name: string; description: string }[] = [
  { id: 'preflop', name: 'Preflop Trainer', description: 'Practice opening ranges by position' },
  { id: 'potOdds', name: 'Pot Odds Quiz', description: 'Calculate whether calling is profitable' },
  { id: 'equity', name: 'Equity Estimation', description: 'Estimate your hand equity vs a random hand' },
  { id: 'postflop', name: 'Postflop Scenarios', description: 'Choose the best play in postflop spots' },
];

export function DrillSelector({ onSelect, accuracies }: DrillSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      {DRILLS.map((drill) => (
        <button key={drill.id} onClick={() => onSelect(drill.id)}
          className="bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-lg p-4 text-left transition-colors">
          <h3 className="font-bold text-white mb-1">{drill.name}</h3>
          <p className="text-sm text-gray-400 mb-2">{drill.description}</p>
          {accuracies[drill.id] > 0 && <div className="text-xs text-green-400">Accuracy: {Math.round(accuracies[drill.id] * 100)}%</div>}
        </button>
      ))}
    </div>
  );
}
