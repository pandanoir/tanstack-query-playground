import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import * as v from 'valibot';

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

function Post({ id }: { id: string }) {
  const { isLoading, error, data } = useQuery({
    queryKey: ['comments', 'filter', id],
    queryFn: () => fetchComments(id),
    staleTime: 30_000, // 再レンダリングした時、前のデータが30秒以内のものなら再フェッチしない
  });

  if (isLoading) return 'loading';
  if (error) return `error: ${error}`;
  if (!data) return 'loading';

  return data.length > 0 ? (
    <ul>
      {data.map((comment) => (
        <li key={comment.id}>{comment.text}</li>
      ))}
    </ul>
  ) : (
    <div>empty</div>
  );
}

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

export function App() {
  const { isLoading, error, data } = useQuery({
    enabled: true, // falseにするとdataがundefinedの状態になる
    queryKey: ['posts'],
    queryFn: fetchPosts,
    refetchOnWindowFocus: true, // dataがstaleになっていてウィンドウに復帰したらリフェッチ
    staleTime: 3_000,
  });

  const [selectedPostId, setSelectedPostId] = useState('');
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

  if (isLoading) return 'loading';
  if (error) return `error: ${error}`;
  if (!data) return 'query is disabled';

  return selectedPostId !== '' ? (
    <>
      <button onClick={() => setSelectedPostId('')}>back</button>
      <Post id={selectedPostId} />
    </>
  ) : (
    <>
      <ul>
        {data.map((post) => (
          <li
            key={post.id}
            onClick={() => {
              if (post.id !== 'xxx') setSelectedPostId(post.id);
            }}
          >
            {post.title} ({post.views} views){' '}
            <button
              disabled={post.id === 'xxx'}
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
    </>
  );
}
