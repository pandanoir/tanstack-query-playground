import { createRoute, createRouter } from '@tanstack/react-router';
import { PostsPage } from './pages/PostsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { rootRoute } from './pages/RootRoute';
import { postDetailRoute } from './pages/PostDetailPage';

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: PostsPage,
});
const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/posts',
  component: PostsPage,
});
const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: NotificationsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  postsRoute,
  postDetailRoute,
  notificationsRoute,
]);

export const router = createRouter({ routeTree });

// ↓Linkなどで使うために必要
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
