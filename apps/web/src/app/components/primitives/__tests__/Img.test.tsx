import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Img } from '../Img';

describe('Img', () => {
  it('renders the source image and swaps to the fallback glyph on error', () => {
    render(<Img src="https://cdn.example/x.jpg" alt="Sneaker" className="size-10" />);
    const img = screen.getByAltText('Sneaker');
    fireEvent.error(img);
    const fallback = screen.getByRole('img', { name: 'Sneaker' });
    expect(fallback.tagName).toBe('SPAN');
    expect(fallback.className).toContain('bg-muted');
  });
  it('uses fallbackSrc when provided', () => {
    render(<Img src="https://cdn.example/x.jpg" alt="Sara" fallbackSrc="data:image/svg+xml;utf8,x" />);
    fireEvent.error(screen.getByAltText('Sara'));
    expect((screen.getByAltText('Sara') as HTMLImageElement).src).toContain('data:image/svg+xml');
  });
  it('renders the fallback immediately when src is empty', () => {
    render(<Img src="" alt="Empty" />);
    expect(screen.getByRole('img', { name: 'Empty' }).tagName).toBe('SPAN');
  });
});
