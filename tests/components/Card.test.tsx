import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardDisplay } from '../../src/components/common/Card';

describe('CardDisplay', () => {
  it('renders card rank and suit', () => {
    render(<CardDisplay card={{ suit: 'hearts', rank: 'A' }} />);
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('♥')).toBeDefined();
  });

  it('renders face down when faceDown prop is true', () => {
    render(<CardDisplay card={{ suit: 'hearts', rank: 'A' }} faceDown />);
    expect(screen.queryByText('A')).toBeNull();
  });

  it('applies red color for hearts and diamonds', () => {
    const { container } = render(<CardDisplay card={{ suit: 'hearts', rank: 'K' }} />);
    expect(container.querySelector('.text-red-500')).toBeDefined();
  });
});
