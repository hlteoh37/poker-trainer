interface AccuracyChartProps { accuracies: { label: string; value: number }[]; }

export function AccuracyChart({ accuracies }: AccuracyChartProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-bold mb-3">Drill Accuracy</h3>
      <div className="flex flex-col gap-2">
        {accuracies.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-24 truncate">{item.label}</span>
            <div className="flex-1 bg-gray-700 rounded-full h-4">
              <div className="bg-green-500 h-4 rounded-full transition-all" style={{ width: `${Math.round(item.value * 100)}%` }} />
            </div>
            <span className="text-xs text-white w-10 text-right">{Math.round(item.value * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
