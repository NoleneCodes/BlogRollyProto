// Example usage for follow/unfollow API in frontend
// You can import and use these in your components

export async function followBlogger(readerId: string, bloggerId: string) {
  const res = await fetch('/api/follow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ readerId, bloggerId }),
  });
  return res.json();
}

export async function unfollowBlogger(readerId: string, bloggerId: string) {
  const res = await fetch('/api/follow', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ readerId, bloggerId }),
  });
  return res.json();
}

export async function getBloggerFollowingCount(bloggerId: string) {
  const res = await fetch(`/api/follow?bloggerId=${bloggerId}`);
  return res.json();
}
