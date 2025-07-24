
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check admin authentication
    const authResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin-auth-check`, {
      method: 'GET',
      headers: {
        cookie: req.headers.cookie || ''
      }
    });

    if (!authResponse.ok) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const authData = await authResponse.json();
    if (!authData.authenticated || !authData.authorized) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch all bug reports ordered by creation date (newest first)
    const { data: bugReports, error } = await supabase
      .from('bug_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bug reports:', error);
      return res.status(500).json({ error: 'Failed to fetch bug reports' });
    }

    return res.status(200).json(bugReports);

  } catch (error) {
    console.error('Error in bug reports API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
