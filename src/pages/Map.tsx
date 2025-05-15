
import React, { useState } from 'react';
import { Globe, Trash, User, MapPin, Search, Filter, Plus } from 'lucide-react';
import NavBar from '../components/NavBar';
import Header from '../components/Header';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Map = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Egyptian locations data
  const egyptLocations = [
    {
      id: 1,
      name: 'Recycling Bin',
      type: 'bin',
      distance: '250m away',
      location: 'Nile Riverbank, Cairo',
    },
    {
      id: 2,
      name: 'General Bin',
      type: 'bin',
      distance: '250m away',
      location: 'Alexandria Beach',
    },
    {
      id: 3,
      name: 'Compost Bin',
      type: 'bin',
      distance: '250m away',
      location: 'Giza Market Area',
    },
    {
      id: 4,
      name: 'General Bin',
      type: 'bin',
      distance: '350m away',
      location: 'Luxor Temple Surroundings',
    },
    {
      id: 5,
      name: 'Dirty Area',
      type: 'dirty',
      description: 'Tourist trash accumulating near historic site',
      location: 'Luxor Temple Surroundings',
    },
    {
      id: 6,
      name: 'Trash Report',
      type: 'report',
      description: 'Heavy plastic waste accumulation needs cleanup',
      location: 'Dahab Coastline',
    },
  ];
  
  const filteredLocations = (type) => {
    const filtered = searchQuery
      ? egyptLocations.filter(loc => 
          (loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          loc.location.toLowerCase().includes(searchQuery.toLowerCase())) &&
          loc.type === type
        )
      : egyptLocations.filter(loc => loc.type === type);
    
    return filtered;
  };

  return (
    <div className="min-h-screen pb-16 bg-background dark:bg-gray-900">
      <Header title="Community Map" showBack={true} />
      
      <main className="px-4">
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
                alt="Pyramid Map Placeholder" 
                className="h-16 w-16 mx-auto mb-2 opacity-50" 
              />
              <h3 className="text-lg font-bold">Map Feature Coming Soon</h3>
              <p className="text-sm">In the full version, you'll see an interactive map with bin locations, trash reports, and dirty areas.</p>
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
                      <p className="text-xs text-muted-foreground">{bin.distance}</p>
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
            <div className="text-center py-8 text-muted-foreground">
              <p>No events scheduled</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <NavBar />
    </div>
  );
};

export default Map;
