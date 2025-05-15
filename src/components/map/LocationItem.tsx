
import React from 'react';
import { Trash, MapPin } from 'lucide-react';
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

const LocationItem = ({ location, onSelect, iconComponent }: LocationItemProps) => {
  return (
    <div key={location.id} className="border border-border dark:border-gray-700 rounded-lg p-3 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
          {iconComponent || <Trash className="h-5 w-5" />}
        </div>
        <div>
          <h3 className="font-medium">{location.name}</h3>
          <p className="text-xs text-muted-foreground">{location.location} • {location.distance}</p>
          {location.description && <p className="text-xs mt-1">{location.description}</p>}
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
};

export default LocationItem;
