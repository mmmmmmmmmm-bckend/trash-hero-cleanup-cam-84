
import React from 'react';
import { Trash } from 'lucide-react';
import LocationItem from './LocationItem';

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

interface LocationListProps {
  title: string;
  locations: Location[];
  onSelectLocation: (location: Location) => void;
  emptyMessage: string;
  icon?: React.ReactNode;
}

const LocationList = ({ title, locations, onSelectLocation, emptyMessage, icon }: LocationListProps) => {
  return (
    <>
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <div className="space-y-2">
        {locations.map(location => (
          <LocationItem 
            key={location.id} 
            location={location} 
            onSelect={onSelectLocation} 
            iconComponent={icon}
          />
        ))}
        
        {locations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Trash className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    </>
  );
};

export default LocationList;
