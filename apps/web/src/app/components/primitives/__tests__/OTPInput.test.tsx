import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OTPInput } from '../OTPInput';

function Harness({ onComplete }: { onComplete?: (v: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <>
      <OTPInput value={value} onChange={setValue} onComplete={onComplete} />
      <output data-testid="value">{value}</output>
    </>
  );
}

describe('OTPInput', () => {
  it('renders six labelled digit boxes', () => {
    render(<Harness />);
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
    expect(screen.getByLabelText('Digit 1 of 6')).toBeInTheDocument();
  });

  it('advances focus while typing and calls onComplete', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    const boxes = screen.getAllByRole('textbox');
    boxes[0].focus();
    await user.keyboard('123456');
    expect(screen.getByTestId('value')).toHaveTextContent('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });

  it('spreads a pasted code across boxes', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const boxes = screen.getAllByRole('textbox');
    boxes[0].focus();
    await user.paste('98 76 54');
    expect(screen.getByTestId('value')).toHaveTextContent('987654');
  });

  it('backspace clears the previous digit', async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const boxes = screen.getAllByRole('textbox');
    boxes[0].focus();
    await user.keyboard('12');
    await user.keyboard('{Backspace}{Backspace}');
    expect(screen.getByTestId('value')).toHaveTextContent('');
  });
});
