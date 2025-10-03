// Client utility for reading history
export async function addToReadingHistory(readerId: string, blogId: string) {
  const res = await fetch('/api/reader/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ readerId, blogId }),
  });
  return res.json();
}

export async function getReadingHistory(readerId: string) {
  const res = await fetch(`/api/reader/history?readerId=${readerId}`);
  return res.json();
}
