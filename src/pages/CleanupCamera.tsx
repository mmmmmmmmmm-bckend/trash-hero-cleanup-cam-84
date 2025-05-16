
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, RotateCw, X, Info, Image as ImageIcon, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const CleanupCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [trashWeight, setTrashWeight] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [location, setLocation] = useState('Unknown location');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          fetchLocation(latitude, longitude);
        },
        error => {
          console.error("Error getting location: ", error);
        }
      );
    }
  }, []);

  const fetchLocation = async (latitude: number, longitude: number) => {
    try {
      // For demonstration, we'll just use coordinates. In a real app,
      // you might use a geocoding service to get the address.
      setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };

  useEffect(() => {
    // Start camera when component mounts
    startCamera();
    
    // Clean up camera stream when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraFacing]);
  
  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const constraints = {
        video: { 
          facingMode: cameraFacing,
          width: { ideal: 720 },
          height: { ideal: 1280 }
        }, 
        audio: false
      };
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };
  
  const switchCamera = () => {
    setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment');
  };
  
  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Make the canvas the same size as the video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame onto the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    setHasPhoto(true);
  };
  
  const clearPhoto = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasPhoto(false);
  };
  
  const saveCleanup = async () => {
    if (!user || !canvasRef.current || !hasPhoto) {
      toast({
        title: "Error",
        description: "Please take a photo first",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Convert weight to number
      const weightKg = parseFloat(trashWeight);
      if (isNaN(weightKg)) {
        throw new Error("Please enter a valid weight");
      }
      
      // Calculate points (10 points per kg)
      const points = Math.round(weightKg * 10);
      
      // Get image from canvas as blob
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const blob = await (await fetch(dataUrl)).blob();
      
      // Upload image to Supabase Storage
      const fileName = `cleanup-${Date.now()}.jpg`;
      const { data: fileData, error: fileError } = await supabase.storage
        .from('cleanups')
        .upload(fileName, blob);
      
      if (fileError) {
        throw fileError;
      }
      
      // Get public URL for the image
      const { data: urlData } = supabase.storage
        .from('cleanups')
        .getPublicUrl(fileName);
      
      const imageUrl = urlData.publicUrl;
      
      // Insert cleanup record
      const { data, error } = await supabase
        .from('cleanups')
        .insert([{
          user_id: user.id,
          location,
          trash_weight_kg: weightKg,
          points,
          verified: false,
          image_url: imageUrl
        }]);
      
      if (error) {
        throw error;
      }
      
      // Update user's total points
      await supabase.rpc('increment_user_points', {
        user_id: user.id,
        points_to_add: points
      });
      
      // Show success dialog
      setShowSuccess(true);
      
    } catch (error: any) {
      console.error('Error saving cleanup:', error);
      toast({
        title: "Error",
        description: error.message || "Could not save cleanup",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen relative flex flex-col bg-black">
      {/* Top buttons for navigation and camera controls */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-black/50 text-white hover:bg-black/70"
          onClick={() => navigate(-1)}
        >
          <X className="h-5 w-5" />
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={() => setShowInfo(true)}
          >
            <Info className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={switchCamera}
          >
            <RotateCw className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Camera view */}
      <div className="flex-1 relative overflow-hidden">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          className={`h-full w-full object-cover ${hasPhoto ? 'hidden' : 'block'}`}
          style={{ transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none' }}
        />
        <canvas 
          ref={canvasRef}
          className={`h-full w-full object-contain bg-black ${hasPhoto ? 'block' : 'hidden'}`}
          style={{ transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none' }}
        />
      </div>
      
      {/* Bottom controls */}
      {!hasPhoto ? (
        <div className="p-6 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 flex justify-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="rounded-full w-16 h-16 p-0 border-4 border-white text-white hover:bg-white/20"
            onClick={takePhoto}
          >
            <Camera className="h-8 w-8" />
          </Button>
        </div>
      ) : (
        <div className="p-6 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Trash className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Weight (kg)"
                className="bg-white/10 border-0 text-white placeholder-white/60"
                value={trashWeight}
                onChange={(e) => setTrashWeight(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              className="rounded-full flex-1 text-white border-white hover:bg-white/20"
              onClick={clearPhoto}
            >
              Retake
            </Button>
            <Button 
              className="rounded-full flex-1"
              onClick={saveCleanup}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      )}
      
      {/* Info dialog */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How to record a cleanup</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>
                1. Take a photo of the trash you've collected
              </p>
              <p>
                2. Enter the approximate weight in kilograms
              </p>
              <p>
                3. Submit your cleanup to earn points
              </p>
              <p className="text-muted-foreground text-xs">
                Your location is automatically recorded. Points are awarded based on the weight of trash collected.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      
      {/* Success dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cleanup Recorded!</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <p className="text-center">
                Thank you for your contribution! Your cleanup has been recorded.
              </p>
              {parseFloat(trashWeight) > 0 && (
                <p className="text-center font-bold">
                  You earned {Math.round(parseFloat(trashWeight) * 10)} points!
                </p>
              )}
              <Button className="w-full" onClick={handleSuccessClose}>
                Back to Home
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CleanupCamera;
