
import React, { useState } from 'react';
import { Globe, Trash, User, MapPin, Search, Filter, Plus } from 'lucide-react';
import NavBar from '../components/NavBar';
import Header from '../components/Header';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Map = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Egyptian locations data - expanded with more places
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
    }
  ];
  
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
    
    return filtered;
  };

  return (
    <div className="min-h-screen pb-16 bg-background dark:bg-gray-900">
      <Header title="Community Map" showBack={true} />
      
      <main className="px-4">
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
        <Tabs defaultValue="bins" className="w-full">
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
            <Button size="sm" className="flex items-center gap-1 bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Add Bin
            </Button>
          </div>
          
          {/* Map (pyramid image placeholder) */}
          <div className="rounded-lg overflow-hidden h-60 mb-4 bg-gray-800 flex items-center justify-center">
            <div className="text-center text-white">
              <img 
                src="/placeholder.svg" 
                alt="Egyptian Map" 
                className="h-16 w-16 mx-auto mb-2 opacity-50" 
              />
              <h3 className="text-lg font-bold">Egypt Cleanup Map</h3>
              <p className="text-sm">In the full version, you'll see an interactive map of Egypt with bin locations, trash reports, and community cleanup areas.</p>
            </div>
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
                  <Button variant="ghost" size="icon" className="text-blue-500">
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
          
          <TabsContent value="dirty" className="mt-0">
            <h2 className="text-lg font-bold mb-2">Dirty Areas</h2>
            <div className="space-y-2">
              {filteredLocations('dirty').map(area => (
                <div key={area.id} className="border border-border dark:border-gray-700 rounded-lg p-3">
                  <h3 className="font-medium">{area.location}</h3>
                  <p className="text-sm text-muted-foreground">{area.description}</p>
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
      
      <NavBar />
    </div>
  );
};

export default Map;
