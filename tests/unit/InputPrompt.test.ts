import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InputPrompt } from '../../src/components/InputPrompt';

describe('InputPrompt', () => {
  it('renders correctly with all fields', () => {
    render(<InputPrompt onSubmit={vi.fn()} isLoading={false} />);

    expect(screen.getByLabelText(/What do you want to build?/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Goal \(Optional\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Core Features \(Optional\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tech Preferences \(Optional\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Components/i })).toBeInTheDocument();
  });

  it('calls onSubmit with correct data on form submission', async () => {
    const handleSubmit = vi.fn();
    render(<InputPrompt onSubmit={handleSubmit} isLoading={false} />);

    const descriptionInput = screen.getByLabelText(/What do you want to build?/i);
    const goalInput = screen.getByLabelText(/Goal \(Optional\)/i);
    const featuresInput = screen.getByLabelText(/Core Features \(Optional\)/i);
    const techPreferencesInput = screen.getByLabelText(/Tech Preferences \(Optional\)/i);
    const submitButton = screen.getByRole('button', { name: /Generate Components/i });

    fireEvent.change(descriptionInput, { target: { value: 'A test app' } });
    fireEvent.change(goalInput, { target: { value: 'Test goal' } });
    fireEvent.change(featuresInput, { target: { value: 'Test features' } });
    fireEvent.change(techPreferencesInput, { target: { value: 'Test tech' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
      expect(handleSubmit).toHaveBeenCalledWith(JSON.stringify({
        description: 'A test app',
        goal: 'Test goal',
        features: 'Test features',
        techPreferences: 'Test tech',
      }));
    });
  });

  it('shows loading state when isLoading is true', () => {
    render(<InputPrompt onSubmit={vi.fn()} isLoading={true} />);
    expect(screen.getByRole('button', { name: /Generating.../i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generating.../i })).toBeDisabled();
  });

  it('displays success message and clears form on successful submission', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined); // Simulate successful submission
    render(<InputPrompt onSubmit={handleSubmit} isLoading={false} />);

    fireEvent.change(screen.getByLabelText(/What do you want to build?/i), { target: { value: 'Success test' } });
    fireEvent.click(screen.getByRole('button', { name: /Generate Components/i }));

    await waitFor(() => {
      expect(screen.getByText(/Components generated successfully!/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/What do you want to build?/i)).toHaveValue('');
    });
  });

  it('displays error message on failed submission', async () => {
    const handleSubmit = vi.fn().mockRejectedValue(new Error('API Error')); // Simulate failed submission
    render(<InputPrompt onSubmit={handleSubmit} isLoading={false} />);

    fireEvent.change(screen.getByLabelText(/What do you want to build?/i), { target: { value: 'Error test' } });
    fireEvent.click(screen.getByRole('button', { name: /Generate Components/i }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to generate components. Please try again./i)).toBeInTheDocument();
    });
  });
});
