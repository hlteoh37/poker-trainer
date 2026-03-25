import { useState } from 'react';
import type { PlayerAction } from '../../engine/types';
import type { ValidAction } from '../../engine/betting';
import { Button } from '../common/Button';

interface ActionBarProps {
  validActions: ValidAction[];
  onAction: (action: PlayerAction) => void;
  potSize: number;
  toCall: number;
}

export function ActionBar({ validActions, onAction, potSize, toCall }: ActionBarProps) {
  const raiseAction = validActions.find((a) => a.type === 'raise');
  const [raiseAmount, setRaiseAmount] = useState(raiseAction?.minAmount ?? 0);
  const hasAction = (type: string) => validActions.some((a) => a.type === type);

  return (
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
      <div className="flex gap-2 justify-center">
        {hasAction('fold') && <Button variant="danger" onClick={() => onAction({ type: 'fold' })}>Fold</Button>}
        {hasAction('check') && <Button variant="secondary" onClick={() => onAction({ type: 'check' })}>Check</Button>}
        {hasAction('call') && <Button variant="primary" onClick={() => onAction({ type: 'call' })}>Call {toCall}</Button>}
        {hasAction('all-in') && <Button variant="primary" onClick={() => onAction({ type: 'all-in' })}>All-In</Button>}
      </div>
      {raiseAction && (
        <div className="flex gap-2 items-center justify-center">
          <input type="range" min={raiseAction.minAmount} max={raiseAction.maxAmount} value={raiseAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))} className="flex-1 max-w-48" />
          <Button onClick={() => onAction({ type: 'raise', amount: raiseAmount })}>Raise {raiseAmount}</Button>
        </div>
      )}
      <div className="text-center text-xs text-gray-400">Pot: {potSize}</div>
    </div>
  );
}
