import { useInfiniteQuery } from '@tanstack/react-query';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../root.route';
import { fetchNotifications } from './fetchNotifications';

export const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: NotificationsPage,
});

function NotificationsPage() {
  const notificationsQuery = useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    getNextPageParam: (lastPage) => lastPage.next,
    initialPageParam: 1,
  });

  return (
    <>
      <h1>Notifications</h1>
      <ul>
        {notificationsQuery.data?.pages
          .flatMap((page) => page.data)
          .map((notification) => (
            <li key={notification.id}>
              <strong>{notification.type}</strong>: {notification.message}
              <small>
                {' '}
                at {new Date(notification.createdAt).toLocaleString()}
              </small>
            </li>
          ))}
      </ul>
      {notificationsQuery.hasNextPage && (
        <button
          type="button"
          onClick={() => notificationsQuery.fetchNextPage()}
        >
          load more
        </button>
      )}
    </>
  );
}
