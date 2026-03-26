import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreflopDrill } from '../../src/components/drills/PreflopDrill';

describe('PreflopDrill', () => {
  it('renders a hand and position', () => {
    render(<PreflopDrill onResult={vi.fn()} />);
    expect(screen.getByText(/Position:/)).toBeDefined();
    expect(screen.getAllByText(/Open/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Fold/).length).toBeGreaterThan(0);
  });

  it('shows feedback after selecting an action', () => {
    render(<PreflopDrill onResult={vi.fn()} />);
    fireEvent.click(screen.getByText(/Fold/));
    const feedback = screen.getByTestId('drill-feedback');
    expect(feedback).toBeDefined();
  });
});
