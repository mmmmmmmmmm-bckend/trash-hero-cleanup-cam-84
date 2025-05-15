
import React, { useState } from 'react';
import { X, MapPin, Search, Filter, Plus, ArrowRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface EzzatTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  tip?: {
    text: string;
    color: string;
  };
}

const EzzatTutorial: React.FC<EzzatTutorialProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const tutorialSteps: TutorialStep[] = [
    {
      icon: <MapPin className="h-12 w-12 text-primary" />,
      title: "Welcome to the Community Map!",
      description: "Let Ezzat guide you through how to use this interactive map to find and add trash bins, report dirty areas, and join cleanup events."
    },
    {
      icon: <Search className="h-10 w-10 text-primary mb-2" />,
      title: "Search for Locations",
      description: "Use the search bar at the top to find specific locations, bin types, or areas. The results will update automatically as you type.",
      tip: {
        text: "Tip: You can search by location name or type (e.g. "Recycling")",
        color: "primary"
      }
    },
    {
      icon: <Filter className="h-10 w-10 text-primary mb-2" />,
      title: "Filter by Categories",
      description: "Use the tabs to switch between different categories: Trash Bins, Dirty Areas, Trash Reports, and Cleanup Events.",
      tip: {
        text: "Each category is color-coded on the map for easy identification",
        color: "primary"
      }
    },
    {
      icon: <Plus className="h-10 w-10 text-green-600 mb-2" />,
      title: "Add New Bin",
      description: "Add a new trash bin by clicking the "Add Bin" button. Your location will be used to place the bin on the map. Fill in the details and help others find it!",
      tip: {
        text: "Contributing helps the community find proper waste disposal locations",
        color: "green-600"
      }
    },
    {
      icon: <MapPin className="h-10 w-10 text-primary mb-2" />,
      title: "Explore the Map",
      description: "Click on any marker to see its details. The map will show your current location (if allowed) and calculate distances to each bin or event.",
      tip: {
        text: "You can always access this guide by clicking the Help button",
        color: "primary"
      }
    }
  ];

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    setStep(1);
    onClose();
  };

  const currentStep = tutorialSteps[step - 1];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span role="img" aria-label="guide">🧭</span> 
            Ezzat Map Guide
          </DialogTitle>
          <Button 
            className="absolute right-4 top-4" 
            variant="ghost" 
            size="icon"
            onClick={handleFinish}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4">
            <div className="flex justify-center">
              {currentStep.icon}
            </div>
            <h3 className="text-lg font-semibold text-center">{currentStep.title}</h3>
            <p className="text-muted-foreground text-center">
              {currentStep.description}
            </p>
            {currentStep.tip && (
              <div className={`border border-dashed border-${currentStep.tip.color}/50 rounded-lg p-3 bg-${currentStep.tip.color}/5`}>
                <p className={`text-xs text-${currentStep.tip.color}`}>{currentStep.tip.text}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div 
                key={i} 
                className={`h-2 w-2 rounded-full ${step === i + 1 ? 'bg-primary' : 'bg-muted'}`}
              />
            ))}
          </div>
          <Button onClick={handleNext} className="flex items-center gap-1">
            {step < totalSteps ? 'Next' : 'Get Started'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EzzatTutorial;
