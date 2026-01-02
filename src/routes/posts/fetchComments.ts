import * as v from 'valibot';

const CommentSchema = v.object({
  id: v.string(),
  text: v.string(),
  postId: v.string(),
});
const CommentsSchema = v.array(CommentSchema);

export const fetchComments = async (postId: string) => {
  const url = new URL('http://localhost:3000/comments');
  url.searchParams.append('postId', postId);
  const res = await fetch(url.toString());
  return v.parse(CommentsSchema, await res.json());
};

export const fetchCommentsByUserId = async (userId: string) => {
  const url = new URL('http://localhost:3000/comments');
  url.searchParams.append('userId', userId);
  const res = await fetch(url.toString());
  return v.parse(CommentsSchema, await res.json());
};
