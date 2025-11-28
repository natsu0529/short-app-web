'use client';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div
      className={`${sizes[size]} rounded-full bg-black text-white flex items-center justify-center font-bold ${className}`}
    >
      {initial}
    </div>
  );
}
