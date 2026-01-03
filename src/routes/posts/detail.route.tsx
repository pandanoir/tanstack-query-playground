import { createRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { rootRoute } from '../root.route';
import { fetchComments } from './fetchComments';

export const postDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/posts/$id',
  component: PostDetailPage,
});

function PostDetailPage() {
  const { id } = postDetailRoute.useParams();

  const { isLoading, error, data } = useQuery({
    queryKey: ['comments', 'filter by post id', id],
    queryFn: async ({ queryKey }) => {
      await new Promise((r) => setTimeout(r, 5000));
      return await fetchComments(queryKey[2]);
    },
    staleTime: 30_000,
  });

  if (isLoading) return 'loading';
  if (error) return `error: ${error}`;
  if (!data) return 'loading';

  return (
    <>
      <Link to="/">← Back to posts</Link>
      <h1>Post</h1>
      {data.length > 0 ? (
        <ul>
          {data.map((comment) => (
            <li key={comment.id}>{comment.text}</li>
          ))}
        </ul>
      ) : (
        <div>empty</div>
      )}
    </>
  );
}
