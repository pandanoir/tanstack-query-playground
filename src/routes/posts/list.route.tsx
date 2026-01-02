import { createRoute, Link } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import * as v from 'valibot';
import { rootRoute } from '../root.route';

export const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/posts',
  component: PostsPage,
});

const ProfileSchema = v.object({
  name: v.string(),
  id: v.string(),
});

const PostSchema = v.object({
  id: v.string(),
  title: v.string(),
  views: v.number(),
});
const PostsSchema = v.array(PostSchema);

const fetchPosts = async () => {
  const res = await fetch('http://localhost:3000/posts');
  return v.parse(PostsSchema, await res.json());
};

const CommentSchema = v.object({
  id: v.string(),
  text: v.string(),
  postId: v.string(),
});
const CommentsSchema = v.array(CommentSchema);

const fetchComments = async (postId: string) => {
  const url = new URL('http://localhost:3000/comments');
  url.searchParams.append('postId', postId);
  const res = await fetch(url.toString());
  return v.parse(CommentsSchema, await res.json());
};

const fetchCommentsByUserId = async (userId: string) => {
  const url = new URL('http://localhost:3000/comments');
  url.searchParams.append('userId', userId);
  const res = await fetch(url.toString());
  return v.parse(CommentsSchema, await res.json());
};

const createPost = async (title: string) => {
  const res = await fetch('http://localhost:3000/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      views: 0,
    }),
  });
  if (!res.ok) {
    throw new Error('Request failed');
  }
  return await res.json();
};

const removePost = async (postId: string) => {
  const res = await fetch(`http://localhost:3000/posts/${postId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error('Request failed');
  }
  return await res.json();
};

export function PostsPage() {
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/profile');
      return v.parse(ProfileSchema, await res.json());
    },
  });

  const postsQuery = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    refetchOnWindowFocus: true, // dataがstaleになっていてウィンドウに復帰したらリフェッチ
    staleTime: 3_000,
  });

  const myCommentsQuery = useQuery({
    enabled: !!profileQuery.data?.id,
    queryKey: ['comments', 'filter by user id', profileQuery.data?.id],
    queryFn: async ({ queryKey }) => {
      const userId = queryKey[2];
      if (userId) {
        return await fetchCommentsByUserId(userId);
      }
    },
  });

  const [isOptimisticMode, setIsOptimisticMode] = useState(false);

  const queryClient = useQueryClient();
  const createPostMutation = useMutation({
    mutationFn: isOptimisticMode
      ? async (title: string) => {
        await new Promise((r) => setTimeout(r, 1000));
        if (Math.trunc(Math.random() * 2) === 0) throw new Error('fail');
        return await createPost(title);
      }
      : createPost,

    onMutate: async (title) => {
      // 進行中のリフェッチをキャンセル (楽観的更新したデータが上書きされるのを防ぐ)
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      // 復元用に今の状態を保持
      const prevPosts = queryClient.getQueryData(['posts']);

      // 楽観的更新
      queryClient.setQueryData(
        ['posts'],
        (old: v.InferOutput<typeof PostsSchema>) => [
          ...old,
          { id: 'xxx', title, views: 0 },
        ],
      );

      // 復元できるように今の状態を渡す
      return { prevPosts };
    },
    onError: async (_err, _newTodo, context) => {
      if (context) {
        await queryClient.setQueryData(['posts'], context.prevPosts); // ロールバック
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
  const removePostMutation = useMutation({
    mutationFn: removePost,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  if (postsQuery.isLoading) return 'loading';
  if (postsQuery.error) return `error: ${postsQuery.error}`;
  if (!postsQuery.data) return 'query is disabled';

  return (
    <>
      <h1>Posts</h1>
      <ul>
        {postsQuery.data.map((post) => (
          <li
            key={post.id}
            onMouseEnter={() => {
              queryClient.prefetchQuery({
                queryKey: ['comments', 'filter by post id', post.id],
                queryFn: ({ queryKey }) => fetchComments(queryKey[2]),
              });
            }}
          >
            <Link
              to="/posts/$id"
              params={{ id: post.id }}
              disabled={post.id === 'xxx'}
            >
              {post.title} ({post.views} views)
            </Link>{' '}
            <button
              disabled={post.id === 'xxx'}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removePostMutation.mutate(post.id);
              }}
            >
              remove
            </button>
          </li>
        ))}
      </ul>
      <label>
        <input
          type="checkbox"
          checked={isOptimisticMode}
          onChange={(e) => setIsOptimisticMode(e.target.checked)}
        />
        optimistic mode
      </label>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!(e.target instanceof HTMLFormElement)) return;
          const title = new FormData(e.target).get('title');
          if (typeof title !== 'string' || title === '') return;

          createPostMutation.mutate(title);
        }}
      >
        <input name="title" />
        <button type="submit">create</button>
      </form>
      <h2>My comments</h2>
      {myCommentsQuery.isLoading ? (
        'loading'
      ) : (
        <ul>
          {myCommentsQuery.data?.map((comment) => (
            <li key={comment.id}>{comment.text}</li>
          ))}
        </ul>
      )}
    </>
  );
}
