
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Pause, Play, CircleCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CameraView from '@/components/cleanup/CameraView';
import TrashDetection from '@/components/cleanup/TrashDetection';
import VideoPreview from '@/components/cleanup/VideoPreview';
import WeightInput from '@/components/cleanup/WeightInput';

const CleanupCamera = () => {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  // Camera states
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // AI Detection states
  const [detectionStatus, setDetectionStatus] = useState<'none' | 'detecting' | 'detected' | 'verified'>('none');
  const [trashAnalysis, setTrashAnalysis] = useState<{
    type: string;
    confidence: number;
    impact: string;
    recycling: string;
  } | null>(null);
  
  // App states
  const [showInfo, setShowInfo] = useState(false);
  const [trashWeight, setTrashWeight] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [step, setStep] = useState<'finding' | 'disposing'>('finding');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  useEffect(() => {
    // Start camera when component mounts
    startCamera();
    
    // Clean up resources when component unmounts
    return () => {
      cleanupResources();
    };
  }, [cameraFacing]);
  
  const startCamera = async () => {
    try {
      console.log('Starting camera...');
      setCameraError(null);
      
      // Stop any existing stream
      if (stream) {
        cleanupMediaStream();
      }
      
      // Get device dimensions for optimal camera utilization
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const constraints = {
        video: { 
          facingMode: cameraFacing,
          width: { ideal: Math.max(width, 1280) },
          height: { ideal: Math.max(height, 720) },
        }, 
        audio: false // Disable audio recording
      };
      
      console.log('Starting camera with constraints:', constraints);
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        console.log('Camera started successfully');
        
        // Log camera tracks and settings
        const videoTrack = newStream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          console.log('Camera settings:', settings);
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Could not access the camera. Please check permissions.');
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
    if (!videoRef.current || !stream) {
      console.error('Video reference or stream is not available');
      toast({
        title: "Recording Error",
        description: "Could not start recording. Camera not ready.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Starting recording...');
    recordedChunksRef.current = [];
    
    try {
      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        throw new Error("MediaRecorder API is not supported in this browser");
      }
      
      // Check for active video tracks
      const videoTracks = stream.getVideoTracks();
      if (!videoTracks || videoTracks.length === 0 || !videoTracks[0].enabled) {
        throw new Error("No active video stream available");
      }
      
      // Try with default options first
      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream);
      } catch (e) {
        // Fallback to common codecs if default fails
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp8'
        });
      }
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log('Recording stopped, processing video...');
        if (recordedChunksRef.current.length > 0) {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const videoURL = URL.createObjectURL(blob);
          setRecordedVideo(videoURL);
          
          // If this is the first recording (finding trash), automatically move to the next step
          // instead of showing the preview
          if (step === 'finding' && detectionStatus === 'detected') {
            console.log('Trash detected, automatically moving to disposal step');
            setStep('disposing');
            setShowPreview(false);
            setDetectionStatus('none');
            
            // Show toast notification about successful detection
            toast({
              title: "Trash Detected",
              description: trashAnalysis ? `${trashAnalysis.type} detected. Now record disposal.` : "Trash detected. Now record disposal.",
            });
            
            // Brief delay before starting the next recording
            setTimeout(() => {
              resetCamera();
            }, 300);
          } else {
            // For the second step (disposal) we show the preview for weight input
            setShowPreview(true);
          }
        } else {
          console.error('No recorded data available');
          toast({
            title: "Recording Error",
            description: "No data was recorded. Please try again.",
            variant: "destructive"
          });
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast({
          title: "Recording Error",
          description: "An error occurred during recording.",
          variant: "destructive"
        });
        setIsRecording(false);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      setIsRecording(true);
      
      // Start AI detection simulation
      setDetectionStatus('detecting');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: error instanceof Error ? error.message : "Could not start recording. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log('Stopping recording...');
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
      setIsRecording(false);
    }
  };
  
  const resetCamera = () => {
    console.log('Resetting camera view...');
    setShowPreview(false);
    setRecordedVideo(null);
    setDetectionStatus('none');
    
    // Ensure camera is still active
    if (!stream || stream.getVideoTracks().length === 0 || !stream.getVideoTracks()[0].enabled) {
      console.log('Camera stream needs to be restarted');
      startCamera();
    } else {
      console.log('Camera stream is still active');
      
      // Make sure video element is properly connected to stream
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }
  };

  // Clean up media stream
  const cleanupMediaStream = () => {
    if (stream) {
      console.log('Stopping all media tracks...');
      stream.getTracks().forEach(track => {
        console.log(`Stopping track: ${track.kind}`);
        track.stop();
      });
    }
  };
  
  // Clean up all resources
  const cleanupResources = () => {
    console.log('Cleaning up all camera resources...');
    stopRecording();
    cleanupMediaStream();
    setStream(null);
    
    // Clear any object URLs to prevent memory leaks
    if (recordedVideo) {
      URL.revokeObjectURL(recordedVideo);
      setRecordedVideo(null);
    }
  };
  
  const handleDetectionComplete = (type: string, impact: string, recycling: string, confidence: number) => {
    console.log('Detection complete:', { type, confidence });
    setTrashAnalysis({
      type,
      confidence,
      impact,
      recycling
    });
    setDetectionStatus('detected');
    
    // Automatically stop recording after detection is complete
    if (isRecording) {
      stopRecording();
    }
  };
  
  const nextStep = () => {
    if (step === 'finding') {
      console.log('Moving to disposal step');
      setStep('disposing');
      resetCamera();
    } else {
      saveCleanup();
    }
  };
  
  const saveCleanup = async () => {
    if (!user || !trashAnalysis) {
      toast({
        title: "Error",
        description: "Missing user information or trash analysis",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Convert weight to number
      const weightKg = parseFloat(trashWeight || "0.1");
      if (isNaN(weightKg)) {
        throw new Error("Please enter a valid weight");
      }
      
      // Calculate points (10 points per kg)
      const points = Math.round(weightKg * 10);
      
      console.log('Saving cleanup data:', {
        user_id: user.id,
        trash_type: trashAnalysis.type,
        weight: weightKg,
        points
      });
      
      // Create cleanup record matching the database schema
      const { data, error } = await supabase
        .from('cleanups')
        .insert({
          user_id: user.id,
          location: trashAnalysis.type || 'Unknown trash', // Use trash type as location identifier
          trash_weight_kg: weightKg,
          points: points,
          verified: true
        });
      
      if (error) {
        throw error;
      }
      
      // Update user's total points
      await supabase.rpc('increment_user_points', {
        user_id: user.id,
        points_to_add: points
      });
      
      console.log('Cleanup saved successfully');
      
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

  const handleNavigateBack = () => {
    // Clean up all resources when navigating away
    cleanupResources();
  };

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Camera error display */}
      {cameraError && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black p-4">
          <div className="bg-red-500/20 rounded-lg p-4 max-w-md text-center">
            <p className="text-white mb-4">{cameraError}</p>
            <Button 
              variant="outline" 
              className="text-white border-white"
              onClick={() => startCamera()}
            >
              Retry Camera Access
            </Button>
          </div>
        </div>
      )}

      {/* Step indicator */}
      <div className="absolute top-16 left-0 right-0 z-10 flex justify-center">
        <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm">
          {step === 'finding' ? 'Step 1: Record Finding Trash' : 'Step 2: Record Disposal in Bin'}
        </div>
      </div>
      
      {!showPreview ? (
        <>
          <CameraView
            videoRef={videoRef}
            stream={stream}
            cameraFacing={cameraFacing}
            isRecording={isRecording}
            onSwitchCamera={switchCamera}
            onShowInfo={() => setShowInfo(true)}
            onNavigateBack={handleNavigateBack}
          >
            <TrashDetection
              videoRef={videoRef}
              isRecording={isRecording}
              detectionStatus={detectionStatus}
              step={step}
              onDetectionComplete={handleDetectionComplete}
            />
          </CameraView>
          
          {/* Recording controls */}
          <div className="p-6 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0">
            <div className="flex justify-center">
              <Button 
                variant={isRecording ? "destructive" : "default"}
                size="lg" 
                className="rounded-full w-16 h-16 p-0"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading || !stream}
              >
                {isRecording ? <Pause className="h-8 w-8" /> : <Video className="h-8 w-8" />}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <VideoPreview
            videoUrl={recordedVideo}
            trashAnalysis={trashAnalysis}
            step={step}
            detectionStatus={detectionStatus}
            onRetake={resetCamera}
            onNext={nextStep}
            loading={loading}
          />
          
          {/* Weight input for second step */}
          {step === 'disposing' && detectionStatus === 'verified' && (
            <WeightInput 
              value={trashWeight} 
              onChange={setTrashWeight}
            />
          )}
        </>
      )}
      
      {/* Info dialog */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Trash Detection</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>
                1. Record a video showing the trash you've found
              </p>
              <p>
                2. Our AI will detect the trash type and environmental impact
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
                Points are awarded based on the weight of trash collected and verified by AI.
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
              {trashAnalysis && (
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p><span className="font-semibold">Trash Type:</span> {trashAnalysis.type}</p>
                </div>
              )}
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
