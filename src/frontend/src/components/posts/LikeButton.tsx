import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLikePost, useUnlikePost } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import type { PostView } from '../../backend';
import { toast } from 'sonner';

interface LikeButtonProps {
  post: PostView;
}

export default function LikeButton({ post }: LikeButtonProps) {
  const { identity, login } = useInternetIdentity();
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const currentPrincipal = identity?.getPrincipal().toString();
  const isLiked = currentPrincipal
    ? post.likes.some((p) => p.toString() === currentPrincipal)
    : false;

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to like posts');
      login();
      return;
    }

    try {
      if (isLiked) {
        await unlikePost.mutateAsync(post.id);
      } else {
        await likePost.mutateAsync(post.id);
      }
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={likePost.isPending || unlikePost.isPending}
        className="gap-2"
      >
        <Heart
          className={`h-5 w-5 ${isLiked ? 'fill-destructive text-destructive' : ''}`}
        />
        <span className="font-semibold">{post.likes.length}</span>
      </Button>
    </div>
  );
}
