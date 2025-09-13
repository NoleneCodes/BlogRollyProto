// Utility for fetching following status and count
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function isFollowing(readerId: string, bloggerId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('blogger_follows')
    .select('id')
    .eq('reader_id', readerId)
    .eq('blogger_id', bloggerId)
    .single();
  if (error && error.code !== 'PGRST116') return false;
  return !!data;
}

export async function getFollowingCount(bloggerId: string): Promise<number> {
  const { count, error } = await supabase
    .from('blogger_follows')
    .select('*', { count: 'exact', head: true })
    .eq('blogger_id', bloggerId);
  if (error) return 0;
  return count || 0;
}
