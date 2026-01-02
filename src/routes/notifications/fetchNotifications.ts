import * as v from 'valibot';
import { PaginatedResponseSchema } from '../../lib/schema/paginatedResponse';

const NotificationSchema = v.object({
  id: v.string(),
  message: v.string(),
  type: v.string(),
  createdAt: v.string(),
});

export const fetchNotifications = async ({
  pageParam,
}: {
  pageParam: number;
}) => {
  const url = new URL('http://localhost:3000/notifications');
  url.searchParams.append('_page', `${pageParam}`);
  const res = await fetch(url.toString());
  return v.parse(PaginatedResponseSchema(NotificationSchema), await res.json());
};
