
import React from 'react';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserHeaderProps {
  points: number;
  profile: any;
  avatarSrc: string;
}

const UserHeader: React.FC<UserHeaderProps> = ({ points, profile, avatarSrc }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm opacity-90">Your impact</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{points}</span>
          <Star className="w-5 h-5" />
          <span className="text-sm opacity-90">points</span>
        </div>
        {profile && (
          <p className="text-sm mt-1 opacity-90">
            {profile.full_name || profile.username || "User"}
          </p>
        )}
      </div>
      <div className="bg-white/20 p-2 rounded-full">
        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
          {profile ? (
            <Avatar className="w-12 h-12">
              <AvatarImage 
                src={avatarSrc} 
                alt={profile.full_name || "User"} 
              />
              <AvatarFallback>
                {(profile.full_name || profile.username || "U").substring(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="w-12 h-12">
              <AvatarImage src="https://i.pravatar.cc/150?img=5" alt="User avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHeader;
