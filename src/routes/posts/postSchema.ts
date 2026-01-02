import * as v from 'valibot';

const PostSchema = v.object({
  id: v.string(),
  title: v.string(),
  views: v.number(),
});
export const PostsSchema = v.array(PostSchema);
