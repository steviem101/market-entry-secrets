import { useState } from 'react';
import { LogOut, UserCircle, Shield, LayoutDashboard, FileText, Heart, Handshake, BarChart3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { ProfileDialog } from './ProfileDialog';
import { Link } from 'react-router-dom';
import { getInitials, getDisplayName } from '@/lib/profileUtils';

export const UserDropdown = () => {
  const { user, profile, signOut, isAdmin, isModerator } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  if (!user || !profile) return null;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile.avatar_url} alt={getDisplayName(profile, user)} />
              <AvatarFallback>{getInitials(profile)}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{getDisplayName(profile, user)}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              <div className="flex gap-1 mt-2">
                {isAdmin() && (
                  <Badge variant="destructive" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
                {isModerator() && !isAdmin() && (
                  <Badge variant="secondary" className="text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Moderator
                  </Badge>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/member-hub">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Member Hub</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/my-reports">
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>My Reports</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/bookmarks">
              <Heart className="mr-2 h-4 w-4" />
              <span>Bookmarks</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/mentor-connections">
              <Handshake className="mr-2 h-4 w-4" />
              <span>Mentor Connections</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/report-creator">
              <FileText className="mr-2 h-4 w-4" />
              <span>Create New Report</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowProfile(true)}>
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProfileDialog open={showProfile} onOpenChange={setShowProfile} />
    </>
  );
};
