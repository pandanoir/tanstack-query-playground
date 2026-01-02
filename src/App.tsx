import { useQuery } from '@tanstack/react-query';
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
    retry: false,
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

export function App() {
  const { isLoading, error, data } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    retry: false,
  });
  const [selectedPostId, setSelectedPostId] = useState('');

  if (isLoading) return 'loading';
  if (error) return `error: ${error}`;
  if (!data) return 'loading';

  return selectedPostId !== '' ? (
    <>
      <button onClick={() => setSelectedPostId('')}>back</button>
      <Post id={selectedPostId} />
    </>
  ) : (
    <ul>
      {data.map((post) => (
        <li key={post.id} onClick={() => setSelectedPostId(post.id)}>
          {post.title} ({post.views} views)
        </li>
      ))}
    </ul>
  );
}
