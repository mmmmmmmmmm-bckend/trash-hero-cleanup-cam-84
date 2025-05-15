import React, { useState, useEffect, useRef } from 'react';
import { Trash, User, MapPin, Search, Filter, Plus, AlertCircle, Info, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Header from '../components/Header';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = "AIzaSyDqrk3vgqzwRJZ6LMg9wNECzaeVaIvmOa4";

// Define libraries for Google Maps
const libraries = ['places'];

// Define location type interface
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

const containerStyle = {
  width: '100%',
  height: '100%'
};

const Map = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate(); // Added useNavigate hook
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('bins');
  const [addingBin, setAddingBin] = useState(false);
  const [newBin, setNewBin] = useState({
    name: '',
    type: 'General Bin',
    location: ''
  });
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 30.0444, lng: 31.2357 }); // Default to Cairo, Egypt
  const [zoom, setZoom] = useState(13);
  
  // Setup Google Maps with libraries prop correctly formatted
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries as any
  });
  
  // Egyptian locations data (we'll filter these based on user location later)
  const [locations, setLocations] = useState<Location[]>([
    {
      id: 1,
      name: 'Recycling Bin',
      type: 'bin',
      distance: '250m away',
      location: 'Nile Riverbank, Cairo',
      coordinates: [31.2357, 30.0444]
    },
    {
      id: 2,
      name: 'General Bin',
      type: 'bin',
      distance: '250m away',
      location: 'Alexandria Beach',
      coordinates: [29.9187, 31.2001]
    },
    {
      id: 3,
      name: 'Compost Bin',
      type: 'bin',
      distance: '250m away',
      location: 'Giza Market Area',
      coordinates: [31.1342, 29.9792]
    },
    {
      id: 4,
      name: 'General Bin',
      type: 'bin',
      distance: '350m away',
      location: 'Luxor Temple Surroundings',
      coordinates: [32.6396, 25.6997]
    },
    {
      id: 5,
      name: 'Dirty Area',
      type: 'dirty',
      description: 'Tourist trash accumulating near historic site',
      location: 'Luxor Temple Surroundings',
      coordinates: [32.6406, 25.7007]
    },
    {
      id: 6,
      name: 'Trash Report',
      type: 'report',
      description: 'Heavy plastic waste accumulation needs cleanup',
      location: 'Dahab Coastline',
      coordinates: [34.5133, 28.4984]
    },
    {
      id: 7,
      name: 'Recycling Bin',
      type: 'bin',
      distance: '450m away',
      location: 'Khan el-Khalili Market, Cairo',
      coordinates: [31.2623, 30.0478]
    },
    {
      id: 8,
      name: 'Compost Bin',
      type: 'bin',
      distance: '300m away',
      location: 'Aswan Riverfront',
      coordinates: [32.8752, 24.0889]
    },
    {
      id: 9,
      name: 'Dirty Area',
      type: 'dirty',
      description: 'Litter accumulating in tourist area',
      location: 'Valley of the Kings, Luxor',
      coordinates: [32.6010, 25.7402]
    },
    {
      id: 10,
      name: 'General Bin',
      type: 'bin',
      distance: '150m away',
      location: 'Hurghada Beach Resort',
      coordinates: [33.8116, 27.2579]
    },
    {
      id: 11,
      name: 'Trash Report',
      type: 'report',
      description: 'Beach cleanup needed after weekend',
      location: 'Sharm El Sheikh Coast',
      coordinates: [34.3300, 27.9158]
    },
    {
      id: 12,
      name: 'Cleanup Event',
      type: 'event',
      description: 'Community beach cleanup',
      location: 'Alexandria Corniche',
      date: '2025-06-15T09:00:00',
      coordinates: [29.8987, 31.2156]
    },
    {
      id: 13,
      name: 'Nile River Cleanup',
      type: 'event',
      description: 'Join us to clean the riverbank',
      location: 'Cairo Waterfront',
      date: '2025-05-20T08:30:00',
      coordinates: [31.2290, 30.0444]
    },
    {
      id: 14,
      name: 'Great Pyramid Area Cleanup',
      type: 'event',
      description: 'Help keep our heritage sites clean',
      location: 'Giza Pyramid Complex',
      date: '2025-06-01T09:00:00',
      coordinates: [31.1342, 29.9792]
    },
    {
      id: 15,
      name: 'Desert Recycle Bin',
      type: 'bin',
      distance: '500m away',
      location: 'Western Desert Oasis',
      coordinates: [25.5400, 29.2000]
    },
    {
      id: 16,
      name: 'Dirty Area',
      type: 'dirty',
      description: 'Plastic waste around popular camping spot',
      location: 'White Desert National Park',
      coordinates: [27.3667, 28.4000]
    },
    {
      id: 17,
      name: 'Beach Cleanup Initiative',
      type: 'event',
      description: 'Join the Red Sea conservation effort',
      location: 'Marsa Alam',
      date: '2025-06-22T08:00:00',
      coordinates: [34.9000, 25.0667]
    }
  ]);

  // Request location permission
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Request location permission
  const requestLocationPermission = () => {
    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationPermission('granted');
        setLocationLoading(false);
        setMapCenter({ lat: latitude, lng: longitude });
        
        // Update distances after getting user location
        updateDistances(latitude, longitude);
      },
      // Error callback
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        setLocationLoading(false);
        
        toast({
          title: "Location Access Denied",
          description: "Please enable location access to see nearby bins and cleanups.",
          variant: "destructive"
        });
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };
  
  // Calculate distance between two points in km
  const calculateDistance = (lon1: number, lat1: number, lon2: number, lat2: number) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  // Format distance
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };
  
  // Update distances when user location changes
  const updateDistances = (latitude: number, longitude: number) => {
    const updatedLocations = locations.map(loc => {
      const distance = calculateDistance(
        loc.coordinates[0], loc.coordinates[1], 
        longitude, latitude
      );
      
      return {
        ...loc,
        distance: formatDistance(distance),
        distanceValue: distance
      };
    });
    
    // Sort by distance
    updatedLocations.sort((a, b) => {
      const aValue = a.distanceValue ?? Number.MAX_VALUE;
      const bValue = b.distanceValue ?? Number.MAX_VALUE;
      return aValue - bValue;
    });
    
    setLocations(updatedLocations);
  };
  
  // Handle adding a new bin
  const handleAddBin = async () => {
    if (!newBin.name || !newBin.type || !newBin.location) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (!userLocation) {
      toast({
        title: "Location needed",
        description: "Please enable location services to add a bin at your current location",
        variant: "destructive"
      });
      return;
    }

    try {
      // In a real app, we would save to Supabase here
      const newId = locations.length + 1;
      const newLocation: Location = {
        id: newId,
        name: newBin.name,
        type: 'bin',
        location: newBin.location,
        coordinates: [userLocation.lng, userLocation.lat],
        distance: '0m away',
        distanceValue: 0
      };
      
      setLocations([newLocation, ...locations]);
      
      toast({
        title: "Bin Added",
        description: `${newBin.type} has been added to ${newBin.location}`,
      });
      
      setAddingBin(false);
      setNewBin({
        name: '',
        type: 'General Bin',
        location: ''
      });
      
    } catch (error) {
      console.error('Error adding bin:', error);
      toast({
        title: "Error",
        description: "Failed to add bin",
        variant: "destructive"
      });
    }
  };
  
  const filteredLocations = (type: string): Location[] => {
    let filtered = locations;
    
    // Apply search filter if exists
    if (searchQuery) {
      filtered = filtered.filter(loc => 
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        loc.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter if not 'all'
    if (type !== 'all') {
      filtered = filtered.filter(loc => loc.type === type);
    }

    return filtered;
  };

  // Handle marker click
  const handleMarkerClick = (location: Location) => {
    setSelectedLocation(location);
  };

  // Render map markers based on filtered locations
  const renderMarkers = () => {
    const filtered = [...filteredLocations(activeTab === 'all' ? 'all' : activeTab)];
    
    return filtered.map(location => (
      <MarkerF
        key={location.id}
        position={{
          lat: location.coordinates[1],
          lng: location.coordinates[0]
        }}
        onClick={() => handleMarkerClick(location)}
        icon={{
          url: getMarkerIconByType(location.type),
          scaledSize: new window.google.maps.Size(30, 30)
        }}
      />
    ));
  };

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

  // Check if map is ready
  if (loadError) {
    return (
      <div className="min-h-screen pb-16 bg-background dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Map</h2>
          <p className="text-muted-foreground">There was an error loading the map. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 bg-background dark:bg-gray-900">
      <Header title="Community Map" showBack={true} />
      
      <main className="px-4">
        {/* Location permission banner */}
        {locationPermission === 'denied' && (
          <div className="bg-yellow-100 dark:bg-yellow-900/40 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-200 p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>Location access is disabled. Enable location to see bins near you.</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={requestLocationPermission}
            >
              Enable Location
            </Button>
          </div>
        )}
        
        {/* Search input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Header with help button */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Map</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 text-primary"
            onClick={() => navigate("/")}
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </Button>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="bins" className="w-full" onValueChange={(value) => setActiveTab(value)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="bins" className="text-xs">Trash Bins</TabsTrigger>
            <TabsTrigger value="dirty" className="text-xs">Dirty Areas</TabsTrigger>
            <TabsTrigger value="report" className="text-xs">Trash Reports</TabsTrigger>
            <TabsTrigger value="event" className="text-xs">Events</TabsTrigger>
          </TabsList>

          <div className="flex justify-between mb-4">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            
            <Dialog open={addingBin} onOpenChange={setAddingBin}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4" />
                  Add Bin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Trash Bin</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Bin Name</Label>
                    <Input 
                      id="name" 
                      value={newBin.name} 
                      onChange={(e) => setNewBin({...newBin, name: e.target.value})}
                      placeholder="Recycling Bin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Bin Type</Label>
                    <Select 
                      value={newBin.type} 
                      onValueChange={(value) => setNewBin({...newBin, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bin type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Bin">General Bin</SelectItem>
                        <SelectItem value="Recycling Bin">Recycling Bin</SelectItem>
                        <SelectItem value="Compost Bin">Compost Bin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location Description</Label>
                    <Input 
                      id="location" 
                      value={newBin.location} 
                      onChange={(e) => setNewBin({...newBin, location: e.target.value})}
                      placeholder="Describe the location" 
                    />
                  </div>
                  {!userLocation && (
                    <div className="text-yellow-600 dark:text-yellow-400 text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Enable location to add a bin at your position</span>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddingBin(false)}>Cancel</Button>
                  <Button onClick={handleAddBin}>Add Bin</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Interactive Map */}
          <div className="rounded-lg overflow-hidden h-60 mb-4 relative">
            {isLoaded ? (
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
                    onCloseClick={() => setSelectedLocation(null)}
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
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* Tab content sections */}
          <TabsContent value="bins" className="mt-0">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Trash className="h-5 w-5" />
              Nearby Bins
            </h2>
            <div className="space-y-2">
              {filteredLocations('bin').map(bin => (
                <div key={bin.id} className="border border-border dark:border-gray-700 rounded-lg p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                      <Trash className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium">{bin.name}</h3>
                      <p className="text-xs text-muted-foreground">{bin.location} • {bin.distance}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-blue-500"
                    onClick={() => {
                      setSelectedLocation(bin);
                      setMapCenter({ lat: bin.coordinates[1], lng: bin.coordinates[0] });
                      setZoom(15);
                    }}
                  >
                    <MapPin className="h-5 w-5" />
                  </Button>
                </div>
              ))}
              
              {filteredLocations('bin').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Trash className="h-12 w-12 mx-auto mb-2 opacity-30" />
                  <p>No bins found</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Keep other tab content */}
          <TabsContent value="dirty" className="mt-0">
            <h2 className="text-lg font-bold mb-2">Dirty Areas</h2>
            <div className="space-y-2">
              {filteredLocations('dirty').map(area => (
                <div key={area.id} className="border border-border dark:border-gray-700 rounded-lg p-3">
                  <h3 className="font-medium">{area.location}</h3>
                  <p className="text-sm text-muted-foreground">{area.description}</p>
                  {area.distance && <p className="text-xs text-muted-foreground mt-1">{area.distance}</p>}
                </div>
              ))}
              
              {filteredLocations('dirty').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No dirty areas reported</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="report" className="mt-0">
            <h2 className="text-lg font-bold mb-2">Trash Reports</h2>
            <div className="space-y-2">
              {filteredLocations('report').map(report => (
                <div key={report.id} className="border border-border dark:border-gray-700 rounded-lg p-3">
                  <h3 className="font-medium">{report.location}</h3>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  {report.distance && <p className="text-xs text-muted-foreground mt-1">{report.distance}</p>}
                </div>
              ))}
              
              {filteredLocations('report').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No reports found</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="event" className="mt-0">
            <h2 className="text-lg font-bold mb-2">Cleanup Events</h2>
            <div className="space-y-2">
              {filteredLocations('event').map(event => (
                <div key={event.id} className="border border-border dark:border-gray-700 rounded-lg p-3">
                  <h3 className="font-medium">{event.name}</h3>
                  <p className="text-sm">{event.location}</p>
                  {event.distance && <p className="text-xs text-muted-foreground">{event.distance}</p>}
                  {event.date && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                </div>
              ))}
              
              {filteredLocations('event').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No events scheduled</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Add CSS for animations */}
      <style>
        {`
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
            }
          }
        `}
      </style>
      
      <NavBar />
    </div>
  );
};

export default Map;
