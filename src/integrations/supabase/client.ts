import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Add getAvatarSrc function if it doesn't exist
export const getAvatarSrc = (avatarUrl: string | null): string => {
  if (!avatarUrl) return "https://i.pravatar.cc/150?img=5";
  
  // If it's already a URL, return it
  if (avatarUrl.startsWith('http')) {
    return avatarUrl;
  }
  
  // Otherwise, get the URL from Supabase storage
  const { data } = supabase.storage
    .from('profiles')
    .getPublicUrl(avatarUrl);
    
  return data?.publicUrl || "https://i.pravatar.cc/150?img=5";
};
