import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fallback mock user data for demo when not authenticated
const mockUser = {
  id: 'reader-123',
  name: 'Jane Doe',
  email: 'jane@example.com',
  displayName: 'Jane',
  bio: 'A passionate reader and lifelong learner.',
  joinedDate: '2023-01-01',
  avatar: '',
  topics: ['Tech', 'Health'],
  roles: ['reader'],
  tier: 'free',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Try to get authenticated user
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        // Return mock user for demo purposes when not authenticated
        return res.status(200).json(mockUser);
      }

      const userId = session.user.id;

      // Get user profile data from new schema
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        // Fallback to mock user
        return res.status(200).json(mockUser);
      }

      // Get reader-specific profile data
      const { data: readerProfile } = await supabase
        .from('reader_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Format response to match your existing structure
      const userData = {
        id: userId,
        name: `${userProfile.first_name || ''} ${userProfile.surname || ''}`.trim(),
        email: session.user.email,
        displayName: userProfile.username || userProfile.first_name,
        bio: userProfile.bio || '',
        joinedDate: userProfile.created_at,
        avatar: userProfile.profile_image_url || '',
        topics: readerProfile?.topics || [],
        roles: [userProfile.role],
        tier: userProfile.tier || 'free'
      };

      res.status(200).json(userData);

    } catch (error) {
      console.error('API error:', error);
      // Fallback to mock user on any error
      res.status(200).json(mockUser);
    }

  } else if (req.method === 'PATCH') {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError || !session) {
        // For demo: update mockUser in-memory when not authenticated
        const { displayName, bio } = req.body;
        if (displayName) mockUser.displayName = displayName;
        if (bio) mockUser.bio = bio;
        return res.status(200).json({ success: true, user: mockUser });
      }

      const userId = session.user.id;
      const { displayName, bio } = req.body;

      // Update user profile in database
      const updates: any = { updated_at: new Date().toISOString() };
      if (displayName) updates.username = displayName;
      if (bio) updates.bio = bio;

      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return res.status(500).json({ error: 'Failed to update profile' });
      }

      // Return updated user data
      const userData = {
        id: userId,
        name: `${updatedProfile.first_name || ''} ${updatedProfile.surname || ''}`.trim(),
        email: session.user.email,
        displayName: updatedProfile.username,
        bio: updatedProfile.bio || '',
        joinedDate: updatedProfile.created_at,
        avatar: updatedProfile.profile_image_url || '',
        topics: [], // Would need to fetch from reader_profiles if needed
        roles: [updatedProfile.role],
        tier: updatedProfile.tier || 'free'
      };

      res.status(200).json({ success: true, user: userData });

    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }

  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}