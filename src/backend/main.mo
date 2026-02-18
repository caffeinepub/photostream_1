import Time "mo:core/Time";
import Text "mo:core/Text";
import List "mo:core/List";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import ExternalBlob "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type PostId = Text;
  type CommentId = Text;
  type Profile = {
    displayName : Text;
    bio : Text;
    avatar : ?ExternalBlob.ExternalBlob;
  };

  type Post = {
    id : PostId;
    author : Principal;
    image : ExternalBlob.ExternalBlob;
    caption : Text;
    timestamp : Time.Time;
    likes : List.List<Principal>;
    comments : List.List<Comment>;
  };

  type PostView = {
    id : PostId;
    author : Principal;
    image : ExternalBlob.ExternalBlob;
    caption : Text;
    timestamp : Time.Time;
    likes : [Principal];
    comments : [Comment];
  };

  type Comment = {
    id : CommentId;
    author : Principal;
    text : Text;
    timestamp : Time.Time;
  };

  let profiles = Map.empty<Principal, Profile>();
  let posts = Map.empty<PostId, Post>();
  let followers = Map.empty<Principal, List.List<Principal>>();
  let following = Map.empty<Principal, List.List<Principal>>();

  var nextPostId = 0;
  var nextCommentId = 0;

  public shared ({ caller }) func createProfile(displayName : Text, bio : Text, avatar : ?ExternalBlob.ExternalBlob) : async () {
    let profile : Profile = { displayName; bio; avatar };
    profiles.add(caller, profile);
  };

  public query ({ caller }) func getOwnProfile() : async ?Profile {
    profiles.get(caller);
  };

  public query ({ caller }) func getProfile(user : Principal) : async ?Profile {
    profiles.get(user);
  };

  public shared ({ caller }) func createPost(image : ExternalBlob.ExternalBlob, caption : Text) : async PostId {
    let postId = nextPostId.toText();
    nextPostId += 1;

    let post : Post = {
      id = postId;
      author = caller;
      image;
      caption;
      timestamp = Time.now();
      likes = List.empty<Principal>();
      comments = List.empty<Comment>();
    };

    posts.add(postId, post);
    postId;
  };

  public shared ({ caller }) func likePost(postId : PostId) : async () {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        if (post.likes.values().contains(caller)) { Runtime.trap("Already liked") };
        post.likes.add(caller);
      };
    };
  };

  public shared ({ caller }) func unlikePost(postId : PostId) : async () {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let filteredLikes = post.likes.values().filter(func(p) { p != caller });
        post.likes.clear();
        filteredLikes.forEach(func(p) { post.likes.add(p) });
      };
    };
  };

  public shared ({ caller }) func addComment(postId : PostId, text : Text) : async CommentId {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let commentId = nextCommentId.toText();
        nextCommentId += 1;

        let comment : Comment = {
          id = commentId;
          author = caller;
          text;
          timestamp = Time.now();
        };
        post.comments.add(comment);
        commentId;
      };
    };
  };

  public shared ({ caller }) func deleteComment(postId : PostId, commentId : CommentId) : async () {
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let filteredComments = post.comments.values().filter(
          func(c) { c.id != commentId or c.author != caller }
        );
        post.comments.clear();
        filteredComments.forEach(func(c) { post.comments.add(c) });
      };
    };
  };

  public shared ({ caller }) func follow(user : Principal) : async () {
    if (user == caller) { Runtime.trap("Cannot follow yourself") };
    if (not profiles.containsKey(user)) { Runtime.trap("User does not exist") };

    switch (following.get(caller)) {
      case (null) {
        let followingList = List.empty<Principal>();
        followingList.add(user);
        following.add(caller, followingList);
      };
      case (?followingList) {
        if (followingList.values().contains(user)) { Runtime.trap("Already following") };
        followingList.add(user);
      };
    };

    switch (followers.get(user)) {
      case (null) {
        let followersList = List.empty<Principal>();
        followersList.add(caller);
        followers.add(user, followersList);
      };
      case (?followersList) {
        followersList.add(caller);
      };
    };
  };

  public shared ({ caller }) func unfollow(user : Principal) : async () {
    if (user == caller) { Runtime.trap("Cannot unfollow yourself") };
    switch (following.get(caller)) {
      case (null) { Runtime.trap("Not following this user") };
      case (?followingList) {
        let filteredFollowing = followingList.values().filter(func(f) { f != user });
        followingList.clear();
        filteredFollowing.forEach(func(f) { followingList.add(f) });
      };
    };

    switch (followers.get(user)) {
      case (null) { Runtime.trap("No followers found for user") };
      case (?followersList) {
        let filteredFollowers = followersList.values().filter(func(f) { f != caller });
        followersList.clear();
        filteredFollowers.forEach(func(f) { followersList.add(f) });
      };
    };
  };

  module Post {
    public func compare(p1 : Post, p2 : Post) : Order.Order {
      Int.compare(p2.timestamp, p1.timestamp);
    };
  };

  func toPostView(post : Post) : PostView {
    {
      id = post.id;
      author = post.author;
      image = post.image;
      caption = post.caption;
      timestamp = post.timestamp;
      likes = post.likes.values().toArray();
      comments = post.comments.values().toArray();
    };
  };

  public query ({ caller }) func getPostsByUser(user : Principal) : async [PostView] {
    let postsArray = posts.values().toArray().filter(func(post) { post.author == user });
    postsArray.map(func(post) { toPostView(post) });
  };

  public query ({ caller }) func getFeed(followingOnly : Bool) : async [PostView] {
    let allPosts = posts.values().toArray().map(func(post) { toPostView(post) });

    if (not followingOnly) {
      return allPosts.sort(
        func(p1, p2) { Int.compare(p2.timestamp, p1.timestamp) }
      );
    };

    switch (following.get(caller)) {
      case (null) { [] };
      case (?followingList) {
        allPosts.sort(
          func(p1, p2) { Int.compare(p2.timestamp, p1.timestamp) }
        ).filter(func(post) { followingList.values().contains(post.author) });
      };
    };
  };

  public query ({ caller }) func searchUsers(searchTerm : Text) : async [(Principal, Profile)] {
    let results = List.empty<(Principal, Profile)>();

    for ((principal, profile) in profiles.entries()) {
      if (profile.displayName.contains(#text searchTerm)) {
        results.add((principal, profile));
      };
    };
    results.toArray();
  };
};
