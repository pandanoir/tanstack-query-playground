import { useQuery } from '@tanstack/react-query';
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

export function App() {
  const { isLoading, error, data } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    retry: false,
  });
  if (isLoading) return 'loading';
  if (error) return `error: ${error}`;
  if (!data) return 'loading';
  return (
    <ul>
      {data.map((post) => (
        <li key={post.id}>
          {post.title} ({post.views} views)
        </li>
      ))}
    </ul>
  );
}
