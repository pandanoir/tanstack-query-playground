import * as v from 'valibot';

const ProfileSchema = v.object({
  name: v.string(),
  id: v.string(),
});

export const fetchProfile = async () => {
  await new Promise((r) => setTimeout(r, 1000));
  const res = await fetch('http://localhost:3000/profile');
  return v.parse(ProfileSchema, await res.json());
};
