
export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  website?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
}
