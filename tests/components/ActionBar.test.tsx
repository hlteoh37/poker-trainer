import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionBar } from '../../src/components/table/ActionBar';

describe('ActionBar', () => {
  it('renders fold, call, and raise buttons', () => {
    render(
      <ActionBar validActions={[{ type: 'fold' }, { type: 'call' }, { type: 'raise', minAmount: 20, maxAmount: 1000 }]}
        onAction={vi.fn()} potSize={100} toCall={10} />
    );
    expect(screen.getByText(/Fold/)).toBeDefined();
    expect(screen.getByText(/Call/)).toBeDefined();
    expect(screen.getByText(/Raise/)).toBeDefined();
  });

  it('calls onAction with fold when fold button clicked', () => {
    const onAction = vi.fn();
    render(<ActionBar validActions={[{ type: 'fold' }, { type: 'call' }]} onAction={onAction} potSize={100} toCall={10} />);
    fireEvent.click(screen.getByText(/Fold/));
    expect(onAction).toHaveBeenCalledWith({ type: 'fold' });
  });
});
