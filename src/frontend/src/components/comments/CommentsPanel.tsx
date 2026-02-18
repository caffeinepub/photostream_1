import { useState } from 'react';
import { useAddComment, useDeleteComment, useProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import type { PostView } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { Link } from '@tanstack/react-router';

interface CommentsPanelProps {
  post: PostView;
}

export default function CommentsPanel({ post }: CommentsPanelProps) {
  const { identity, login } = useInternetIdentity();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const [commentText, setCommentText] = useState('');

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const currentPrincipal = identity?.getPrincipal().toString();

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.info('Please sign in to comment');
      login();
      return;
    }

    if (!commentText.trim()) return;

    try {
      await addComment.mutateAsync({
        postId: post.id,
        text: commentText.trim(),
      });
      setCommentText('');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment.mutateAsync({
        postId: post.id,
        commentId,
      });
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="space-y-3">
      {post.comments.length > 0 && (
        <div className="space-y-2">
          {post.comments.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              canDelete={currentPrincipal === comment.author.toString()}
              onDelete={() => handleDeleteComment(comment.id)}
              isDeleting={deleteComment.isPending}
            />
          ))}
        </div>
      )}

      <form onSubmit={handleAddComment} className="flex gap-2">
        <Input
          type="text"
          placeholder={isAuthenticated ? 'Add a comment...' : 'Sign in to comment'}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={!isAuthenticated || addComment.isPending}
          maxLength={200}
        />
        <Button
          type="submit"
          disabled={!isAuthenticated || !commentText.trim() || addComment.isPending}
          size="sm"
        >
          {addComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
        </Button>
      </form>
    </div>
  );
}

function CommentRow({
  comment,
  canDelete,
  onDelete,
  isDeleting,
}: {
  comment: any;
  canDelete: boolean;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const { data: authorProfile } = useProfile(comment.author.toString());
  const timestamp = new Date(Number(comment.timestamp) / 1_000_000);

  return (
    <div className="flex items-start gap-2 text-sm">
      <div className="flex-1">
        <Link
          to="/u/$principal"
          params={{ principal: comment.author.toString() }}
          className="font-semibold hover:underline"
        >
          {authorProfile?.displayName || 'Anonymous'}
        </Link>{' '}
        <span className="text-muted-foreground">{comment.text}</span>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </p>
      </div>
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
