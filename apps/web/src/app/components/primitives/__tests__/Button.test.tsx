import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('shows loading state and disables interaction', () => {
    render(
      <Button loading loadingText="Saving…">
        Save
      </Button>,
    );
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
    expect(btn).toHaveTextContent('Saving…');
  });

  it('defaults to type=button so it never submits forms accidentally', () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });
});
