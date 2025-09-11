import type { NextApiRequest, NextApiResponse } from 'next';

const mockVerifications = [
  {
    id: 'LNK-001',
    bloggerName: 'Jane Doe',
    linkedinUrl: 'https://linkedin.com/in/janedoe',
    status: 'pending',
    date: '2025-09-01',
    dateSort: 20250901
  },
  {
    id: 'LNK-002',
    bloggerName: 'John Smith',
    linkedinUrl: 'https://linkedin.com/in/johnsmith',
    status: 'approved',
    date: '2025-08-28',
    dateSort: 20250828
  },
  {
    id: 'LNK-003',
    bloggerName: 'Emily Chen',
    linkedinUrl: 'https://linkedin.com/in/emilychen',
    status: 'rejected',
    date: '2025-08-15',
    dateSort: 20250815
  }
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json(mockVerifications);
}
