
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Predefined avatars with Egyptian themes
export const avatars = [
  {id: 'avatar1', src: '/placeholder.svg', alt: 'Pyramid avatar', name: 'Pyramid'},
  {id: 'avatar2', src: '/placeholder.svg', alt: 'Sphinx avatar', name: 'Sphinx'},
  {id: 'avatar3', src: '/placeholder.svg', alt: 'Palm Tree avatar', name: 'Palm Tree'},
  {id: 'avatar4', src: '/placeholder.svg', alt: 'Camel avatar', name: 'Camel'},
  {id: 'avatar5', src: '/placeholder.svg', alt: 'Nile avatar', name: 'Nile'},
  {id: 'avatar6', src: '/placeholder.svg', alt: 'Ankh avatar', name: 'Ankh'},
  {id: 'avatar7', src: '/placeholder.svg', alt: 'Pharaoh avatar', name: 'Pharaoh'},
  {id: 'avatar8', src: '/placeholder.svg', alt: 'Egyptian Cat avatar', name: 'Egyptian Cat'},
];

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelectAvatar: (avatarId: string) => void;
}

const AvatarSelector = ({ selectedAvatar, onSelectAvatar }: AvatarSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium mb-1">Choose an avatar</label>
      <div className="grid grid-cols-4 gap-2">
        {avatars.map(avatar => (
          <button
            key={avatar.id}
            type="button"
            className={`rounded-lg p-2 ${selectedAvatar === avatar.id ? 'bg-primary/20 ring-2 ring-primary' : 'bg-accent/10'}`}
            onClick={() => onSelectAvatar(avatar.id)}
          >
            <div className="flex flex-col items-center">
              <Avatar className="h-12 w-12 mb-1">
                <AvatarImage src={avatar.src} alt={avatar.alt} />
                <AvatarFallback>{avatar.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-xs">{avatar.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AvatarSelector;
