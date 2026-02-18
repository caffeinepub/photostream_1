import { Link } from '@tanstack/react-router';
import Avatar from '../profile/Avatar';
import type { Profile } from '../../backend';

interface SearchResultRowProps {
  principal: string;
  profile: Profile;
}

export default function SearchResultRow({ principal, profile }: SearchResultRowProps) {
  return (
    <Link
      to="/u/$principal"
      params={{ principal }}
      className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
    >
      <Avatar avatar={profile.avatar} displayName={profile.displayName} size="md" />
      <div className="flex-1">
        <p className="font-medium">{profile.displayName}</p>
        {profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-1">{profile.bio}</p>
        )}
      </div>
    </Link>
  );
}
