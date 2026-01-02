import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root.route';
import { PostsPage } from './posts/list.route';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: PostsPage,
});
