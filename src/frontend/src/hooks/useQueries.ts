import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Profile, PostView, PostId, CommentId } from '../backend';
import { Principal } from '@icp-sdk/core/principal';
import { ExternalBlob } from '../backend';

// Profile queries
export function useOwnProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<Profile | null>({
    queryKey: ['profile', 'own'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getOwnProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProfile(principal: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Profile | null>({
    queryKey: ['profile', principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      return actor.getProfile(Principal.fromText(principal));
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useCreateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      displayName,
      bio,
      avatar,
    }: {
      displayName: string;
      bio: string;
      avatar: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createProfile(displayName, bio, avatar);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Post queries
export function useFeed(followingOnly: boolean) {
  const { actor, isFetching } = useActor();

  return useQuery<PostView[]>({
    queryKey: ['feed', followingOnly],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeed(followingOnly);
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePostsByUser(principal: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<PostView[]>({
    queryKey: ['posts', 'user', principal],
    queryFn: async () => {
      if (!actor || !principal) return [];
      return actor.getPostsByUser(Principal.fromText(principal));
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ image, caption }: { image: ExternalBlob; caption: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.createPost(image, caption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Like/Unlike mutations
export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: PostId) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUnlikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: PostId) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.unlikePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Comment mutations
export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, text }: { postId: PostId; text: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addComment(postId, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, commentId }: { postId: PostId; commentId: CommentId }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.deleteComment(postId, commentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Follow mutations
export function useFollow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.follow(Principal.fromText(principal));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

export function useUnfollow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.unfollow(Principal.fromText(principal));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

// Search query
export function useSearchUsers(searchTerm: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[Principal, Profile]>>({
    queryKey: ['search', searchTerm],
    queryFn: async () => {
      if (!actor || !searchTerm.trim()) return [];
      return actor.searchUsers(searchTerm);
    },
    enabled: !!actor && !isFetching && searchTerm.trim().length > 0,
  });
}
