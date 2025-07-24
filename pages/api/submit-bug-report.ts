
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { title, description, userEmail, page, severity, category } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Insert bug report into database
    const { data, error } = await supabase
      .from('bug_reports')
      .insert([
        {
          title,
          description,
          user_email: userEmail || null,
          page,
          severity,
          category,
          status: 'open',
          created_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Error inserting bug report:', error);
      return res.status(500).json({ error: 'Failed to submit bug report' });
    }

    return res.status(200).json({ 
      message: 'Bug report submitted successfully',
      data: data[0]
    });

  } catch (error) {
    console.error('Error submitting bug report:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
