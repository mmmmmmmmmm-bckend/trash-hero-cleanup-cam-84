
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

// Mapbox token
const MAPBOX_TOKEN = "pk.eyJ1IjoiZXp6YXQiLCJhIjoiY2x0am9jYWNiMDhseTJrcGR0eDR4OWV5biJ9.F57X2J7v1VYeUSRQH2hEzQ";

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

const MapComponent = ({ 
  mapCenter, 
  zoom, 
  userLocation, 
  locations,
  activeTab,
  selectedLocation,
  onMarkerClick,
  onInfoWindowClose,
  containerStyle 
}: MapComponentProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: number]: mapboxgl.Marker }>({});
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map when component mounts
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Initialize Mapbox
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [mapCenter.lng, mapCenter.lat],
      zoom: zoom
    });

    // Add navigation controls
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Set up event listeners
    mapRef.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  // Update map center and zoom when props change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [mapCenter.lng, mapCenter.lat],
        zoom: zoom,
        essential: true
      });
    }
  }, [mapCenter, zoom]);

  // Add markers when map is loaded or locations change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Filter locations based on activeTab
    const filteredLocations = locations.filter(loc => 
      activeTab === 'all' || loc.type === activeTab
    );

    // Add new markers
    filteredLocations.forEach(location => {
      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      
      // Style based on location type
      let color = '#4CAF50'; // Green for bins
      if (location.type === 'dirty') color = '#F44336'; // Red for dirty areas
      if (location.type === 'report') color = '#FF9800'; // Orange for reports
      if (location.type === 'event') color = '#2196F3'; // Blue for events
      
      el.style.backgroundColor = color;
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 0 2px rgba(0,0,0,0.3)';
      
      // Create and add marker to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat([location.coordinates[0], location.coordinates[1]])
        .addTo(mapRef.current!);
      
      // Add click event
      marker.getElement().addEventListener('click', () => {
        onMarkerClick(location);
      });
      
      // Store marker reference
      markersRef.current[location.id] = marker;
    });
    
    // Add user location marker if available
    if (userLocation) {
      const el = document.createElement('div');
      el.className = 'user-marker';
      el.style.backgroundColor = '#4285F4';
      el.style.border = '2px solid white';
      el.style.borderRadius = '50%';
      el.style.width = '16px';
      el.style.height = '16px';
      el.style.boxShadow = '0 0 3px rgba(0,0,0,0.5)';
      
      new mapboxgl.Marker(el)
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current!);
    }
  }, [locations, mapLoaded, activeTab, userLocation]);

  // Handle selected location popup
  useEffect(() => {
    // Remove existing popup
    if (popupRef.current) {
      popupRef.current.remove();
      popupRef.current = null;
    }
    
    // Add popup if location is selected
    if (selectedLocation && mapRef.current && mapLoaded) {
      popupRef.current = new mapboxgl.Popup({ closeButton: true, closeOnClick: false })
        .setLngLat([selectedLocation.coordinates[0], selectedLocation.coordinates[1]])
        .setHTML(`
          <div class="p-2 max-w-[200px]">
            <h3 class="font-medium text-sm">${selectedLocation.name}</h3>
            <p class="text-xs text-gray-600">${selectedLocation.location}</p>
            ${selectedLocation.description ? `<p class="text-xs mt-1">${selectedLocation.description}</p>` : ''}
            ${selectedLocation.distance ? `<p class="text-xs text-blue-600 mt-1">${selectedLocation.distance}</p>` : ''}
          </div>
        `)
        .addTo(mapRef.current);
        
      popupRef.current.on('close', onInfoWindowClose);
    }
  }, [selectedLocation, mapLoaded]);

  if (!mapLoaded) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainerRef} 
      style={containerStyle} 
      className="relative rounded-lg overflow-hidden"
    />
  );
};

export default MapComponent;
