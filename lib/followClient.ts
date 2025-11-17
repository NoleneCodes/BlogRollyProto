// Enhanced follow/unfollow API client with database integration
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function followBlogger(readerId: string, bloggerId: string) {
  try {
    // Try your existing API first
    const res = await fetch('/api/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readerId, bloggerId }),
    });
    
    if (res.ok) {
      return res.json();
    }

    // Fallback to direct database call
    const { data, error } = await supabase
      .from('blogger_follows')
      .insert({
        follower_user_id: readerId,
        blogger_user_id: bloggerId,
        followed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Update follower count for the blogger
    await supabase
      .from('blogger_profiles')
      .update({
        follower_count: supabase.sql`COALESCE(follower_count, 0) + 1`,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', bloggerId);

    return { success: true, data };

  } catch (error) {
    console.error('Error following blogger:', error);
    return { success: false, error };
  }
}

export async function unfollowBlogger(readerId: string, bloggerId: string) {
  try {
    // Try your existing API first
    const res = await fetch('/api/follow', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readerId, bloggerId }),
    });
    
    if (res.ok) {
      return res.json();
    }

    // Fallback to direct database call
    const { error } = await supabase
      .from('blogger_follows')
      .delete()
      .match({
        follower_user_id: readerId,
        blogger_user_id: bloggerId
      });

    if (error) throw error;

    // Update follower count for the blogger
    await supabase
      .from('blogger_profiles')
      .update({
        follower_count: supabase.sql`GREATEST(COALESCE(follower_count, 1) - 1, 0)`,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', bloggerId);

    return { success: true };

  } catch (error) {
    console.error('Error unfollowing blogger:', error);
    return { success: false, error };
  }
}

export async function getBloggerFollowingCount(bloggerId: string) {
  try {
    // Try your existing API first  
    const res = await fetch(`/api/follow?bloggerId=${bloggerId}`);
    
    if (res.ok) {
      return res.json();
    }

    // Fallback to direct database call - get followers OF this blogger
    const { data: followers, error: followError } = await supabase
      .from('blogger_follows')
      .select('follower_user_id')
      .eq('blogger_user_id', bloggerId);

    if (followError) throw followError;

    return { 
      count: followers?.length || 0,
      followers: followers?.map(f => f.follower_user_id) || []
    };

  } catch (error) {
    console.error('Error getting follower count:', error);
    return { count: 0, followers: [], error };
  }
}

// Additional function for your reader profile - get bloggers this user follows
export async function getFollowedBloggers(readerId: string) {
  try {
    const { data, error } = await supabase
      .from('blogger_follows')
      .select(`
        id,
        followed_at,
        blogger_user_id,
        user_profiles!blogger_follows_blogger_user_id_fkey (
          username,
          first_name,
          surname,
          bio,
          profile_image_url
        ),
        blogger_profiles!blogger_follows_blogger_user_id_fkey (
          blog_name,
          blog_url,
          categories
        )
      `)
      .eq('follower_user_id', readerId)
      .order('followed_at', { ascending: false });

    if (error) throw error;

    // Transform to match your component's expected format
    const bloggers = data?.map((item: any) => ({
      id: item.blogger_user_id,
      username: item.user_profiles?.username || 'Unknown',
      blogName: item.blogger_profiles?.blog_name || 'Untitled Blog',
      blogUrl: item.blogger_profiles?.blog_url || '',
      avatar: item.user_profiles?.profile_image_url,
      bio: item.user_profiles?.bio || '',
      followedDate: item.followed_at,
      category: item.blogger_profiles?.categories?.[0] || 'General'
    })) || [];

    return { bloggers, count: bloggers.length };

  } catch (error) {
    console.error('Error fetching followed bloggers:', error);
    return { bloggers: [], count: 0, error };
  }
}