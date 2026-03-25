import type { ActionEV } from '../../stats/types';

interface EvDisplayProps { actionEVs: ActionEV[]; }

export function EvDisplay({ actionEVs }: EvDisplayProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-400">Expected Value</span>
      <div className="flex flex-col gap-1">
        {actionEVs.map((ev) => (
          <div key={ev.action.type} className="flex justify-between text-sm">
            <span className="capitalize text-gray-300">{ev.action.type}</span>
            <span className={ev.ev >= 0 ? 'text-green-400' : 'text-red-400'}>
              {ev.ev >= 0 ? '+' : ''}{ev.ev.toFixed(1)} BB
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
