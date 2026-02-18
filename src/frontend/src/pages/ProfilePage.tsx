import { useParams, useNavigate } from '@tanstack/react-router';
import { useProfile, usePostsByUser, useOwnProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import Avatar from '../components/profile/Avatar';
import PostCard from '../components/posts/PostCard';
import FollowButton from '../components/profile/FollowButton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings } from 'lucide-react';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { principal } = useParams({ from: '/u/$principal' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const currentPrincipal = identity?.getPrincipal().toString();
  const isOwnProfile = isAuthenticated && currentPrincipal === principal;

  const { data: ownProfile } = useOwnProfile();
  const { data: profile, isLoading: profileLoading } = useProfile(principal);
  const { data: posts, isLoading: postsLoading } = usePostsByUser(principal);

  // Auto-create profile on first visit to own profile
  useEffect(() => {
    if (isOwnProfile && !ownProfile && !profileLoading) {
      navigate({ to: '/me/edit' });
    }
  }, [isOwnProfile, ownProfile, profileLoading, navigate]);

  if (profileLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-start gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  const postCount = posts?.length || 0;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <Avatar avatar={profile.avatar} displayName={profile.displayName} size="xl" />
        
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{profile.displayName}</h1>
            {isOwnProfile ? (
              <Button variant="outline" size="sm" asChild>
                <a href="/me/edit">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Profile
                </a>
              </Button>
            ) : (
              <FollowButton targetPrincipal={principal} />
            )}
          </div>

          <div className="flex gap-6 text-sm">
            <div>
              <span className="font-semibold">{postCount}</span> posts
            </div>
          </div>

          {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="mb-4 text-lg font-semibold">Posts</h2>
        {postsLoading ? (
          <div className="grid grid-cols-3 gap-1 md:gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        ) : posts && posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">No posts yet</p>
        )}
      </div>
    </div>
  );
}
