
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash, MapPin, Award, Star } from "lucide-react";

interface MapTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const MapTutorial = ({ isOpen, onClose }: MapTutorialProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">App Features Guide</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="map" className="w-full mt-6">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="map">Map</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="points">Points</TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-4">
            <TabsContent value="home" className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium flex items-center gap-2 mb-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Star className="h-5 w-5 text-primary" />
                  </div>
                  Home Screen
                </h3>
                <p className="text-sm text-muted-foreground">
                  The main dashboard shows your impact statistics and gives you quick access to all features.
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>View your total points and ranking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Start a new cleanup with one tap</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>See your current challenges and leaderboards</span>
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="map" className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium flex items-center gap-2 mb-2">
                  <div className="p-2 bg-green-100 rounded-full">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  Community Map
                </h3>
                <p className="text-sm text-muted-foreground">
                  Find nearby trash bins, report dirty areas, and join community cleanup events.
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>See all nearby bins on the interactive map</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Add new bin locations to help others</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Report dirty areas that need attention</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">•</span>
                    <span>Find and join community cleanup events</span>
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="challenges" className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium flex items-center gap-2 mb-2">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Award className="h-5 w-5 text-blue-600" />
                  </div>
                  Challenges
                </h3>
                <p className="text-sm text-muted-foreground">
                  Complete cleanup challenges to earn points, badges, and unlock rewards.
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Daily, weekly and special challenges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Track your progress on all challenges</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Earn badges for completing milestones</span>
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="points" className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium flex items-center gap-2 mb-2">
                  <div className="p-2 bg-yellow-100 rounded-full">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  Points & Rewards
                </h3>
                <p className="text-sm text-muted-foreground">
                  Earn points for every cleanup action and redeem them for rewards.
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Track your point history and total</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Compete with friends on the leaderboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    <span>Redeem points for discounts and rewards</span>
                  </li>
                </ul>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="mt-6 flex gap-4">
          <Button onClick={onClose} className="w-full">
            Got It
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MapTutorial;
