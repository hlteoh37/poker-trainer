interface EquityDisplayProps { equity: number; }

export function EquityDisplay({ equity }: EquityDisplayProps) {
  const percentage = Math.round(equity * 100);
  const barColor = percentage > 60 ? 'bg-green-500' : percentage > 40 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-400">Your Equity</span>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-700 rounded-full h-3">
          <div className={`${barColor} h-3 rounded-full transition-all`} style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-sm font-bold text-white w-12 text-right">{percentage}%</span>
      </div>
    </div>
  );
}
