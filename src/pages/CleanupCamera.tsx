import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, X, ArrowRight, ArrowLeft, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '../components/NavBar';
import Header from '../components/Header';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

// Trash type definitions with their point values
const TRASH_TYPES = {
  "Plastic bottle": { points: 15, recyclingTime: "450 years", impact: "High" },
  "Food wrapper": { points: 10, recyclingTime: "20-30 years", impact: "Medium" },
  "Paper waste": { points: 5, recyclingTime: "2-6 weeks", impact: "Low" },
  "Metal can": { points: 20, recyclingTime: "50-100 years", impact: "Medium" },
  "Glass bottle": { points: 25, recyclingTime: "1 million+ years", impact: "Medium" },
  "Cardboard": { points: 10, recyclingTime: "2 months", impact: "Low" }
};

const CleanupCamera = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  
  const [step, setStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [videoData, setVideoData] = useState<string[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [isCameraReady, setCameraReady] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [trashClassification, setTrashClassification] = useState<string | null>(null);
  const [detections, setDetections] = useState<Array<{
    type: string;
    confidence: number;
    box: {x: number, y: number, width: number, height: number};
  }>>([]);
  const [earnedPoints, setEarnedPoints] = useState(0);
  
  const steps = [
    { title: "Show the trash", description: "First, show us the trash you've found" },
    { title: "Pick it up", description: "Now pick up the trash" },
    { title: "Proper disposal", description: "Finally, show putting it in a bin" }
  ];

  // Handle tap to toggle UI visibility
  const toggleUI = () => {
    setShowUI(!showUI);
  };

  // Start the camera on component mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      stopObjectDetection();
    };
  }, []);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        stopCamera(); // Stop any existing streams first
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false // Don't request audio permission until recording starts
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  // Object detection simulation
  const startObjectDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    const detectObjects = () => {
      if (!canvasRef.current || !videoRef.current || !streamRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the current video frame onto the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Simulate AI detection with random boxes
      // In a real app, this would use TensorFlow.js or another ML library
      if (Math.random() > 0.3) { // 70% chance to detect something
        const trashTypes = Object.keys(TRASH_TYPES);
        const randomTypeIndex = Math.floor(Math.random() * trashTypes.length);
        const randomType = trashTypes[randomTypeIndex];
        const randomConfidence = 75 + Math.floor(Math.random() * 20); // 75% to 95%
        
        // Random position and size for detection box
        const x = Math.floor(Math.random() * (canvas.width - 100));
        const y = Math.floor(Math.random() * (canvas.height - 100));
        const width = 50 + Math.floor(Math.random() * 100);
        const height = 50 + Math.floor(Math.random() * 100);
        
        // Draw detection box and label
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, width, height);
        
        // Background for label
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y - 20, 120, 20);
        
        // Label text
        ctx.font = '12px Arial';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(`${randomType} ${randomConfidence}%`, x + 5, y - 5);
        
        // Add to detections array for use in UI
        setDetections([{
          type: randomType,
          confidence: randomConfidence,
          box: {x, y, width, height}
        }]);
        
        // Update the current AI prediction for the UI
        setAiPrediction(randomType);
        setAiConfidence(randomConfidence);
        
        // Set classification data for environmental impact
        setTrashClassification(JSON.stringify(TRASH_TYPES[randomType]));
      }
    };
    
    // Run detection every 500ms
    detectionIntervalRef.current = setInterval(detectObjects, 500) as unknown as number;
  };

  const stopObjectDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) {
      await startCamera();
    }
    
    if (streamRef.current) {
      setIsRecording(true);
      // Keep UI visible during recording - FIX for BUG #2
      // setShowUI(false); // OLD behavior that caused the bug
      
      // Start object detection
      startObjectDetection();
      
      // If we need audio for recording, request it now
      let recordingStream: MediaStream;
      
      try {
        // Add audio track only for recording
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const videoTracks = streamRef.current.getVideoTracks();
        const audioTracks = audioStream.getAudioTracks();
        
        recordingStream = new MediaStream([...videoTracks, ...audioTracks]);
      } catch (err) {
        // Fall back to video-only if audio permission is denied
        console.warn("Could not get audio permission, recording without audio", err);
        recordingStream = streamRef.current;
      }

      const recorder = new MediaRecorder(recordingStream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const videoUrl = URL.createObjectURL(blob);
        setVideoData(prev => [...prev, videoUrl]);
        
        // Stop audio tracks if they were added just for recording
        if (recordingStream !== streamRef.current) {
          recordingStream.getAudioTracks().forEach(track => track.stop());
        }
        
        // Analyze the video frame (simulated AI detection)
        simulateAIAnalysis();
      };

      mediaRecorderRef.current = recorder;
      recorder.start();

      // Start the timer
      const interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
      
      setTimerInterval(interval);

      // Auto-stop recording after 10 seconds
      setTimeout(() => {
        if (recorder.state === "recording") {
          stopRecording();
        }
      }, 10000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop object detection when recording stops
      stopObjectDetection();
      
      // Clear the timer
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      setRecordingTime(0);
    }
  };

  const togglePause = () => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  // Simulate AI trash detection and analysis
  const simulateAIAnalysis = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      // Simulate AI detection results based on step
      const trashTypes = Object.keys(TRASH_TYPES);
      const randomTypeIndex = Math.floor(Math.random() * trashTypes.length);
      const randomType = trashTypes[randomTypeIndex];
      const randomConfidence = 75 + Math.floor(Math.random() * 20); // 75% to 95%
      
      setAiPrediction(randomType);
      setAiConfidence(randomConfidence);
      
      // Calculate points based on trash type
      const pointsEarned = TRASH_TYPES[randomType].points;
      setEarnedPoints(prev => prev + pointsEarned);
      
      // Classify trash type for environmental impact data
      setTrashClassification(JSON.stringify(TRASH_TYPES[randomType]));
      setIsAnalyzing(false);
      
      toast({
        title: "AI Analysis Complete",
        description: `Detected: ${randomType} (${randomConfidence}% confidence) +${pointsEarned} points!`,
      });
    }, 2000); // Simulate 2-second AI processing time
  };

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Submit all video data
      submitCleanup();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
      // Remove the last recorded video
      setVideoData(videoData.slice(0, -1));
      // Reset earned points proportionally
      setEarnedPoints(Math.floor(earnedPoints * (step - 1) / step));
      // Reset AI prediction for this step
      setAiPrediction(null);
      setAiConfidence(null);
      setTrashClassification(null);
    } else {
      navigate('/');
    }
  };

  const submitCleanup = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to submit a cleanup.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }
    
    try {
      // Upload video/evidence data would go here in a real implementation
      // For now, just add a cleanup record with points based on trash type
      const { data, error } = await supabase
        .from('cleanups')
        .insert([
          { 
            user_id: user.id,
            location: 'Custom location', 
            points: earnedPoints, // Use earned points based on trash type
            verified: false,
            trash_weight_kg: 0.5 // Estimated weight
          }
        ]);
      
      if (error) throw error;
      
      // Update user points
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('id', user.id)
        .single();
      
      if (!profileError && profileData) {
        const currentPoints = profileData.total_points || 0;
        await supabase
          .from('profiles')
          .update({ total_points: currentPoints + earnedPoints })
          .eq('id', user.id);
      }
      
      toast({
        title: "Cleanup Submitted",
        description: `Your cleanup has been submitted. You earned ${earnedPoints} points!`,
      });
    } catch (error: any) {
      console.error("Error submitting cleanup:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your cleanup.",
        variant: "destructive",
      });
    }
    
    // Navigate back to home
    navigate('/', { state: { justSubmitted: true } });
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="min-h-screen bg-black pb-16">
      <Header title="Record Cleanup" showBack={true} />
      
      <div className="relative h-[calc(100vh-132px)]">
        {/* Camera view - tap to toggle UI */}
        <div 
          className="relative h-full"
          onClick={toggleUI}
        >
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover"
          />
          
          {/* Canvas for object detection */}
          <canvas 
            ref={canvasRef} 
            className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
          />
          
          {!isCameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center text-white">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Setting up camera...</p>
              </div>
            </div>
          )}
          
          {showUI && (
            <>
              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-white text-sm font-medium">{formatTime(recordingTime)}</span>
                </div>
              )}
              
              {/* Points indicator */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
                <span className="text-white text-sm font-medium">Step {step + 1}/{steps.length}</span>
                {earnedPoints > 0 && (
                  <span className="text-white text-sm font-medium ml-2">Points: {earnedPoints}</span>
                )}
              </div>
              
              {/* Instructions */}
              <div className="absolute bottom-32 left-0 right-0 px-4">
                <div className="bg-black/60 backdrop-blur-sm text-white p-4 rounded-xl max-w-md mx-auto">
                  <h3 className="text-xl font-bold mb-1">{steps[step].title}</h3>
                  <p>{steps[step].description}</p>
                </div>
              </div>
              
              {/* AI Analysis Results */}
              {aiPrediction && !isAnalyzing && !isRecording && (
                <div className="absolute top-16 right-4 max-w-[150px] bg-black/70 backdrop-blur-sm rounded-lg p-2 text-white text-xs">
                  <h4 className="font-bold mb-1">AI Detection</h4>
                  <p className="mb-1">Item: {aiPrediction}</p>
                  <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${aiConfidence}%` }}
                    ></div>
                  </div>
                  <p className="mt-1">{aiConfidence}% confidence</p>
                  {trashClassification && (
                    <p className="mt-1">Points: +{JSON.parse(trashClassification).points}</p>
                  )}
                </div>
              )}
              
              {isAnalyzing && (
                <div className="absolute top-16 right-4 max-w-[150px] bg-black/70 backdrop-blur-sm rounded-lg p-2 text-white text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>AI analyzing...</span>
                  </div>
                </div>
              )}
              
              {/* Preview of recorded video */}
              {videoData[step] && !isRecording && (
                <div className="absolute bottom-28 right-4 w-24 h-32 rounded-lg overflow-hidden border-2 border-white">
                  <video 
                    src={videoData[step]} 
                    className="w-full h-full object-cover" 
                    autoPlay 
                    loop 
                    muted
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePause();
                    }}
                    className="absolute bottom-1 right-1 bg-black/50 rounded-full p-1"
                  >
                    {isPaused ? <Play className="w-4 h-4 text-white" /> : <Pause className="w-4 h-4 text-white" />}
                  </button>
                </div>
              )}
              
              {/* Trash info sheet/drawer (uses Sheet on desktop, Drawer on mobile) */}
              {trashClassification && !isRecording && (
                <div className="absolute bottom-32 left-4">
                  <Sheet>
                    <SheetTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium"
                      >
                        View Environmental Impact
                      </button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Environmental Impact</SheetTitle>
                        <SheetDescription>
                          AI-detected trash analysis
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-4">
                        <h3 className="font-bold mb-2">Detected: {aiPrediction}</h3>
                        {trashClassification && (
                          <div className="space-y-2">
                            {Object.entries(JSON.parse(trashClassification)).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}: </span>
                                <span>{value as string}</span>
                              </div>
                            ))}
                            <p className="pt-4 text-sm text-gray-500">
                              By removing this trash, you're helping prevent pollution and protecting wildlife.
                            </p>
                          </div>
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              )}
              
              {/* Controls */}
              <div className="absolute bottom-16 left-0 right-0 px-4">
                <div className="flex justify-center items-center gap-4">
                  {!isRecording ? (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        startRecording();
                      }}
                      className="bg-red-500 text-white p-4 rounded-full"
                      disabled={!isCameraReady}
                    >
                      <Video className="w-8 h-8" />
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        stopRecording();
                      }}
                      className="bg-red-500 text-white p-4 rounded-full animate-pulse"
                    >
                      <X className="w-8 h-8" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Navigation */}
              <div className="absolute bottom-4 left-0 right-0 px-4">
                <div className="flex justify-between">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      prevStep();
                    }}
                    className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  
                  {videoData[step] && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        nextStep();
                      }}
                      className="bg-primary text-white px-4 py-2 rounded-full flex items-center gap-1"
                    >
                      {step === steps.length - 1 ? 'Submit' : 'Next'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Only show NavBar when not recording AND when UI is shown */}
      {!isRecording && showUI && <NavBar />}
    </div>
  );
};

export default CleanupCamera;
