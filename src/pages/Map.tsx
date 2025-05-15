
import React, { useState } from 'react';
import { MapPin, Trash, Plus } from 'lucide-react';
import NavBar from '../components/NavBar';
import { useToast } from '@/hooks/use-toast';

// Mock bin data
const mockBins = [
  { id: '1', lat: 37.7749, lng: -122.4194, type: 'recycling' },
  { id: '2', lat: 37.7739, lng: -122.4312, type: 'general' },
  { id: '3', lat: 37.7833, lng: -122.4167, type: 'compost' },
  { id: '4', lat: 37.7694, lng: -122.4862, type: 'general' },
  { id: '5', lat: 37.7831, lng: -122.4039, type: 'recycling' },
];

// Mock dirty areas
const mockDirtyAreas = [
  { id: '1', lat: 37.7795, lng: -122.4224, severity: 'high' },
  { id: '2', lat: 37.7719, lng: -122.4132, severity: 'medium' },
  { id: '3', lat: 37.7873, lng: -122.4259, severity: 'low' },
];

const Map = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('bins'); // 'bins', 'dirty', 'events'
  const [showAddModal, setShowAddModal] = useState(false);
  
  // This is a placeholder for the actual map implementation
  // In a real app, we would use a map library like Google Maps, Mapbox, or Leaflet
  
  const handleAddBin = () => {
    setShowAddModal(true);
  };
  
  const handleSubmitBin = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would handle the bin submission
    toast({
      title: "Bin Added",
      description: "Thank you for adding a new bin location! It will be verified soon.",
    });
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <header className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold text-center">Nearby Bins</h1>
        
        {/* Tabs */}
        <div className="flex mt-4 border-b border-gray-200">
          <button 
            className={`flex-1 py-2 font-medium text-sm ${
              selectedTab === 'bins' 
                ? 'text-hero-primary border-b-2 border-hero-primary' 
                : 'text-gray-500'
            }`}
            onClick={() => setSelectedTab('bins')}
          >
            Trash Bins
          </button>
          <button 
            className={`flex-1 py-2 font-medium text-sm ${
              selectedTab === 'dirty' 
                ? 'text-hero-primary border-b-2 border-hero-primary' 
                : 'text-gray-500'
            }`}
            onClick={() => setSelectedTab('dirty')}
          >
            Dirty Areas
          </button>
          <button 
            className={`flex-1 py-2 font-medium text-sm ${
              selectedTab === 'events' 
                ? 'text-hero-primary border-b-2 border-hero-primary' 
                : 'text-gray-500'
            }`}
            onClick={() => setSelectedTab('events')}
          >
            Events
          </button>
        </div>
      </header>
      
      <main className="p-4">
        {/* Map placeholder */}
        <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb")' 
            }}
          />
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-30" />
          <div className="relative z-10 text-white text-center p-4">
            <h3 className="text-xl font-bold mb-2">Map Feature Coming Soon</h3>
            <p>In the full version, you'll see an interactive map with bin locations and dirty areas.</p>
          </div>
        </div>
        
        {/* List view */}
        <div className="space-y-4">
          {selectedTab === 'bins' && (
            <>
              <h2 className="text-lg font-semibold">Nearby Bins</h2>
              <div className="space-y-3">
                {mockBins.map(bin => (
                  <div key={bin.id} className="hero-card flex items-center">
                    <div className="bg-hero-primary bg-opacity-10 p-3 rounded-full mr-4">
                      <Trash className="w-6 h-6 text-hero-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{bin.type.charAt(0).toUpperCase() + bin.type.slice(1)} Bin</h3>
                      <p className="text-sm text-gray-500">250m away</p>
                    </div>
                    <button className="text-hero-accent">
                      <MapPin className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Add new bin button */}
              <button 
                onClick={handleAddBin}
                className="hero-button-outline w-full mt-4"
              >
                <Plus className="w-5 h-5" />
                <span>Add Missing Bin</span>
              </button>
            </>
          )}
          
          {selectedTab === 'dirty' && (
            <>
              <h2 className="text-lg font-semibold">Reported Dirty Areas</h2>
              <div className="space-y-3">
                {mockDirtyAreas.map(area => (
                  <div key={area.id} className="hero-card flex items-center">
                    <div className={`p-3 rounded-full mr-4 ${
                      area.severity === 'high' ? 'bg-red-100' : 
                      area.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      <Trash className={`w-6 h-6 ${
                        area.severity === 'high' ? 'text-red-500' : 
                        area.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {area.severity.charAt(0).toUpperCase() + area.severity.slice(1)} Priority Area
                      </h3>
                      <p className="text-sm text-gray-500">350m away</p>
                    </div>
                    <button className="text-hero-accent">
                      <MapPin className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          
          {selectedTab === 'events' && (
            <div className="text-center py-8">
              <h2 className="text-lg font-semibold mb-2">No Events Nearby</h2>
              <p className="text-gray-500">Check back later for organized cleanup events in your area!</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Add Bin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Missing Bin</h2>
            <form onSubmit={handleSubmitBin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bin Type
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg p-2">
                    <option>General Waste</option>
                    <option>Recycling</option>
                    <option>Compost</option>
                    <option>Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg p-2" 
                    rows={3}
                    placeholder="Add any helpful details about this bin location"
                  ></textarea>
                </div>
                
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Your current location will be used as the bin position. Make sure you are standing close to the bin.
                  </p>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2 bg-hero-primary text-white rounded-lg"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <NavBar />
    </div>
  );
};

export default Map;
