import Image from 'next/image';
import { getImagePath, getImageAlt, type ImageId } from '@/constants/images';

interface GameIconProps {
  imageId: ImageId;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '6xl';
  className?: string;
  fallbackEmoji?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
  '2xl': 'w-16 h-16',
  '3xl': 'w-24 h-24',
  '6xl': 'w-48 h-48'
};

export const GameIcon: React.FC<GameIconProps> = ({
  imageId,
  size = 'md',
  className = '',
  fallbackEmoji
}) => {
  const imagePath = getImagePath(imageId);
  const altText = getImageAlt(imageId);
  const sizeClass = sizeClasses[size];

  return (
    <div className={`${sizeClass} relative ${className}`}>
      <Image
        src={imagePath}
        alt={altText}
        fill
        className="object-contain"
        onError={(e) => {
          if (fallbackEmoji) {
            const target = e.target as HTMLImageElement;
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `<span class="flex items-center justify-center ${sizeClass} text-${size}">${fallbackEmoji}</span>`;
            }
          }
        }}
      />
    </div>
  );
};