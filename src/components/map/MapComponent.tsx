
import React from 'react';
import { Map, AlertCircle, CalendarDays } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

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

interface MapComponentProps {
  mapCenter: { lat: number, lng: number };
  zoom: number;
  userLocation: {lat: number, lng: number} | null;
  locations: Location[];
  activeTab: string;
  selectedLocation: Location | null;
  onMarkerClick: (location: Location) => void;
  onInfoWindowClose: () => void;
  containerStyle: {
    width: string;
    height: string;
  };
}

const MapComponent = ({ containerStyle }: MapComponentProps) => {
  return (
    <div style={containerStyle} className="relative rounded-lg overflow-hidden">
      <Card className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 border border-muted">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <Map className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Map Coming Soon</h3>
          <p className="text-muted-foreground mb-4">
            Our interactive map feature will be available in future updates.
          </p>
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 mr-1" />
            <span>Stay tuned for updates</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapComponent;
