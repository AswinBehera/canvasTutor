import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ComponentCard } from '../../src/components/ComponentCard';

describe('ComponentCard', () => {
  const mockCard = {
    id: 'test-id',
    label: 'Test Component',
    description: 'A component for testing',
    techOptions: ['Managed Tech', 'DIY Tech'],
    category: 'other',
    baseMetrics: { responsiveness: 80, cost: 20, reliability: 90 },
    scalingFactors: { traffic: 0.1, instances: 0.8 },
  };

  it('renders card details correctly', () => {
    render(<ComponentCard card={mockCard} />);

    expect(screen.getByText('Test Component')).toBeInTheDocument();
    expect(screen.getByText('A component for testing')).toBeInTheDocument();
    expect(screen.getByText('ID: test-id')).toBeInTheDocument();
    expect(screen.getByText('Tech: Managed Tech / DIY Tech')).toBeInTheDocument();
  });

  it('sets dataTransfer on drag start', () => {
    const { container } = render(<ComponentCard card={mockCard} />);
    const cardElement = container.querySelector('.cursor-grab');

    if (cardElement) {
      const dataTransfer = new DataTransfer();
      fireEvent.dragStart(cardElement, { dataTransfer });

      expect(dataTransfer.getData('application/reactflow')).toBe(JSON.stringify(mockCard));
      expect(dataTransfer.effectAllowed).toBe('move');
    } else {
      throw new Error('Card element not found');
    }
  });

  it('applies dragging styles on drag start and removes on drag end', () => {
    const { container } = render(<ComponentCard card={mockCard} />);
    const cardElement = container.querySelector('.cursor-grab');

    if (cardElement) {
      // Simulate drag start
      fireEvent.dragStart(cardElement);
      expect(cardElement).toHaveClass('border-blue-500');
      expect(cardElement).toHaveClass('ring-2');

      // Simulate drag end
      fireEvent.dragEnd(cardElement);
      expect(cardElement).not.toHaveClass('border-blue-500');
      expect(cardElement).not.toHaveClass('ring-2');
    } else {
      throw new Error('Card element not found');
    }
  });
});
