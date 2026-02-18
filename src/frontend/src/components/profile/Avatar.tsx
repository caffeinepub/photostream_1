import { Avatar as UIAvatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import type { ExternalBlob } from '../../backend';

interface AvatarProps {
  avatar?: ExternalBlob;
  displayName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24',
};

export default function Avatar({ avatar, displayName, size = 'md' }: AvatarProps) {
  const avatarUrl = avatar?.getDirectURL();

  return (
    <UIAvatar className={sizeClasses[size]}>
      <AvatarImage src={avatarUrl || '/assets/generated/default-avatar.dim_256x256.png'} alt={displayName} />
      <AvatarFallback>
        <User className="h-1/2 w-1/2" />
      </AvatarFallback>
    </UIAvatar>
  );
}
