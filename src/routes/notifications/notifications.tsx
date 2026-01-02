import { useInfiniteQuery } from '@tanstack/react-query';
import { createRoute } from '@tanstack/react-router';
import * as v from 'valibot';
import { rootRoute } from '../root.route';

export const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/notifications',
  component: NotificationsPage,
});

const NotificationSchema = v.object({
  id: v.string(),
  message: v.string(),
  type: v.string(),
  createdAt: v.string(),
});

const PaginatedResponseSchema = <T extends v.GenericSchema>(dataSchema: T) =>
  v.object({
    first: v.number(),
    prev: v.nullable(v.number()),
    next: v.nullable(v.number()),
    last: v.number(),
    pages: v.number(),
    items: v.number(),
    data: v.array(dataSchema),
  });

const fetchNotifications = async ({ pageParam }: { pageParam: number }) => {
  const url = new URL('http://localhost:3000/notifications');
  url.searchParams.append('_page', `${pageParam}`);
  const res = await fetch(url.toString());
  return v.parse(PaginatedResponseSchema(NotificationSchema), await res.json());
};

export function NotificationsPage() {
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
