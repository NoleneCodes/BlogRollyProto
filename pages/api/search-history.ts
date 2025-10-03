import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, searchType = 'keyword', userId, sessionId, filters = {} } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing search query' });
  }

  // Use userId if available, otherwise use sessionId (anonymous)
  const actorId = userId || sessionId || uuidv4();

  try {
    // Insert or update frequency counter
    const { error } = await supabase
      .from('search_analytics')
      .insert({
        search_query: query,
        search_type: searchType,
        user_id: userId || null,
        session_id: sessionId || null,
        filters_used: filters,
        frequency: 1 // For future trending analytics
      });
    if (error) {
      return res.status(500).json({ error: 'Failed to log search history' });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
