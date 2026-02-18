import { Button } from '@/components/ui/button';
import { useFollow, useUnfollow } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface FollowButtonProps {
  targetPrincipal: string;
}

export default function FollowButton({ targetPrincipal }: FollowButtonProps) {
  const { identity, login } = useInternetIdentity();
  const follow = useFollow();
  const unfollow = useUnfollow();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to follow users');
      login();
      return;
    }

    try {
      await follow.mutateAsync(targetPrincipal);
      toast.success('Followed successfully');
    } catch (error: any) {
      if (error?.message?.includes('Already following')) {
        toast.info('Already following this user');
      } else {
        toast.error('Failed to follow');
      }
    }
  };

  const handleUnfollow = async () => {
    try {
      await unfollow.mutateAsync(targetPrincipal);
      toast.success('Unfollowed successfully');
    } catch (error) {
      toast.error('Failed to unfollow');
    }
  };

  if (!isAuthenticated) {
    return (
      <Button variant="default" size="sm" onClick={login}>
        Sign in to Follow
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleFollow}
      disabled={follow.isPending || unfollow.isPending}
    >
      {follow.isPending || unfollow.isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        'Follow'
      )}
    </Button>
  );
}
