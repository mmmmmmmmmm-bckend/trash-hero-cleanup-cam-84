
import React, { useState } from 'react';
import { MapPin, Trash, Plus, Clock, Leaf, Filter, AlertCircle } from 'lucide-react';
import NavBar from '../components/NavBar';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  { id: '1', lat: 37.7795, lng: -122.4224, severity: 'high', reporter: 'Emma G.', timestamp: '2h ago', status: 'pending' },
  { id: '2', lat: 37.7719, lng: -122.4132, severity: 'medium', reporter: 'Alex R.', timestamp: '5h ago', status: 'acknowledged' },
  { id: '3', lat: 37.7873, lng: -122.4259, severity: 'low', reporter: 'Sam E.', timestamp: '1d ago', status: 'completed' },
];

// Mock trash reports
const mockTrashReports = [
  { id: '1', lat: 37.7719, lng: -122.4194, type: 'plastic', reporter: 'Jamie S.', timestamp: '30m ago', status: 'pending', description: 'Plastic bottles near park bench' },
  { id: '2', lat: 37.7829, lng: -122.4132, type: 'paper', reporter: 'Chris T.', timestamp: '2h ago', status: 'acknowledged', description: 'Paper waste by bus stop' },
  { id: '3', lat: 37.7763, lng: -122.4259, type: 'mixed', reporter: 'Alex M.', timestamp: '1d ago', status: 'completed', description: 'Mixed trash cleared from trail' },
];

// Mock cleanup events
const mockEvents = [
  { id: '1', lat: 37.7849, lng: -122.4294, title: 'Beach Cleanup', date: 'Sat, Jun 12', participants: 24 },
  { id: '2', lat: 37.7739, lng: -122.4332, title: 'Park Revival', date: 'Sun, Jun 20', participants: 15 },
];

const Map = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('bins'); // 'bins', 'dirty', 'reports', 'events'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const handleAddBin = () => {
    setShowAddModal(true);
  };
  
  const handleReportTrash = () => {
    setShowReportModal(true);
  };
  
  const handleSubmitBin = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Bin Added",
      description: "Thank you for adding a new bin location! It will be verified soon.",
    });
    setShowAddModal(false);
  };

  const handleSubmitTrashReport = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Trash Reported",
      description: "Thank you for reporting trash! Your contribution helps keep our community clean.",
    });
    setShowReportModal(false);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'acknowledged':
        return <Badge className="bg-blue-500">Acknowledged</Badge>;
      case 'completed':
        return <Badge className="bg-hero-success">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen pb-16 bg-gray-50">
      <header className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold text-center">Community Map</h1>
        
        {/* Tabs */}
        <div className="flex mt-4 border-b border-gray-200 overflow-x-auto">
          <button 
            className={`flex-1 py-2 font-medium text-sm whitespace-nowrap px-3 ${
              selectedTab === 'bins' 
                ? 'text-hero-primary border-b-2 border-hero-primary' 
                : 'text-gray-500'
            }`}
            onClick={() => setSelectedTab('bins')}
          >
            Trash Bins
          </button>
          <button 
            className={`flex-1 py-2 font-medium text-sm whitespace-nowrap px-3 ${
              selectedTab === 'dirty' 
                ? 'text-hero-primary border-b-2 border-hero-primary' 
                : 'text-gray-500'
            }`}
            onClick={() => setSelectedTab('dirty')}
          >
            Dirty Areas
          </button>
          <button 
            className={`flex-1 py-2 font-medium text-sm whitespace-nowrap px-3 ${
              selectedTab === 'reports' 
                ? 'text-hero-primary border-b-2 border-hero-primary' 
                : 'text-gray-500'
            }`}
            onClick={() => setSelectedTab('reports')}
          >
            Trash Reports
          </button>
          <button 
            className={`flex-1 py-2 font-medium text-sm whitespace-nowrap px-3 ${
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
        {/* Map controls */}
        <div className="flex justify-between mb-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 bg-white"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
          
          {selectedTab === 'reports' && (
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-1 bg-hero-primary hover:bg-hero-secondary"
              onClick={handleReportTrash}
            >
              <Plus className="w-4 h-4" />
              <span>Report Trash</span>
            </Button>
          )}
          
          {selectedTab === 'bins' && (
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-1 bg-hero-primary hover:bg-hero-secondary"
              onClick={handleAddBin}
            >
              <Plus className="w-4 h-4" />
              <span>Add Bin</span>
            </Button>
          )}
        </div>
        
        {/* Filter options - conditionally shown */}
        {showFilters && (
          <Card className="mb-4 animate-scale-in">
            <CardContent className="p-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Recently Added</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Nearest</Badge>
                {selectedTab === 'reports' && (
                  <>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Pending</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Acknowledged</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Completed</Badge>
                  </>
                )}
                {selectedTab === 'bins' && (
                  <>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Recycling</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">General</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">Compost</Badge>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Map placeholder */}
        <div className="w-full h-72 bg-gray-200 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb")' 
            }}
          />
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-30" />
          <div className="relative z-10 text-white text-center p-4">
            <h3 className="text-xl font-bold mb-2">Map Feature Coming Soon</h3>
            <p className="text-sm">In the full version, you'll see an interactive map with bin locations, trash reports, and dirty areas.</p>
          </div>
        </div>
        
        {/* List view */}
        <div className="space-y-4">
          {selectedTab === 'bins' && (
            <>
              <h2 className="text-lg font-semibold flex items-center">
                <Trash className="w-5 h-5 mr-2 text-hero-primary" />
                Nearby Bins
              </h2>
              <div className="space-y-3">
                {mockBins.map(bin => (
                  <Card key={bin.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-center p-4">
                        <div className="bg-hero-primary bg-opacity-10 p-3 rounded-full mr-4">
                          <Trash className="w-6 h-6 text-hero-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{bin.type.charAt(0).toUpperCase() + bin.type.slice(1)} Bin</h3>
                          <p className="text-sm text-gray-500">250m away</p>
                        </div>
                        <button className="text-hero-accent p-2">
                          <MapPin className="w-5 h-5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Add new bin button */}
              <Button 
                onClick={handleAddBin}
                className="hero-button-outline w-full mt-4"
              >
                <Plus className="w-5 h-5" />
                <span>Add Missing Bin</span>
              </Button>
            </>
          )}
          
          {selectedTab === 'dirty' && (
            <>
              <h2 className="text-lg font-semibold flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-hero-primary" />
                Reported Dirty Areas
              </h2>
              <div className="space-y-3">
                {mockDirtyAreas.map(area => (
                  <Card key={area.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-center p-4">
                        <div className={`p-3 rounded-full mr-4 ${
                          area.severity === 'high' ? 'bg-red-100' : 
                          area.severity === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                        }`}>
                          <AlertCircle className={`w-6 h-6 ${
                            area.severity === 'high' ? 'text-red-500' : 
                            area.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">
                              {area.severity.charAt(0).toUpperCase() + area.severity.slice(1)} Priority Area
                            </h3>
                            {getStatusBadge(area.status)}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <span className="mr-3">Reported by {area.reporter}</span>
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{area.timestamp}</span>
                          </div>
                        </div>
                        <button className="text-hero-accent p-2">
                          <MapPin className="w-5 h-5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
          
          {selectedTab === 'reports' && (
            <>
              <h2 className="text-lg font-semibold flex items-center">
                <Trash className="w-5 h-5 mr-2 text-hero-primary" />
                Trash Reports
              </h2>
              <div className="space-y-3">
                {mockTrashReports.map(report => (
                  <Card key={report.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-center p-4">
                        <div className="bg-hero-primary bg-opacity-10 p-3 rounded-full mr-4">
                          <Trash className="w-6 h-6 text-hero-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{report.type.charAt(0).toUpperCase() + report.type.slice(1)} Waste</h3>
                            {getStatusBadge(report.status)}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span className="mr-3">Reported by {report.reporter}</span>
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{report.timestamp}</span>
                          </div>
                        </div>
                        <button className="text-hero-accent p-2">
                          <MapPin className="w-5 h-5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Report Trash button */}
              <Button 
                onClick={handleReportTrash}
                className="hero-button w-full mt-4"
              >
                <Plus className="w-5 h-5" />
                <span>Report Trash</span>
              </Button>
            </>
          )}
          
          {selectedTab === 'events' && (
            <>
              {mockEvents.length > 0 ? (
                <>
                  <h2 className="text-lg font-semibold flex items-center">
                    <Leaf className="w-5 h-5 mr-2 text-hero-primary" />
                    Upcoming Cleanup Events
                  </h2>
                  <div className="space-y-3">
                    {mockEvents.map(event => (
                      <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="flex items-center p-4">
                            <div className="bg-hero-accent bg-opacity-10 p-3 rounded-full mr-4">
                              <Leaf className="w-6 h-6 text-hero-accent" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{event.title}</h3>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">{event.date}</p>
                                <p className="text-sm text-hero-accent">{event.participants} participants</p>
                              </div>
                            </div>
                            <button className="text-hero-accent p-2">
                              <MapPin className="w-5 h-5" />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <h2 className="text-lg font-semibold mb-2">No Events Nearby</h2>
                  <p className="text-gray-500">Check back later for organized cleanup events in your area!</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      {/* Add Bin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-scale-in">
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
                  <Button 
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 bg-hero-primary hover:bg-hero-secondary"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Trash Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md animate-scale-in">
            <h2 className="text-xl font-bold mb-4">Report Trash</h2>
            <form onSubmit={handleSubmitTrashReport}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trash Type
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg p-2">
                    <option>Plastic</option>
                    <option>Paper</option>
                    <option>Glass</option>
                    <option>Metal</option>
                    <option>Organic</option>
                    <option>Mixed</option>
                    <option>Hazardous</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg p-2">
                    <option>Low - Small amount of litter</option>
                    <option>Medium - Noticeable trash</option>
                    <option>High - Significant dumping</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg p-2" 
                    rows={3}
                    placeholder="Describe the trash situation (amount, location details, etc.)"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <button 
                      type="button" 
                      className="text-hero-primary hover:text-hero-secondary"
                    >
                      Take a photo or upload from gallery
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Your current location will be used for this report. Make sure you're at the trash location when submitting.
                  </p>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button 
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowReportModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 bg-hero-primary hover:bg-hero-secondary"
                  >
                    Submit Report
                  </Button>
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
