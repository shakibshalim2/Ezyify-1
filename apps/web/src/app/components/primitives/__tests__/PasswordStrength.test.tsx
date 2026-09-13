import { render, screen } from '@testing-library/react';
import { PasswordStrength, isStrongPassword, passwordScore } from '../PasswordStrength';

describe('password rules', () => {
  it('scores each satisfied rule', () => {
    expect(passwordScore('')).toBe(0);
    expect(passwordScore('abcdefgh')).toBe(1);
    expect(passwordScore('Abcdefgh')).toBe(2);
    expect(passwordScore('Abcdefg1')).toBe(3);
    expect(passwordScore('Abcdefg1!')).toBe(4);
    expect(isStrongPassword('Abcdefg1!')).toBe(true);
  });

  it('renders nothing for an empty value and the label otherwise', () => {
    const { container, rerender } = render(<PasswordStrength value="" />);
    expect(container).toBeEmptyDOMElement();
    rerender(<PasswordStrength value="Abcdefg1!" />);
    expect(screen.getByText('Strong')).toBeInTheDocument();
  });
});
