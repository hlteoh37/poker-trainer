interface SessionData { handsPlayed: number; bbWonLost: number; }
interface WinRateChartProps { sessions: SessionData[]; }

export function WinRateChart({ sessions }: WinRateChartProps) {
  if (sessions.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-bold mb-3">Win Rate Trend</h3>
        <p className="text-xs text-gray-400">Play some hands to see your trend.</p>
      </div>
    );
  }
  const maxBB = Math.max(...sessions.map((s) => Math.abs(s.bbWonLost)), 10);
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-bold mb-3">Win Rate Trend (BB/session)</h3>
      <div className="flex items-end gap-1 h-24">
        {sessions.slice(-20).map((session, i) => {
          const height = Math.abs(session.bbWonLost) / maxBB * 100;
          const isPositive = session.bbWonLost >= 0;
          return (
            <div key={i} className={`flex-1 rounded-t ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ height: `${Math.max(height, 4)}%` }}
              title={`${isPositive ? '+' : ''}${session.bbWonLost.toFixed(1)} BB`} />
          );
        })}
      </div>
    </div>
  );
}
