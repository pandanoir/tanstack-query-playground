import * as v from 'valibot';
import { PostsSchema } from './postSchema';

export const fetchPosts = async () => {
  const res = await fetch('http://localhost:3000/posts');
  return v.parse(PostsSchema, await res.json());
};
