import * as v from 'valibot';

export const PaginatedResponseSchema = <T extends v.GenericSchema>(
  dataSchema: T,
) =>
  v.object({
    first: v.number(),
    prev: v.nullable(v.number()),
    next: v.nullable(v.number()),
    last: v.number(),
    pages: v.number(),
    items: v.number(),
    data: v.array(dataSchema),
  });
