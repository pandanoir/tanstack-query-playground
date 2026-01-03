import { QueryClient } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from '@tanstack/react-router';

export const rootRoute = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: () => (
    <>
      <nav style={{ display: 'flex', gap: '0.5em' }}>
        <Link to="/">Posts</Link>
        <Link to="/notifications">Notifications</Link>
        <Link to="/me">Profile</Link>
      </nav>
      <Outlet />
    </>
  ),
});
