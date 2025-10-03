import type { NextApiRequest, NextApiResponse } from 'next';

// Dummy user data for demo; replace with real DB/user lookup
const mockUser = {
  id: 'reader-123',
  name: 'Jane Doe',
  email: 'jane@example.com',
  displayName: 'Jane',
  bio: 'A passionate reader and lifelong learner.',
  joinedDate: '2023-01-01',
  avatar: '',
  topics: ['Tech', 'Health'],
  roles: ['reader'],
  tier: 'free',
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Add authentication/session check here
  if (req.method === 'GET') {
    res.status(200).json(mockUser);
  } else if (req.method === 'PATCH') {
    // For demo: update mockUser in-memory (not persistent)
    const { displayName, bio } = req.body;
    if (displayName) mockUser.displayName = displayName;
    if (bio) mockUser.bio = bio;
    res.status(200).json({ success: true, user: mockUser });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
