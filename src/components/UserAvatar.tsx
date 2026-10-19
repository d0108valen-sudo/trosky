import React from 'react';

interface UserAvatarProps {
  avatar?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-2xl',
  xl: 'w-20 h-20 text-4xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name = 'Usuario',
  size = 'md',
  className = '',
}) => {
  const isImageUrl = (val?: string): boolean => {
    if (!val) return false;
    const trimmed = val.trim();
    return (
      trimmed.startsWith('data:image/') ||
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('blob:') ||
      trimmed.startsWith('/') ||
      /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(trimmed)
    );
  };

  const isImage = isImageUrl(avatar);
  const containerSize = sizeClasses[size] || sizeClasses.md;

  if (isImage && avatar) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-[#eee5dc] border border-[#dfd5c9] shadow-2xs ${containerSize} ${className}`}
      >
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover rounded-full"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback to text initials if image fails to load
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-full bg-[#f4ece3] border border-[#dfd5c9] text-[#2c2420] shadow-2xs font-semibold select-none ${containerSize} ${className}`}
    >
      <span>{avatar || (name ? name.charAt(0).toUpperCase() : '👤')}</span>
    </div>
  );
};
