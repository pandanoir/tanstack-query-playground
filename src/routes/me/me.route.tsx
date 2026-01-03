import { useQuery } from '@tanstack/react-query';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root.route';
import { fetchProfile } from '../../lib/fetch/profile';

export const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/me',
  component: ProfilePage,
  loader: async ({ context }) => {
    // loader内でデータの存在を保証する (prefetch済みなら即完了するし、prefetchしてなければデータが取得できるかを実行してチェックする)
    await context.queryClient.ensureQueryData({
      queryKey: ['profile'],
      queryFn: fetchProfile,
    });
  },
});

function ProfilePage() {
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  return (
    <>
      <h1>Profile</h1>
      {profileQuery.isLoading ? 'loading' : profileQuery.data?.name}
    </>
  );
}
