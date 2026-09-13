import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import OnboardingPage, { hasSeenOnboarding } from '../OnboardingPage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/welcome']}>
      <Routes>
        <Route path="/welcome" element={<OnboardingPage />} />
        <Route path="/signup" element={<h1>Signup</h1>} />
        <Route path="/login" element={<h1>Login</h1>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('OnboardingPage', () => {
  beforeEach(() => window.localStorage.clear());

  it('walks through all slides and finishes on signup', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/shopping that feels/i);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    // Exiting slide may still be mounted mid-animation; assert the new one is present.
    expect(await screen.findByRole('heading', { level: 1, name: /pay with confidence/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(await screen.findByRole('button', { name: 'Get started' }));
    expect(screen.getByText('Signup')).toBeInTheDocument();
    expect(hasSeenOnboarding()).toBe(true);
  });

  it('skip goes straight to signup', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: 'Skip' }));
    expect(screen.getByText('Signup')).toBeInTheDocument();
  });

  it('existing users can jump to login', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /already have an account/i }));
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
