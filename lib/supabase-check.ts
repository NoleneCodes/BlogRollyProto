
// Supabase configuration validation utility
export const validateSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase configuration missing. Auth features will be disabled.');
      return false;
    }

    // Check if URL is valid
    try {
      new URL(supabaseUrl);
    } catch (error) {
      console.error('Invalid Supabase URL:', supabaseUrl);
      return false;
    }

    return true;
  }
  return false;
};

// Silent error handler for development
export const handleSupabaseError = (error: any) => {
  if (process.env.NODE_ENV === 'development') {
    // Don't spam console in development
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('ERR_NAME_NOT_RESOLVED')) {
      // These are likely configuration issues, log once
      if (!window._supabaseErrorLogged) {
        console.warn('Supabase connection failed - check your configuration');
        window._supabaseErrorLogged = true;
      }
      return;
    }
  }
  console.error('Supabase error:', error);
};

declare global {
  interface Window {
    _supabaseErrorLogged?: boolean;
  }
}
