
import React, { useState } from 'react';
import { X, MapPin, Search, Filter, Plus, ArrowRight, Camera, Award, Home, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface AppTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  path?: string;
  tip?: {
    text: string;
    color: string;
  };
}

const AppTutorial: React.FC<AppTutorialProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const tutorialSteps: TutorialStep[] = [
    {
      icon: <Home className="h-12 w-12 text-primary" />,
      title: "Welcome to TrashHero!",
      description: "Let's guide you through how to use this app to make a positive impact on the environment by tracking and cleaning up trash."
    },
    {
      icon: <MapPin className="h-10 w-10 text-primary mb-2" />,
      path: "/map",
      title: "Community Map",
      description: "Explore the interactive map to find nearby trash bins, report dirty areas, and join community cleanup events.",
      tip: {
        text: 'Tip: You can search by location name or type (e.g. "Recycling")',
        color: "primary"
      }
    },
    {
      icon: <Camera className="h-10 w-10 text-green-600 mb-2" />,
      path: "/cleanup",
      title: "Cleanup Camera",
      description: "Take photos of trash before and after you clean it up. The app will automatically calculate points based on your impact.",
      tip: {
        text: "Regular cleanups help you earn more points and badges",
        color: "green-600"
      }
    },
    {
      icon: <Award className="h-10 w-10 text-amber-600 mb-2" />,
      path: "/challenges",
      title: "Complete Challenges",
      description: "Join challenges to compete with others and earn special badges. Complete weekly and monthly challenges to maximize your impact.",
      tip: {
        text: "Challenges offer bonus points and exclusive rewards",
        color: "amber-600"
      }
    },
    {
      icon: <Star className="h-10 w-10 text-primary mb-2" />,
      path: "/points",
      title: "Track Your Progress",
      description: "Check your points, earned badges, and track your environmental impact over time. Redeem points for rewards from local partners.",
      tip: {
        text: "You can always access this guide by clicking the Help button on the homepage",
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
  
  const handleNavigate = () => {
    const currentPath = tutorialSteps[step - 1].path;
    if (currentPath) {
      navigate(currentPath);
    }
    handleFinish();
  };

  const currentStep = tutorialSteps[step - 1];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span role="img" aria-label="guide">🧭</span> 
            TrashHero Guide
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
          <div className="flex gap-2">
            {currentStep.path && (
              <Button onClick={handleNavigate} variant="outline">
                Go to {currentStep.title}
              </Button>
            )}
            <Button onClick={handleNext} className="flex items-center gap-1">
              {step < totalSteps ? 'Next' : 'Get Started'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppTutorial;
