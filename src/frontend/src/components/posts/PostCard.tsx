import { Link } from '@tanstack/react-router';
import type { PostView } from '../../backend';
import Avatar from '../profile/Avatar';
import { useProfile } from '../../hooks/useQueries';
import LikeButton from './LikeButton';
import CommentsPanel from '../comments/CommentsPanel';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: PostView;
}

export default function PostCard({ post }: PostCardProps) {
  const { data: authorProfile } = useProfile(post.author.toString());
  const timestamp = new Date(Number(post.timestamp) / 1_000_000);

  return (
    <article className="rounded-lg border bg-card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <Link to="/u/$principal" params={{ principal: post.author.toString() }}>
          <Avatar
            avatar={authorProfile?.avatar}
            displayName={authorProfile?.displayName}
            size="md"
          />
        </Link>
        <div className="flex-1">
          <Link
            to="/u/$principal"
            params={{ principal: post.author.toString() }}
            className="font-semibold hover:underline"
          >
            {authorProfile?.displayName || 'Anonymous'}
          </Link>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>

      <img
        src={post.image.getDirectURL()}
        alt={post.caption}
        className="w-full object-cover"
        style={{ maxHeight: '600px' }}
      />

      <div className="p-4 space-y-4">
        <LikeButton post={post} />

        {post.caption && (
          <div>
            <Link
              to="/u/$principal"
              params={{ principal: post.author.toString() }}
              className="font-semibold hover:underline"
            >
              {authorProfile?.displayName || 'Anonymous'}
            </Link>{' '}
            <span className="text-muted-foreground">{post.caption}</span>
          </div>
        )}

        <CommentsPanel post={post} />
      </div>
    </article>
  );
}
