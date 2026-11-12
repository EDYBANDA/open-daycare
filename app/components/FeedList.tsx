"use client";

import { useSyncExternalStore } from "react";
import { PostCard } from "@/app/components/PostCard";
import { feedPosts, type FeedPost } from "@/app/data/feed";
import {
  loadStoredPosts,
  subscribeToPosts,
  type StoredPost,
} from "@/app/lib/posts";

const EMPTY_POSTS: StoredPost[] = [];

function toFeedPost(post: StoredPost): FeedPost {
  return { ...post, hearts: 0, comments: 0 };
}

export function FeedList() {
  const storedPosts = useSyncExternalStore(
    subscribeToPosts,
    loadStoredPosts,
    () => EMPTY_POSTS,
  );

  const posts = [...feedPosts, ...storedPosts.map(toFeedPost)].sort((a, b) =>
    b.time.localeCompare(a.time),
  );

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
