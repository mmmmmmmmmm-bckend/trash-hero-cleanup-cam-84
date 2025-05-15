
import React, { memo } from 'react';
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
  isLoading?: boolean;
}

const LocationList = memo(({ 
  title, 
  locations, 
  onSelectLocation, 
  emptyMessage, 
  icon, 
  isLoading = false 
}: LocationListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      <div className="space-y-2">
        {locations.length > 0 ? (
          locations.map(location => (
            <LocationItem 
              key={location.id} 
              location={location} 
              onSelect={onSelectLocation} 
              iconComponent={icon}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Trash className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>{emptyMessage}</p>
          </div>
        )}
      </div>
    </>
  );
});

LocationList.displayName = 'LocationList';

export default LocationList;
