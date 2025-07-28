
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const tables = [
      'users',
      'user_profiles', 
      'reader_profiles',
      'blogger_profiles',
      'blog_submissions',
      'adult_blog_submissions',
      'blog_reviews',
      'user_tier_limits',
      'email_queue'
    ];

    const results: any = {};
    
    // Test each table
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          results[table] = { 
            exists: false, 
            error: error.message,
            code: error.code 
          };
        } else {
          results[table] = { 
            exists: true, 
            count: count || 0,
            error: null 
          };
        }
      } catch (err) {
        results[table] = { 
          exists: false, 
          error: err instanceof Error ? err.message : 'Unknown error'
        };
      }
    }

    // Test a simple insert/delete to verify write permissions
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      
      // Try to insert a test user
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert([{
          email: testEmail,
          email_verified: false,
          is_active: true
        }])
        .select();

      if (!insertError && insertData && insertData.length > 0) {
        // Clean up test data
        await supabase
          .from('users')
          .delete()
          .eq('id', insertData[0].id);
        
        results._writeTest = { success: true, message: 'Write permissions working' };
      } else {
        results._writeTest = { success: false, error: insertError?.message };
      }
    } catch (err) {
      results._writeTest = { 
        success: false, 
        error: err instanceof Error ? err.message : 'Write test failed'
      };
    }

    const tablesExist = Object.values(results).filter((r: any) => r.exists).length;
    const totalTables = tables.length;

    return res.status(200).json({
      success: true,
      message: `Database connection successful! Found ${tablesExist}/${totalTables} tables.`,
      tables: results,
      summary: {
        tablesFound: tablesExist,
        totalExpected: totalTables,
        allTablesExist: tablesExist === totalTables,
        writePermissions: results._writeTest?.success || false
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database test error:', error);
    return res.status(500).json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
