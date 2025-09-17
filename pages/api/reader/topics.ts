import type { NextApiRequest, NextApiResponse } from 'next';

// Dummy topics for demo; replace with real DB/user lookup
const mockTopics = ['Tech', 'Health', 'Productivity'];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return topics the reader is following
    res.status(200).json({ topics: mockTopics });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
