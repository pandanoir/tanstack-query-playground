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

const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    postsRoute,
    postDetailRoute,
    notificationsRoute,
  ]),
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
      <QueryClientProvider client={new QueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}
