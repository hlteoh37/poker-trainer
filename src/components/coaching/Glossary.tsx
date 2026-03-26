import { useState } from 'react';

const TERMS: Record<string, string> = {
  UTG: 'Under the Gun — first to act preflop, tightest position',
  MP: 'Middle Position — moderate opening range',
  CO: 'Cutoff — one seat before the dealer, wide opening range',
  BTN: 'Button (Dealer) — best position, acts last postflop',
  SB: 'Small Blind — forced half-bet, worst postflop position',
  BB: 'Big Blind — forced full bet, defends wide preflop',
  EV: 'Expected Value — average chips won/lost over many hands',
  Equity: 'Your chance of winning the hand at showdown',
  'Pot Odds': 'The ratio of chips to call vs. what you can win',
  GTO: 'Game Theory Optimal — unexploitable balanced strategy',
};

export function Glossary() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-gray-700 pt-2">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-gray-500 hover:text-gray-300 w-full text-left flex items-center gap-1"
      >
        <span>{open ? '▾' : '▸'}</span>
        <span>Glossary</span>
      </button>
      {open && (
        <dl className="mt-2 flex flex-col gap-1.5">
          {Object.entries(TERMS).map(([term, def]) => (
            <div key={term}>
              <dt className="text-xs font-bold text-gray-300 inline">{term}: </dt>
              <dd className="text-[11px] text-gray-400 inline">{def}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
