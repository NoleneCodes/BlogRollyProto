// Client utility for saved blogs
export async function saveBlog(readerId: string, blogId: string) {
  const res = await fetch('/api/reader/saved', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ readerId, blogId }),
  });
  return res.json();
}

export async function removeSavedBlog(readerId: string, blogId: string) {
  const res = await fetch('/api/reader/saved', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ readerId, blogId }),
  });
  return res.json();
}

export async function getSavedBlogs(readerId: string) {
  const res = await fetch(`/api/reader/saved?readerId=${readerId}`);
  return res.json();
}
