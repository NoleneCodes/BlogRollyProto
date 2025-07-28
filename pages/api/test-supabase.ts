
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test the connection by checking Supabase service
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Supabase connection error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Supabase connection failed',
        details: error.message 
      });
    }

    // Test database connection with a simple query
    const { data: testData, error: dbError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = table doesn't exist, which is expected
      console.error('Database query error:', dbError);
      return res.status(500).json({ 
        success: false, 
        error: 'Database connection failed',
        details: dbError.message 
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Supabase connection successful!',
      timestamp: new Date().toISOString(),
      environment: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
