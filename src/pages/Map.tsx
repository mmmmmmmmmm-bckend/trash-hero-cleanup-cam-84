
import React, { useState, useEffect, useRef } from 'react';
import { Globe, Trash, User, MapPin, Search, Filter, Plus, AlertCircle } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import NavBar from '../components/NavBar';
import Header from '../components/Header';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/contexts/AuthContext';

const MAPBOX_TOKEN = "pk.eyJ1IjoidHJhc2hoZXJvYXBwIiwiYSI6ImNscmExMndvMTBhYjQyanA1ZXBjYjRyd3MifQ.aR1T6g2GolBsoEKQZb76iQ";

const Map = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activeTab, setActiveTab] = useState('bins');
  const [addingBin, setAddingBin] = useState(false);
  const [newBin, setNewBin] = useState({
    name: '',
    type: 'General Bin',
    location: ''
  });
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Egyptian locations data (we'll filter these based on user location later)
  const egyptLocations = [
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
  ];
  
  // Request location permission and initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return; // Map already initialized
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    // First create map with default center
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [31.2357, 30.0444], // Default center (Egypt)
      zoom: 5
    });
    
    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Available",
        description: "Your browser doesn't support location services",
        variant: "destructive"
      });
      return;
    }

    // Request location permission
    requestLocationPermission();
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Request location permission
  const requestLocationPermission = () => {
    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([longitude, latitude]);
        setLocationPermission('granted');
        setLocationLoading(false);
        
        if (map.current) {
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            essential: true
          });
          
          // Add user marker
          if (userMarker.current) {
            userMarker.current.setLngLat([longitude, latitude]);
          } else {
            // Create marker element
            const el = document.createElement('div');
            el.className = 'user-marker';
            el.innerHTML = '<div class="w-8 h-8 bg-blue-500 border-4 border-white rounded-full pulse-animation flex items-center justify-center"><div class="w-2 h-2 bg-white rounded-full"></div></div>';
            
            userMarker.current = new mapboxgl.Marker(el)
              .setLngLat([longitude, latitude])
              .addTo(map.current);
          }
          
          // Add markers after getting user location
          addMarkersToMap();
        }
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
        
        // Still add markers even if location is denied
        if (map.current) {
          addMarkersToMap();
        }
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
  
  // Add markers to map based on filtered locations
  const addMarkersToMap = () => {
    if (!map.current) return;
    
    // Remove existing markers
    markers.forEach(marker => marker.remove());
    const newMarkers: mapboxgl.Marker[] = [];
    
    // Filter locations based on tab and search
    let locations = egyptLocations.filter(loc => {
      // Filter by tab type
      if (activeTab !== 'all') {
        if (activeTab === 'bins' && loc.type !== 'bin') return false;
        if (activeTab === 'dirty' && loc.type !== 'dirty') return false;
        if (activeTab === 'reports' && loc.type !== 'report') return false;
        if (activeTab === 'events' && loc.type !== 'event') return false;
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return loc.name.toLowerCase().includes(query) || 
               loc.location.toLowerCase().includes(query);
      }
      
      return true;
    });
    
    // Calculate distances if user location is available
    if (userLocation) {
      locations = locations.map(loc => {
        const distance = calculateDistance(
          userLocation[0], userLocation[1], 
          loc.coordinates[0], loc.coordinates[1]
        );
        return {
          ...loc,
          distance: formatDistance(distance),
          distanceValue: distance
        };
      });
      
      // Sort by distance
      locations.sort((a, b) => (a.distanceValue || 0) - (b.distanceValue || 0));
    }
    
    // Add new markers
    locations.forEach(loc => {
      // Create marker element
      const el = document.createElement('div');
      el.className = 'marker';
      
      // Style based on type
      if (loc.type === 'bin') {
        el.innerHTML = '<div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></div>';
      } else if (loc.type === 'dirty') {
        el.innerHTML = '<div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div>';
      } else if (loc.type === 'report') {
        el.innerHTML = '<div class="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>';
      } else if (loc.type === 'event') {
        el.innerHTML = '<div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></div>';
      }
      
      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <strong>${loc.name}</strong>
          <p class="text-sm">${loc.location}</p>
          ${loc.description ? `<p class="text-xs mt-1">${loc.description}</p>` : ''}
          ${loc.distance ? `<p class="text-xs text-gray-500">${loc.distance}</p>` : ''}
        </div>
      `);
      
      // Add marker to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat([loc.coordinates[0], loc.coordinates[1]])
        .setPopup(popup)
        .addTo(map.current!);
      
      newMarkers.push(marker);
    });
    
    setMarkers(newMarkers);
  };
  
  // Update markers when search query, filter, tab changes, or location changes
  useEffect(() => {
    if (map.current) {
      addMarkersToMap();
    }
  }, [searchQuery, filterType, activeTab, userLocation]);
  
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
      // For now, we'll just show a success toast
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

      // Add the new bin to the map immediately
      if (map.current && userLocation) {
        const el = document.createElement('div');
        el.className = 'marker';
        el.innerHTML = '<div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg></div>';
        
        const marker = new mapboxgl.Marker(el)
          .setLngLat(userLocation)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <strong>${newBin.name}</strong>
              <p class="text-sm">${newBin.location}</p>
              <p class="text-xs text-gray-500">Just added</p>
            </div>
          `))
          .addTo(map.current);
        
        setMarkers([...markers, marker]);
      }
    } catch (error) {
      console.error('Error adding bin:', error);
      toast({
        title: "Error",
        description: "Failed to add bin",
        variant: "destructive"
      });
    }
  };
  
  const filteredLocations = (type) => {
    let filtered = egyptLocations;
    
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

    // Calculate and add distance if user location is available
    if (userLocation) {
      filtered = filtered.map(loc => {
        const distance = calculateDistance(
          userLocation[0], userLocation[1], 
          loc.coordinates[0], loc.coordinates[1]
        );
        return {
          ...loc,
          distance: formatDistance(distance),
          distanceValue: distance
        };
      });
      
      // Sort by distance
      filtered.sort((a, b) => (a.distanceValue || 0) - (b.distanceValue || 0));
    }
    
    return filtered;
  };

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
        
        {/* Tabs */}
        <Tabs defaultValue="bins" className="w-full" onValueChange={(value) => setActiveTab(value)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="bins" className="text-xs">Trash Bins</TabsTrigger>
            <TabsTrigger value="dirty" className="text-xs">Dirty Areas</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs">Trash Reports</TabsTrigger>
            <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
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
            <div ref={mapContainer} className="w-full h-full absolute" />
            {locationLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* Content for each tab */}
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
                      if (map.current) {
                        map.current.flyTo({
                          center: [bin.coordinates[0], bin.coordinates[1]],
                          zoom: 14,
                          essential: true
                        });
                      }
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
          
          {/* Keep the rest of the tab content */}
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
          
          <TabsContent value="reports" className="mt-0">
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
          
          <TabsContent value="events" className="mt-0">
            <h2 className="text-lg font-bold mb-2">Cleanup Events</h2>
            <div className="space-y-2">
              {filteredLocations('event').map(event => (
                <div key={event.id} className="border border-border dark:border-gray-700 rounded-lg p-3">
                  <h3 className="font-medium">{event.name}</h3>
                  <p className="text-sm">{event.location}</p>
                  {event.distance && <p className="text-xs text-muted-foreground">{event.distance}</p>}
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
      
      {/* Add CSS for the user location marker pulse animation */}
      <style jsx global>{`
        .pulse-animation {
          animation: pulse 2s infinite;
        }
        
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
      `}</style>
      
      <NavBar />
    </div>
  );
};

export default Map;
