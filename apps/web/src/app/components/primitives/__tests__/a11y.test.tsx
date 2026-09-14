import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { axe } from 'vitest-axe';
import { Button } from '../Button';
import { Field } from '../Field';
import { OTPInput } from '../OTPInput';
import { PasswordStrength } from '../PasswordStrength';
import { Card, CardHeader, CardTitle, CardDescription } from '../Card';
import { EmptyState } from '../EmptyState';
import { Skeleton, SkeletonText } from '../Skeleton';
import { SocialButton } from '../SocialButton';
import { BrandMark, BrandWordmark } from '../BrandMark';

// jsdom has no layout engine, so colour-contrast is skipped here; Playwright + @axe-core/playwright covers it in e2e.
const run = (container: HTMLElement) => axe(container, { rules: { 'color-contrast': { enabled: false } } });

describe('primitives have no WCAG 2.2 A/AA violations (axe-core)', () => {
  it('Button variants + loading', async () => {
    const { container } = render(
      <div>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="ghost" size="sm">Ghost</Button>
        <Button loading loadingText="Saving…">Save</Button>
      </div>,
    );
    expect(await run(container)).toHaveNoViolations();
  });

  it('Field with hint, error, hidden label and password toggle', async () => {
    const { container } = render(
      <form>
        <Field label="Email" hint="We never share it" type="email" name="email" />
        <Field label="Password" type="password" name="pw" error="Too short" />
        <Field label="Search" hideLabel placeholder="Search" name="q" />
      </form>,
    );
    expect(await run(container)).toHaveNoViolations();
  });

  it('OTP input boxes are individually labelled', async () => {
    const { container } = render(<OTPInput value="12" onChange={() => {}} />);
    expect(await run(container)).toHaveNoViolations();
  });

  it('PasswordStrength meter', async () => {
    const { container } = render(<PasswordStrength value="Passw0rd!" />);
    expect(await run(container)).toHaveNoViolations();
  });

  it('Card, EmptyState, Skeleton, SocialButton, BrandMark', async () => {
    const { container } = render(
      <MemoryRouter>
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Body</CardDescription>
          </CardHeader>
        </Card>
        <EmptyState kind="cart" title="Your cart is empty" description="Add something you love" action={<Button>Shop</Button>} />
        <Skeleton className="h-4 w-20" />
        <SkeletonText lines={2} />
        <SocialButton provider="google" />
        <SocialButton provider="apple" compact />
        <BrandMark />
        <BrandWordmark />
      </MemoryRouter>,
    );
    expect(await run(container)).toHaveNoViolations();
  });
});
