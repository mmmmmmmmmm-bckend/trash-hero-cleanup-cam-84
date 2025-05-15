
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Predefined avatars with Egyptian themes
export const avatars = [
  {id: 'avatar1', src: 'https://images.unsplash.com/photo-1642434624134-f43e25608523?q=80&w=100&auto=format&fit=crop', alt: 'Pyramid avatar', name: 'Pyramid'},
  {id: 'avatar2', src: 'https://images.unsplash.com/photo-1589826834888-01b7d3611f22?q=80&w=100&auto=format&fit=crop', alt: 'Sphinx avatar', name: 'Sphinx'},
  {id: 'avatar3', src: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=100&auto=format&fit=crop', alt: 'Palm Tree avatar', name: 'Palm Tree'},
  {id: 'avatar4', src: 'https://images.unsplash.com/photo-1512290518761-8684998af76b?q=80&w=100&auto=format&fit=crop', alt: 'Camel avatar', name: 'Camel'},
  {id: 'avatar5', src: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?q=80&w=100&auto=format&fit=crop', alt: 'Nile avatar', name: 'Nile'},
  {id: 'avatar6', src: 'https://images.unsplash.com/photo-1600003263720-95b45a4035d7?q=80&w=100&auto=format&fit=crop', alt: 'Ankh avatar', name: 'Ankh'},
  {id: 'avatar7', src: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=100&auto=format&fit=crop', alt: 'Pharaoh avatar', name: 'Pharaoh'},
  {id: 'avatar8', src: 'https://images.unsplash.com/photo-1570481662006-a3a1374699e8?q=80&w=100&auto=format&fit=crop', alt: 'Egyptian Cat avatar', name: 'Egyptian Cat'},
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
