import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { createRouter } from '@tanstack/react-router';
import { postsRoute } from './routes/posts/list.route';
import { postDetailRoute } from './routes/posts/detail.route';
import { notificationsRoute } from './routes/notifications/notifications.route';
import { indexRoute } from './routes/index.route';
import { rootRoute } from './routes/root.route';
import { profileRoute } from './routes/me/me.route';

const queryClient = new QueryClient();

const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    profileRoute,
    postsRoute,
    postDetailRoute,
    notificationsRoute,
  ]),
  context: {
    queryClient,
  },
});

// ↓Linkなどで使うために必要
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}
