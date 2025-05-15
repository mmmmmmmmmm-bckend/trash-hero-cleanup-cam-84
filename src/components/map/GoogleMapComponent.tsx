
import React from 'react';
import { GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';

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

interface GoogleMapComponentProps {
  isLoaded: boolean;
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

const GoogleMapComponent = ({ 
  isLoaded, 
  mapCenter, 
  zoom, 
  userLocation, 
  locations,
  activeTab,
  selectedLocation,
  onMarkerClick,
  onInfoWindowClose,
  containerStyle 
}: GoogleMapComponentProps) => {

  // Get marker icon based on location type
  const getMarkerIconByType = (type: string) => {
    switch(type) {
      case 'bin':
        return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
      case 'dirty':
        return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
      case 'report':
        return 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png';
      case 'event':
        return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      default:
        return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
    }
  };

  // Render map markers based on filtered locations
  const renderMarkers = () => {
    const filtered = locations.filter(loc => activeTab === 'all' || loc.type === activeTab);
    
    return filtered.map(location => (
      <MarkerF
        key={location.id}
        position={{
          lat: location.coordinates[1],
          lng: location.coordinates[0]
        }}
        onClick={() => onMarkerClick(location)}
        icon={{
          url: getMarkerIconByType(location.type),
          scaledSize: new window.google.maps.Size(30, 30)
        }}
      />
    ));
  };

  if (!isLoaded) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter}
      zoom={zoom}
      options={{
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      }}
    >
      {/* User Location Marker */}
      {userLocation && (
        <MarkerF
          position={userLocation}
          icon={{
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          }}
        />
      )}

      {/* Location Markers */}
      {renderMarkers()}

      {/* Info Window for selected location */}
      {selectedLocation && (
        <InfoWindowF
          position={{
            lat: selectedLocation.coordinates[1],
            lng: selectedLocation.coordinates[0]
          }}
          onCloseClick={onInfoWindowClose}
        >
          <div className="p-2 max-w-[200px]">
            <h3 className="font-medium text-sm">{selectedLocation.name}</h3>
            <p className="text-xs text-gray-600">{selectedLocation.location}</p>
            {selectedLocation.description && (
              <p className="text-xs mt-1">{selectedLocation.description}</p>
            )}
            {selectedLocation.distance && (
              <p className="text-xs text-blue-600 mt-1">{selectedLocation.distance}</p>
            )}
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
};

export default GoogleMapComponent;
