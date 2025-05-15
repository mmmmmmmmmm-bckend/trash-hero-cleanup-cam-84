
import React, { useState } from 'react';
import { Globe, Trash, User, MapPin, Search } from 'lucide-react';
import NavBar from '../components/NavBar';
import Header from '../components/Header';

const Map = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Updated data with Egyptian locations
  const egyptLocations = [
    {
      id: 1,
      location: 'Nile Riverbank, Cairo',
      description: 'Heavy plastic waste accumulation near the riverbank',
      type: 'Plastic',
      reportedBy: 'Ahmed',
      date: '2 days ago',
      lat: 30.0444,
      lng: 31.2357,
    },
    {
      id: 2,
      location: 'Alexandria Beach',
      description: 'Beach cleanup needed, mostly plastic bottles and bags',
      type: 'Mixed',
      reportedBy: 'Fatima',
      date: '5 days ago',
      lat: 31.2001,
      lng: 29.9187,
    },
    {
      id: 3,
      location: 'Giza Market Area',
      description: 'Litter around market stalls needs cleanup',
      type: 'General',
      reportedBy: 'Mohamed',
      date: '1 week ago',
      lat: 30.0131,
      lng: 31.2089,
    },
    {
      id: 4,
      location: 'Luxor Temple Surroundings',
      description: 'Tourist trash accumulating near historic site',
      type: 'Mixed',
      reportedBy: 'Nour',
      date: '3 days ago',
      lat: 25.6995,
      lng: 32.6421,
    },
    {
      id: 5,
      location: 'Dahab Coastline',
      description: 'Underwater cleanup needed for coral reef protection',
      type: 'Plastic',
      reportedBy: 'Khaled',
      date: '6 days ago',
      lat: 28.5091,
      lng: 34.5136,
    }
  ];
  
  const filteredLocations = searchQuery
    ? egyptLocations.filter(loc => 
        loc.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
        loc.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : egyptLocations;

  return (
    <div className="min-h-screen pb-16 bg-background">
      <Header title="Cleanup Map" showBack={true} />
      
      <main className="p-4">
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search locations or type..."
            className="pl-10 pr-4 py-2 w-full rounded-full border border-border bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Map (placeholder) */}
        <div className="rounded-lg overflow-hidden h-60 mb-4 bg-accent/10 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Interactive map of Egypt showing cleanup locations</p>
          </div>
        </div>
        
        {/* Locations list */}
        <h2 className="font-bold text-lg mb-2">Cleanup Spots in Egypt</h2>
        <div className="space-y-3">
          {filteredLocations.map(location => (
            <div key={location.id} className="rounded-lg bg-card p-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{location.location}</h3>
                  <p className="text-sm text-muted-foreground">{location.description}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs bg-accent/20 px-2 py-1 rounded-full">{location.type}</span>
                    <span className="text-xs flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {location.reportedBy}
                    </span>
                    <span className="text-xs text-muted-foreground">{location.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredLocations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Trash className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>No cleanup locations found</p>
            </div>
          )}
        </div>
      </main>
      
      <NavBar />
    </div>
  );
};

export default Map;
