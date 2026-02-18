# Specification

## Summary
**Goal:** Build a simple Instagram-like social app with Internet Identity sign-in, profiles, photo posts, a feed, and basic social interactions (likes, comments, follows) plus discovery search.

**Planned changes:**
- Add Internet Identity authentication (sign in/out) and use the principal to identify the current user.
- Implement backend profile model and APIs for creating an initial profile on first sign-in, updating display name/bio/avatar, and viewing other users’ profiles (including post/follower/following counts).
- Implement photo post creation with image upload, caption, timestamp, author; store posts in the single Motoko actor and render them in the frontend with image validation errors for invalid size/type.
- Build a mobile-first home feed UI listing posts (image, author, caption, time) with loading/empty states and pagination or incremental loading.
- Add likes (like/unlike with deduping per user) and comments (add + delete by comment author) with UI updates.
- Add follow/unfollow, follower/following counts on profiles, and a “Following” feed filter mode.
- Add basic discovery: user search by display name with loading/empty-result states and navigation to profile pages.
- Apply a consistent visual theme across screens (no blue/purple as the primary palette).
- Include generated static assets (logo, default avatar, empty-state illustration) and reference them from the frontend.

**User-visible outcome:** Visitors can browse a read-only landing/feed, sign in with Internet Identity to create a profile, upload photo posts, view feeds (including followed-only), like/unlike, comment (and delete their own comments), follow/unfollow users, search for users, and see a consistent themed UI with default/empty-state visuals.
