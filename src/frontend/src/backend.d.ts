import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type CommentId = string;
export type Time = bigint;
export interface Comment {
    id: CommentId;
    text: string;
    author: Principal;
    timestamp: Time;
}
export type PostId = string;
export interface PostView {
    id: PostId;
    author: Principal;
    likes: Array<Principal>;
    timestamp: Time;
    caption: string;
    image: ExternalBlob;
    comments: Array<Comment>;
}
export interface Profile {
    bio: string;
    displayName: string;
    avatar?: ExternalBlob;
}
export interface backendInterface {
    addComment(postId: PostId, text: string): Promise<CommentId>;
    createPost(image: ExternalBlob, caption: string): Promise<PostId>;
    createProfile(displayName: string, bio: string, avatar: ExternalBlob | null): Promise<void>;
    deleteComment(postId: PostId, commentId: CommentId): Promise<void>;
    follow(user: Principal): Promise<void>;
    getFeed(followingOnly: boolean): Promise<Array<PostView>>;
    getOwnProfile(): Promise<Profile | null>;
    getPostsByUser(user: Principal): Promise<Array<PostView>>;
    getProfile(user: Principal): Promise<Profile | null>;
    likePost(postId: PostId): Promise<void>;
    searchUsers(searchTerm: string): Promise<Array<[Principal, Profile]>>;
    unfollow(user: Principal): Promise<void>;
    unlikePost(postId: PostId): Promise<void>;
}
