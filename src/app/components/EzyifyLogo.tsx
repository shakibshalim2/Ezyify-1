import React from 'react';
import logoImage from '../../assets/logo-mark.png';

interface EzyifyLogoProps {
  size?: 'desktop' | 'mobile' | number;
  className?: string;
}

export function EzyifyLogo({ size = 'desktop', className = '' }: EzyifyLogoProps) {
  // Responsive sizing based on context
  const getSize = () => {
    if (size === 'desktop') return 40; // 36-40px for desktop/tablet
    if (size === 'mobile') return 32; // 28-32px for mobile
    return size; // Custom size
  };

  const logoSize = getSize();

  return (
    <img 
      src={logoImage}
      alt="Ezyify Logo"
      width={logoSize}
      height={logoSize}
      className={className}
      style={{ 
        width: logoSize, 
        height: logoSize, 
        objectFit: 'contain',
        display: 'block'
      }}
    />
  );
}
