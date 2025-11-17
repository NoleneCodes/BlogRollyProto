// Enhanced client utility for reading history with database integration
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Keep your existing API pattern with database fallbacks
export async function addToReadingHistory(readerId: string, blogId: string, readingTimeSeconds?: number) {
  try {
    // Try your existing API first
    const res = await fetch('/api/reader/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readerId, blogId, readingTimeSeconds }),
    });
    
    if (res.ok) {
      return res.json();
    }

    // Fallback to direct database call
    const { data, error } = await supabase
      .from('reading_history')
      .upsert({
        user_id: readerId,
        blog_id: blogId,
        read_at: new Date().toISOString(),
        reading_time_seconds: readingTimeSeconds
      }, {
        onConflict: 'user_id,blog_id'
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };

  } catch (error) {
    console.error('Error adding to reading history:', error);
    return { success: false, error };
  }
}

export async function getReadingHistory(readerId: string) {
  try {
    // Try your existing API first
    const res = await fetch(`/api/reader/history?readerId=${readerId}`);
    
    if (res.ok) {
      return res.json();
    }

    // Fallback to direct database call with full blog data
    const { data, error } = await supabase
      .from('reading_history')
      .select(`
        id,
        read_at,
        reading_time_seconds,
        blog_submissions (
          id,
          title,
          url,
          category,
          description,
          image_url,
          created_at,
          user_profiles (
            username,
            first_name,
            surname
          )
        )
      `)
      .eq('user_id', readerId)
      .order('read_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Transform to match your expected format
    const history = data?.map((item: any) => ({
      id: item.blog_submissions.id,
      title: item.blog_submissions.title,
      author: item.blog_submissions.user_profiles?.username || 
              `${item.blog_submissions.user_profiles?.first_name || ''} ${item.blog_submissions.user_profiles?.surname || ''}`.trim(),
      readDate: item.read_at,
      url: item.blog_submissions.url,
      category: item.blog_submissions.category,
      description: item.blog_submissions.description,
      image: item.blog_submissions.image_url,
      timeSpent: item.reading_time_seconds ? Math.round(item.reading_time_seconds / 60) : undefined
    })) || [];

    return { history };

  } catch (error) {
    console.error('Error fetching reading history:', error);
    return { history: [], error };
  }
}