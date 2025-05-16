
import { createClient } from '@supabase/supabase-js';

// Use direct string values for Supabase URL and key
const supabaseUrl = 'https://toifcjejcshrjfbgkdtz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvaWZjamVqY3NocmpmYmdrZHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMjIzODgsImV4cCI6MjA2Mjg5ODM4OH0.C6KwK-BUf8B5hYvjxjmC4AIU01lyHWAiBMLp69KrVdg';

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
