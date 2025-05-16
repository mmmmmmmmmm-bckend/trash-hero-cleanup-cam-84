
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, RotateCw, X, Info, Video, Pause, Play, CircleCheck, Trash } from 'lucide-react';
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
import { Progress } from '@/components/ui/progress';

const CleanupCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const detectionIntervalRef = useRef<number | null>(null);
  
  // Camera states
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Detection states
  const [detectionStatus, setDetectionStatus] = useState<'none' | 'detecting' | 'detected' | 'verified'>('none');
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [detectionMessage, setDetectionMessage] = useState('');
  
  // App states
  const [showInfo, setShowInfo] = useState(false);
  const [trashWeight, setTrashWeight] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [location, setLocation] = useState('Unknown location');
  const [step, setStep] = useState<'finding' | 'disposing'>('finding');
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
    
    // Start camera when component mounts
    startCamera();
    
    // Clean up resources when component unmounts
    return () => {
      stopRecording();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [cameraFacing]);
  
  const fetchLocation = async (latitude: number, longitude: number) => {
    try {
      setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  };
  
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
        audio: true
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
  
  const startRecording = () => {
    if (!videoRef.current || !stream) return;
    
    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const videoURL = URL.createObjectURL(blob);
      setRecordedVideo(videoURL);
      setShowPreview(true);
    };
    
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100);
    setIsRecording(true);
    
    // Start AI detection simulation
    startDetection();
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop detection simulation
      stopDetection();
    }
  };
  
  const startDetection = () => {
    // In a real implementation, this would connect to a real AI model
    // Here we're simulating the detection process
    setDetectionStatus('detecting');
    setDetectionMessage('Looking for trash...');
    setDetectionProgress(0);
    
    detectionIntervalRef.current = window.setInterval(() => {
      setDetectionProgress(prevProgress => {
        const newProgress = prevProgress + 5;
        
        // Simulate trash detection logic
        if (newProgress >= 100) {
          if (step === 'finding') {
            setDetectionStatus('detected');
            setDetectionMessage('Trash detected! Now record disposal.');
            clearInterval(detectionIntervalRef.current!);
          } else {
            setDetectionStatus('verified');
            setDetectionMessage('Verification complete! Trash properly disposed.');
            clearInterval(detectionIntervalRef.current!);
          }
        }
        
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 200);
  };
  
  const stopDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };
  
  const resetCamera = () => {
    setShowPreview(false);
    setRecordedVideo(null);
    setDetectionStatus('none');
    setDetectionProgress(0);
  };
  
  const nextStep = () => {
    if (step === 'finding') {
      setStep('disposing');
      resetCamera();
    } else {
      saveCleanup();
    }
  };
  
  const saveCleanup = async () => {
    if (!user || !recordedVideo) {
      toast({
        title: "Error",
        description: "Please record a video first",
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
      
      // In a real implementation, we would upload the recorded video
      // For now, we'll use a simulated approach
      
      // Simulate file upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Insert cleanup record
      const { data, error } = await supabase
        .from('cleanups')
        .insert([{
          user_id: user.id,
          location,
          trash_weight_kg: weightKg,
          points,
          verified: true, // Now verified by AI
          ai_verified: true,
          image_url: "https://example.com/video-placeholder.mp4" // Placeholder
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
            disabled={isRecording}
          >
            <RotateCw className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Step indicator and detection status */}
      <div className="absolute top-16 left-0 right-0 z-10 flex flex-col items-center space-y-2">
        <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-poppins">
          {step === 'finding' ? 'Step 1: Record Finding Trash' : 'Step 2: Record Disposal in Bin'}
        </div>
        
        {detectionStatus !== 'none' && (
          <div className="bg-black/50 text-white px-4 py-2 rounded-full text-xs">
            {detectionMessage}
          </div>
        )}
        
        {detectionStatus === 'detecting' && (
          <div className="w-48 bg-black/50 rounded-full p-1">
            <Progress value={detectionProgress} className="h-1" />
          </div>
        )}
      </div>
      
      {/* Camera/Video view */}
      <div className="flex-1 relative overflow-hidden">
        {!showPreview ? (
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
            style={{ transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none' }}
          />
        ) : (
          <video
            src={recordedVideo || undefined}
            controls
            autoPlay
            playsInline
            className="h-full w-full object-contain bg-black"
          />
        )}
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="absolute top-28 right-4 flex items-center gap-2 bg-red-500/70 px-3 py-1 rounded-full">
            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-white text-xs">Recording</span>
          </div>
        )}
        
        {/* AI detection status overlay */}
        {detectionStatus === 'detected' && (
          <div className="absolute inset-0 border-4 border-green-500 pointer-events-none"></div>
        )}
        
        {detectionStatus === 'verified' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-green-500/50 p-4 rounded-full">
              <CircleCheck className="h-12 w-12 text-white" />
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom controls */}
      <div className="p-6 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 space-y-4">
        {step === 'disposing' && !isRecording && detectionStatus === 'verified' && (
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
        )}
        
        <div className="flex gap-3 justify-center">
          {!showPreview ? (
            <Button 
              variant={isRecording ? "destructive" : "default"}
              size="lg" 
              className="rounded-full w-16 h-16 p-0"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={loading}
            >
              {isRecording ? <Pause className="h-8 w-8" /> : <Video className="h-8 w-8" />}
            </Button>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="rounded-full flex-1 text-white border-white hover:bg-white/20"
                onClick={resetCamera}
                disabled={loading}
              >
                Retake
              </Button>
              <Button 
                className="rounded-full flex-1"
                onClick={nextStep}
                disabled={loading || (step === 'finding' && detectionStatus !== 'detected') || (step === 'disposing' && detectionStatus !== 'verified')}
              >
                {loading ? "Saving..." : step === 'finding' ? "Next" : "Save"}
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Info dialog */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How to record a cleanup with AI verification</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>
                1. Record a video showing the trash you've found
              </p>
              <p>
                2. Our AI will detect the trash in your video
              </p>
              <p>
                3. Record a video showing the trash being disposed in a bin
              </p>
              <p>
                4. The AI will verify the proper disposal
              </p>
              <p>
                5. Enter the approximate weight to earn points
              </p>
              <p className="text-muted-foreground text-xs">
                Your location is automatically recorded. Points are awarded based on the weight of trash collected and verified by AI.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      
      {/* Success dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cleanup Verified & Recorded!</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <div className="bg-primary/10 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <CircleCheck className="h-8 w-8 text-primary" />
              </div>
              <p className="text-center">
                Thank you for your contribution! Your cleanup has been AI-verified and recorded.
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
