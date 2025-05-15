
import React, { memo } from 'react';
import { MapPin, Trash, AlertCircle, CalendarDays } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface Location {
  id: number;
  name: string;
  type: string;
  distance?: string;
  distanceValue?: number;
  location: string;
  coordinates: number[];
  description?: string;
  date?: string;
  selected?: boolean;
}

interface LocationItemProps {
  location: Location;
  onSelect: (location: Location) => void;
  iconComponent?: React.ReactNode;
}

// Get icon based on location type
const getIconByType = (type: string) => {
  switch(type) {
    case 'bin': return <Trash className="h-5 w-5" />;
    case 'dirty': return <AlertCircle className="h-5 w-5" />;
    case 'report': return <AlertCircle className="h-5 w-5" />;
    case 'event': return <CalendarDays className="h-5 w-5" />;
    default: return <Trash className="h-5 w-5" />;
  }
};

// Get color based on location type
const getColorByType = (type: string): string => {
  switch(type) {
    case 'bin': return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400';
    case 'dirty': return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400';
    case 'report': return 'bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400';
    case 'event': return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400';
    default: return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400';
  }
};

// Format date string to localized format
const formatEventDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString(undefined, { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit'
  });
};

const LocationItem = memo(({ location, onSelect, iconComponent }: LocationItemProps) => {
  const iconColor = getColorByType(location.type);
  const icon = iconComponent || getIconByType(location.type);
  const eventDate = location.date ? formatEventDate(location.date) : '';
  
  return (
    <div className="border border-border dark:border-gray-700 rounded-lg p-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-md ${iconColor}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-medium">{location.name}</h3>
          <p className="text-xs text-muted-foreground">
            {location.location} {location.distance && `• ${location.distance}`}
          </p>
          {location.description && <p className="text-xs mt-1">{location.description}</p>}
          {eventDate && <p className="text-xs mt-1 font-medium">{eventDate}</p>}
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-blue-500"
        onClick={() => onSelect(location)}
      >
        <MapPin className="h-5 w-5" />
      </Button>
    </div>
  );
});

LocationItem.displayName = 'LocationItem';

export default LocationItem;
