
import React, { useState } from 'react';
import { MapPin, Trash, Plus, Clock, Leaf, Filter, AlertCircle } from 'lucide-react';
import NavBar from '../components/NavBar';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '../components/Header';

// Mock bin data for Egyptian locations
const mockBins = [
  { id: '1', lat: 30.0444, lng: 31.2357, type: 'recycling', location: 'Cairo Downtown' },
  { id: '2', lat: 30.0609, lng: 31.2197, type: 'general', location: 'Giza Square' },
  { id: '3', lat: 31.2001, lng: 29.9187, type: 'compost', location: 'Alexandria Corniche' },
  { id: '4', lat: 30.0566, lng: 31.2262, type: 'general', location: 'Tahrir Square' },
  { id: '5', lat: 30.0130, lng: 31.2088, type: 'recycling', location: 'Zamalek District' },
];

// Mock dirty areas with Egyptian locations
const mockDirtyAreas = [
  { id: '1', lat: 30.0444, lng: 31.2357, severity: 'high', reporter: 'Ahmed M.', timestamp: '2h ago', status: 'pending', location: 'Nile Riverside' },
  { id: '2', lat: 30.0609, lng: 31.2197, severity: 'medium', reporter: 'Mona S.', timestamp: '5h ago', status: 'acknowledged', location: 'Khan el-Khalili' },
  { id: '3', lat: 31.2001, lng: 29.9187, severity: 'low', reporter: 'Karim H.', timestamp: '1d ago', status: 'completed', location: 'El Montazah Gardens' },
];

// Mock trash reports with Egyptian locations
const mockTrashReports = [
  { id: '1', lat: 30.0444, lng: 31.2357, type: 'plastic', reporter: 'Laila F.', timestamp: '30m ago', status: 'pending', description: 'Plastic bottles near Al-Azhar Park', location: 'Al-Azhar Park' },
  { id: '2', lat: 30.0609, lng: 31.2197, type: 'paper', reporter: 'Tarek N.', timestamp: '2h ago', status: 'acknowledged', description: 'Paper waste by Tahrir metro station', location: 'Tahrir Metro' },
  { id: '3', lat: 31.2001, lng: 29.9187, type: 'mixed', reporter: 'Sara A.', timestamp: '1d ago', status: 'completed', description: 'Mixed trash cleared from Nile walkway', location: 'Nile Walkway' },
];

// Mock cleanup events with Egyptian locations
const mockEvents = [
  { id: '1', lat: 30.0444, lng: 31.2357, title: 'Nile River Cleanup', date: 'Sat, Jun 12', participants: 24, location: 'Cairo Nile Corniche' },
  { id: '2', lat: 31.2001, lng: 29.9187, title: 'Alexandria Beach Revival', date: 'Sun, Jun 20', participants: 15, location: 'Montazah Beach' },
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
        return <Badge className="bg-yellow-500 dark:bg-yellow-600">Pending</Badge>;
      case 'acknowledged':
        return <Badge className="bg-blue-500 dark:bg-blue-600">Acknowledged</Badge>;
      case 'completed':
        return <Badge className="bg-hero-success dark:bg-green-700">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen pb-16 bg-background">
      <Header title="Community Map" showBack={true} />
      
      {/* Tabs */}
      <div className="bg-card dark:bg-card p-4 shadow-sm">
        <div className="flex mt-2 border-b border-border overflow-x-auto">
          <button 
            className={`flex-1 py-2 font-medium text-sm whitespace-nowrap px-3 ${
              selectedTab === 'bins' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setSelectedTab('bins')}
          >
            Trash Bins
          </button>
          <button 
            className={`flex-1 py-2 font-medium text-sm whitespace-nowrap px-3 ${
              selectedTab === 'dirty' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setSelectedTab('dirty')}
          >
            Dirty Areas
          </button>
          <button 
            className={`flex-1 py-2 font-medium text-sm whitespace-nowrap px-3 ${
              selectedTab === 'reports' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setSelectedTab('reports')}
          >
            Trash Reports
          </button>
          <button 
            className={`flex-1 py-2 font-medium text-sm whitespace-nowrap px-3 ${
              selectedTab === 'events' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setSelectedTab('events')}
          >
            Events
          </button>
        </div>
      </div>
      
      <main className="p-4">
        {/* Map controls */}
        <div className="flex justify-between mb-3">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
          
          {selectedTab === 'reports' && (
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-1 bg-primary hover:bg-primary/80"
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
              className="flex items-center gap-1 bg-primary hover:bg-primary/80"
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
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">Recently Added</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-muted">Nearest</Badge>
                {selectedTab === 'reports' && (
                  <>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">Pending</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">Acknowledged</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">Completed</Badge>
                  </>
                )}
                {selectedTab === 'bins' && (
                  <>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">Recycling</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">General</Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-muted">Compost</Badge>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Map placeholder */}
        <div className="w-full h-72 bg-gray-200 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-cover bg-center opacity-60 dark:opacity-40"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1556674440-76fb5733f224?q=80&w=3870&auto=format&fit=crop")' 
            }}
          />
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-30 dark:bg-opacity-60" />
          <div className="relative z-10 text-white text-center p-4">
            <h3 className="text-xl font-bold mb-2">Egyptian Interactive Map</h3>
            <p className="text-sm">In the full version, you'll see an interactive map with bin locations, trash reports, and dirty areas across Egypt.</p>
          </div>
        </div>
        
        {/* List view */}
        <div className="space-y-4">
          {selectedTab === 'bins' && (
            <>
              <h2 className="text-lg font-semibold flex items-center">
                <Trash className="w-5 h-5 mr-2 text-primary" />
                Nearby Bins in Egypt
              </h2>
              <div className="space-y-3">
                {mockBins.map(bin => (
                  <Card key={bin.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-center p-4">
                        <div className="bg-primary/10 p-3 rounded-full mr-4">
                          <Trash className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{bin.type.charAt(0).toUpperCase() + bin.type.slice(1)} Bin</h3>
                          <p className="text-sm text-muted-foreground">{bin.location}</p>
                        </div>
                        <button className="text-accent p-2">
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
                <AlertCircle className="w-5 h-5 mr-2 text-primary" />
                Reported Dirty Areas in Egypt
              </h2>
              <div className="space-y-3">
                {mockDirtyAreas.map(area => (
                  <Card key={area.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-center p-4">
                        <div className={`p-3 rounded-full mr-4 ${
                          area.severity === 'high' ? 'bg-red-100 dark:bg-red-900/30' : 
                          area.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-green-100 dark:bg-green-900/30'
                        }`}>
                          <AlertCircle className={`w-6 h-6 ${
                            area.severity === 'high' ? 'text-red-500 dark:text-red-400' : 
                            area.severity === 'medium' ? 'text-yellow-500 dark:text-yellow-400' : 'text-green-500 dark:text-green-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">
                              {area.location}
                            </h3>
                            {getStatusBadge(area.status)}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <span className="mr-3">Reported by {area.reporter}</span>
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{area.timestamp}</span>
                          </div>
                        </div>
                        <button className="text-accent p-2">
                          <MapPin className="w-5 h-5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
          
          {/* Reports tab content */}
          {selectedTab === 'reports' && (
            <>
              <h2 className="text-lg font-semibold flex items-center">
                <Trash className="w-5 h-5 mr-2 text-primary" />
                Trash Reports in Egypt
              </h2>
              <div className="space-y-3">
                {mockTrashReports.map(report => (
                  <Card key={report.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-center p-4">
                        <div className="bg-primary/10 p-3 rounded-full mr-4">
                          <Trash className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium">{report.location}</h3>
                            {getStatusBadge(report.status)}
                          </div>
                          <p className="text-sm text-card-foreground/80 mt-1">{report.description}</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <span className="mr-3">Reported by {report.reporter}</span>
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{report.timestamp}</span>
                          </div>
                        </div>
                        <button className="text-accent p-2">
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
          
          {/* Events tab content */}
          {selectedTab === 'events' && (
            <>
              {mockEvents.length > 0 ? (
                <>
                  <h2 className="text-lg font-semibold flex items-center">
                    <Leaf className="w-5 h-5 mr-2 text-primary" />
                    Upcoming Cleanup Events in Egypt
                  </h2>
                  <div className="space-y-3">
                    {mockEvents.map(event => (
                      <Card key={event.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardContent className="p-0">
                          <div className="flex items-center p-4">
                            <div className="bg-accent/10 p-3 rounded-full mr-4">
                              <Leaf className="w-6 h-6 text-accent" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium">{event.title}</h3>
                              <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">{event.date}</p>
                                <p className="text-sm text-accent">{event.participants} participants</p>
                              </div>
                              <p className="text-xs text-muted-foreground">{event.location}</p>
                            </div>
                            <button className="text-accent p-2">
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
                  <h2 className="text-lg font-semibold mb-2">No Events in Egypt Yet</h2>
                  <p className="text-muted-foreground">Check back later for organized cleanup events in your area!</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      {/* Add Bin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card text-card-foreground rounded-xl p-6 w-full max-w-md animate-scale-in">
            <h2 className="text-xl font-bold mb-4">Add Missing Bin</h2>
            <form onSubmit={handleSubmitBin}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bin Type
                  </label>
                  <select className="w-full border border-input bg-background rounded-lg p-2">
                    <option>General Waste</option>
                    <option>Recycling</option>
                    <option>Compost</option>
                    <option>Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Notes (Optional)
                  </label>
                  <textarea 
                    className="w-full border border-input bg-background rounded-lg p-2" 
                    rows={3}
                    placeholder="Add any helpful details about this bin location"
                  ></textarea>
                </div>
                
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
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
                    className="flex-1"
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
          <div className="bg-card text-card-foreground rounded-xl p-6 w-full max-w-md animate-scale-in">
            <h2 className="text-xl font-bold mb-4">Report Trash</h2>
            <form onSubmit={handleSubmitTrashReport}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Trash Type
                  </label>
                  <select className="w-full border border-input bg-background rounded-lg p-2">
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
                  <label className="block text-sm font-medium mb-1">
                    Severity
                  </label>
                  <select className="w-full border border-input bg-background rounded-lg p-2">
                    <option>Low - Small amount of litter</option>
                    <option>Medium - Noticeable trash</option>
                    <option>High - Significant dumping</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea 
                    className="w-full border border-input bg-background rounded-lg p-2" 
                    rows={3}
                    placeholder="Describe the trash situation (amount, location details, etc.)"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Photo (Optional)
                  </label>
                  <div className="border-2 border-dashed border-input rounded-lg p-4 text-center">
                    <button 
                      type="button" 
                      className="text-primary hover:text-primary/80"
                    >
                      Take a photo or upload from gallery
                    </button>
                  </div>
                </div>
                
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
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
                    className="flex-1"
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
