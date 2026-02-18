import { useState } from 'react';
import { useFeed } from '../hooks/useQueries';
import PostCard from '../components/posts/PostCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function FeedPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const [followingOnly, setFollowingOnly] = useState(false);
  const { data: posts, isLoading, error } = useFeed(followingOnly);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-destructive">Failed to load feed</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {isAuthenticated && (
        <div className="mb-6 flex gap-2">
          <Button
            variant={!followingOnly ? 'default' : 'outline'}
            onClick={() => setFollowingOnly(false)}
            className="flex-1"
          >
            All
          </Button>
          <Button
            variant={followingOnly ? 'default' : 'outline'}
            onClick={() => setFollowingOnly(true)}
            className="flex-1"
          >
            Following
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4 rounded-lg border bg-card p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="aspect-square w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-6 py-12">
          <img
            src="/assets/generated/empty-feed.dim_1200x800.png"
            alt="No posts yet"
            className="max-w-md w-full opacity-50"
          />
          <div className="text-center">
            <h3 className="text-lg font-semibold">No posts yet</h3>
            <p className="text-muted-foreground">
              {followingOnly
                ? 'Follow some users to see their posts here'
                : 'Be the first to share something!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
