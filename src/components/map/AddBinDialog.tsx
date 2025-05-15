
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from 'lucide-react';

interface AddBinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newBin: {
    name: string;
    type: string;
    location: string;
  };
  setNewBin: React.Dispatch<React.SetStateAction<{
    name: string;
    type: string;
    location: string;
  }>>;
  onAddBin: () => void;
  userLocation: {lat: number, lng: number} | null;
}

const AddBinDialog = ({ 
  open, 
  onOpenChange, 
  newBin, 
  setNewBin, 
  onAddBin, 
  userLocation 
}: AddBinDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onAddBin}>Add Bin</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddBinDialog;
