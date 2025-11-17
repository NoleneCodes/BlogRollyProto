// Enhanced client utility for saved blogs with database integration
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Keep your existing API pattern but add direct database fallbacks
export async function saveBlog(readerId: string, blogId: string) {
  try {
    // Try your existing API first
    const res = await fetch('/api/reader/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readerId, blogId }),
    });
    
    if (res.ok) {
      return res.json();
    }

    // Fallback to direct database call
    const { data, error } = await supabase
      .from('saved_blogs')
      .insert({
        user_id: readerId,
        blog_id: blogId,
        saved_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };

  } catch (error) {
    console.error('Error saving blog:', error);
    return { success: false, error };
  }
}

export async function removeSavedBlog(readerId: string, blogId: string) {
  try {
    // Try your existing API first
    const res = await fetch('/api/reader/saved', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readerId, blogId }),
    });
    
    if (res.ok) {
      return res.json();
    }

    // Fallback to direct database call
    const { error } = await supabase
      .from('saved_blogs')
      .delete()
      .match({ user_id: readerId, blog_id: blogId });

    if (error) throw error;
    return { success: true };

  } catch (error) {
    console.error('Error removing saved blog:', error);
    return { success: false, error };
  }
}

export async function getSavedBlogs(readerId: string) {
  try {
    // Try your existing API first
    const res = await fetch(`/api/reader/saved?readerId=${readerId}`);
    
    if (res.ok) {
      return res.json();
    }

    // Fallback to direct database call with full blog data
    const { data, error } = await supabase
      .from('saved_blogs')
      .select(`
        id,
        saved_at,
        notes,
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
      .order('saved_at', { ascending: false });

    if (error) throw error;

    // Transform to match your expected format
    const blogs = data?.map((item: any) => ({
      id: item.blog_submissions.id,
      title: item.blog_submissions.title,
      author: item.blog_submissions.user_profiles?.username || 
              `${item.blog_submissions.user_profiles?.first_name || ''} ${item.blog_submissions.user_profiles?.surname || ''}`.trim(),
      savedDate: item.saved_at,
      url: item.blog_submissions.url,
      category: item.blog_submissions.category,
      description: item.blog_submissions.description,
      image: item.blog_submissions.image_url,
      notes: item.notes
    })) || [];

    return { blogs };

  } catch (error) {
    console.error('Error fetching saved blogs:', error);
    return { blogs: [], error };
  }
}