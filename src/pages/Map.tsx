import React, { useState } from 'react';
import { Trash, User, MapPin, Search, Filter, Plus, Info, HelpCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '../components/NavBar';
import Header from '../components/Header';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import MapComponent from '@/components/map/MapComponent';
import LocationList from '@/components/map/LocationList';
import AddBinDialog from '@/components/map/AddBinDialog';
import MapTutorial from '@/components/MapTutorial';

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
  
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('bins');
  const [addingBin, setAddingBin] = useState(false);
  const [newBin, setNewBin] = useState({
    name: '',
    type: 'General Bin',
    location: ''
  });
  const [showMapTutorial, setShowMapTutorial] = useState(false);
  
  // Placeholder locations data
  const [locations] = useState<Location[]>([
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

  // Simplified empty handler functions
  const handleAddBin = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Adding bins will be available in future updates",
    });
    setAddingBin(false);
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

  // Simplified handlers
  const handleMarkerClick = () => {};
  const handleInfoWindowClose = () => {};
  const handleLocationSelect = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Location selection will be available in future updates",
    });
  };

  return (
    <div className="min-h-screen pb-16 bg-background">
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
        
        {/* Header with help button */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Map</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1 text-primary"
            onClick={() => setShowMapTutorial(true)}
          >
            <HelpCircle className="h-4 w-4" />
            Help
          </Button>
        </div>
        
        {/* Map Tutorial Dialog */}
        <MapTutorial 
          isOpen={showMapTutorial} 
          onClose={() => setShowMapTutorial(false)} 
        />
        
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
            
            <AddBinDialog
              open={addingBin}
              onOpenChange={setAddingBin}
              newBin={newBin}
              setNewBin={setNewBin}
              onAddBin={handleAddBin}
              userLocation={null}
            />
            
            <Button 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => setAddingBin(true)}
            >
              <Plus className="h-4 w-4" />
              Add Bin
            </Button>
          </div>
          
          {/* Interactive Map replaced with coming soon banner */}
          <div className="rounded-lg overflow-hidden h-60 mb-4 relative">
            <MapComponent
              mapCenter={{ lat: 30.0444, lng: 31.2357 }}
              zoom={13}
              userLocation={null}
              locations={locations}
              activeTab={activeTab}
              selectedLocation={null}
              onMarkerClick={handleMarkerClick}
              onInfoWindowClose={handleInfoWindowClose}
              containerStyle={containerStyle}
            />
          </div>
          
          {/* Tab content sections */}
          <TabsContent value="bins" className="mt-0">
            <LocationList
              title="Nearby Bins"
              locations={filteredLocations('bin')}
              onSelectLocation={handleLocationSelect}
              emptyMessage="No bins found"
              icon={<Trash className="h-5 w-5" />}
            />
          </TabsContent>
          
          {/* Other tab content */}
          <TabsContent value="dirty" className="mt-0">
            <LocationList
              title="Dirty Areas"
              locations={filteredLocations('dirty')}
              onSelectLocation={handleLocationSelect}
              emptyMessage="No dirty areas reported"
            />
          </TabsContent>
          
          <TabsContent value="report" className="mt-0">
            <LocationList
              title="Trash Reports"
              locations={filteredLocations('report')}
              onSelectLocation={handleLocationSelect}
              emptyMessage="No reports found"
            />
          </TabsContent>
          
          <TabsContent value="event" className="mt-0">
            <LocationList
              title="Cleanup Events"
              locations={filteredLocations('event')}
              onSelectLocation={handleLocationSelect}
              emptyMessage="No events scheduled"
            />
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
