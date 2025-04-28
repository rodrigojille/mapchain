import { render, screen } from '@testing-library/react';
import { describe, expect, test } from '@jest/globals';
import { RequestValuationPage } from '../app/properties/[id]/request-valuation/page';

describe('Property Valuation Request Page', () => {
  test('renders both valuation options', () => {
    render(<RequestValuationPage params={{ id: '0.0.123456' }} />);
    
    // Check if the valuation sections are rendered
    expect(screen.getByTestId('quick-valuation')).toBeInTheDocument();
    expect(screen.getByTestId('official-valuation')).toBeInTheDocument();
  });
});
