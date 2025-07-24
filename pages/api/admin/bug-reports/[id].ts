
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Bug report ID is required' });
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

    const { status, admin_notes, resolved_at } = req.body;

    // Update bug report
    const { data, error } = await supabase
      .from('bug_reports')
      .update({
        status,
        admin_notes,
        resolved_at,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating bug report:', error);
      return res.status(500).json({ error: 'Failed to update bug report' });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Bug report not found' });
    }

    return res.status(200).json({
      message: 'Bug report updated successfully',
      data: data[0]
    });

  } catch (error) {
    console.error('Error updating bug report:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
