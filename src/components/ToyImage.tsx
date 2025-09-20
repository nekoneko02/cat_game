import React from 'react';
import { getToyImageProps } from '@/constants/toys';

interface ToyImageProps {
  toyId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '6xl';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
  '2xl': 'w-16 h-16',
  '6xl': 'w-24 h-24'
};

const emojiSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl',
  '2xl': 'text-4xl',
  '6xl': 'text-6xl'
};

export const ToyImage: React.FC<ToyImageProps> = ({
  toyId,
  className = '',
  size = 'xl'
}) => {
  const sizeClass = sizeClasses[size];
  const emojiSizeClass = emojiSizeClasses[size];
  const toyImageProps = getToyImageProps(toyId, `${sizeClass} object-contain ${className}`);

  return (
    <img
      src={toyImageProps.src}
      alt={toyImageProps.alt}
      className={toyImageProps.className}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const emojiSpan = document.createElement('span');
        emojiSpan.textContent = toyImageProps.emoji;
        emojiSpan.className = `${emojiSizeClass} flex items-center justify-center ${sizeClass}`;
        target.parentElement?.appendChild(emojiSpan);
      }}
    />
  );
};