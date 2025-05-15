
import React from 'react';
import { Check, MapPin, Trash, Award, Star, Camera, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FeatureGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeatureGuide = ({ isOpen, onClose }: FeatureGuideProps) => {
  const features = [
    {
      title: "Cleanups",
      description: "Take photos of trash you collect to earn points and badges",
      icon: <Camera className="h-8 w-8 text-green-600" />,
    },
    {
      title: "Community Map",
      description: "Find trash bins, report dirty areas, and join cleanup events",
      icon: <MapPin className="h-8 w-8 text-blue-600" />,
    },
    {
      title: "Challenges",
      description: "Complete weekly and monthly challenges to earn bonus points",
      icon: <Award className="h-8 w-8 text-purple-600" />,
    },
    {
      title: "Leaderboard",
      description: "Compete with friends and community members to make the biggest impact",
      icon: <Star className="h-8 w-8 text-amber-600" />,
    },
    {
      title: "Events",
      description: "Join scheduled community cleanup events in your area",
      icon: <Calendar className="h-8 w-8 text-indigo-600" />,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to EcoTracker</DialogTitle>
          <DialogDescription>
            Your guide to making a difference in your community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="bg-muted rounded-full p-2 flex-shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            <Check className="mr-2 h-4 w-4" />
            Got it, thanks!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeatureGuide;
