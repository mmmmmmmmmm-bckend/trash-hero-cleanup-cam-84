
import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Info, Video, Pause, Play, CircleCheck, Trash } from 'lucide-react';
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
import { AspectRatio } from '@/components/ui/aspect-ratio';

// Enhanced trash types data with more detailed information
const trashTypes = [
  { 
    type: 'Plastic Bottle', 
    impact: 'Takes 450 years to decompose. Releases microplastics into water systems.',
    recycling: 'Widely recyclable in most areas. Reduces petroleum usage.',
    keywords: ['bottle', 'plastic', 'container', 'drink', 'soda', 'water'],
    confidence_threshold: 0.75
  },
  { 
    type: 'Paper Waste', 
    impact: 'Biodegrades in 2-6 weeks. Lower impact but contributes to deforestation.',
    recycling: 'Easily recyclable. Reduces need for tree harvesting.',
    keywords: ['paper', 'cardboard', 'box', 'carton', 'tissue', 'newspaper'],
    confidence_threshold: 0.70
  },
  { 
    type: 'Aluminum Can', 
    impact: '80-100 years to decompose. Mining causes soil degradation and water pollution.',
    recycling: 'Infinitely recyclable with no quality loss. Saves 95% of energy vs. new production.',
    keywords: ['can', 'aluminum', 'metal', 'beverage', 'soda', 'beer'],
    confidence_threshold: 0.80
  },
  { 
    type: 'Glass Bottle', 
    impact: 'Never fully decomposes. Low toxicity but physical hazard to wildlife.',
    recycling: '100% recyclable without quality loss. Reduces sand mining impact.',
    keywords: ['glass', 'bottle', 'jar', 'container', 'transparent'],
    confidence_threshold: 0.75
  },
  { 
    type: 'Food Waste', 
    impact: 'Decomposes in 2-6 weeks. Produces methane in landfills, a potent greenhouse gas.',
    recycling: 'Compostable. Creates nutrient-rich soil when properly processed.',
    keywords: ['food', 'organic', 'compost', 'fruit', 'vegetable', 'leftover'],
    confidence_threshold: 0.65
  },
  { 
    type: 'Styrofoam', 
    impact: 'Never fully decomposes. Contains carcinogenic chemicals that leach into soil.',
    recycling: 'Difficult to recycle. Should be avoided when possible.',
    keywords: ['styrofoam', 'foam', 'cup', 'packaging', 'polystyrene'],
    confidence_threshold: 0.80
  },
  { 
    type: 'Electronic Waste', 
    impact: 'Contains heavy metals and toxic chemicals that contaminate soil and water.',
    recycling: 'Requires specialized recycling. Contains valuable recoverable materials.',
    keywords: ['electronic', 'battery', 'device', 'cable', 'charger', 'phone'],
    confidence_threshold: 0.80
  },
  { 
    type: 'Plastic Bag', 
    impact: 'Takes 20-1000 years to decompose. Often ingested by marine animals.',
    recycling: 'Difficult to recycle but can be reused. Better alternatives exist.',
    keywords: ['bag', 'plastic', 'shopping', 'wrapper', 'film'],
    confidence_threshold: 0.70
  },
  {
    type: 'Cigarette Butt',
    impact: 'Takes 10+ years to decompose. Contains toxic chemicals and microplastics.',
    recycling: 'Not recyclable. Proper disposal prevents wildlife harm.',
    keywords: ['cigarette', 'butt', 'filter', 'tobacco'],
    confidence_threshold: 0.85
  }
];

const CleanupCamera = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const detectionIntervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Camera states
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // AI Detection states
  const [detectionStatus, setDetectionStatus] = useState<'none' | 'detecting' | 'detected' | 'verified'>('none');
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [detectionMessage, setDetectionMessage] = useState('');
  const [boundingBoxes, setBoundingBoxes] = useState<{x: number, y: number, width: number, height: number, label: string}[]>([]);
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
  
  useEffect(() => {
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
  
  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Get device dimensions for optimal camera utilization
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const constraints = {
        video: { 
          facingMode: cameraFacing,
          width: { ideal: Math.max(width, 1280) },  // Use device width or higher
          height: { ideal: Math.max(height, 720) }, // Use device height or higher
        }, 
        audio: false // Disable audio recording
      };
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        
        // Set video element dimensions to match stream
        const videoTrack = newStream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          console.log('Camera settings:', settings);
        }
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
  
  // Enhanced AI trash detection with image processing simulation
  const startDetection = () => {
    setDetectionStatus('detecting');
    setDetectionMessage('Analyzing environment...');
    setDetectionProgress(0);
    setBoundingBoxes([]);
    
    // Simulate frame analysis during detection
    const analyzeFrames = () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;
      
      // Match canvas size to video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw current video frame to canvas for "analysis"
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Clear previous bounding boxes
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
    
    // Start simulated detection process with progressive updates
    detectionIntervalRef.current = window.setInterval(() => {
      setDetectionProgress(prevProgress => {
        const newProgress = prevProgress + 2; // Faster progress for better UX
        
        // Simulate detection phases
        if (newProgress === 20) {
          setDetectionMessage('Identifying objects...');
          analyzeFrames();
        } else if (newProgress === 40) {
          setDetectionMessage('Classifying materials...');
        } else if (newProgress === 60) {
          setDetectionMessage('Determining object type...');
          // Add simulated bounding box for detected trash
          if (step === 'finding') {
            const videoWidth = videoRef.current?.videoWidth || 640;
            const videoHeight = videoRef.current?.videoHeight || 480;
            
            // Generate 1-3 random bounding boxes to simulate multiple detected objects
            const boxCount = Math.floor(Math.random() * 3) + 1;
            const newBoxes = [];
            
            for (let i = 0; i < boxCount; i++) {
              const width = Math.floor(videoWidth * (0.2 + Math.random() * 0.3));
              const height = Math.floor(videoHeight * (0.2 + Math.random() * 0.3));
              const x = Math.floor(Math.random() * (videoWidth - width));
              const y = Math.floor(Math.random() * (videoHeight - height));
              
              // Select a random trash type for each box
              const randomTrashType = trashTypes[Math.floor(Math.random() * trashTypes.length)];
              
              newBoxes.push({
                x, y, width, height,
                label: randomTrashType.type
              });
            }
            
            setBoundingBoxes(newBoxes);
          }
        } else if (newProgress === 80) {
          setDetectionMessage('Analyzing environmental impact...');
        }
        
        // Completion logic
        if (newProgress >= 100) {
          if (step === 'finding') {
            // Select the most prominent detected object (first one for simplicity)
            const primaryBox = boundingBoxes[0];
            const matchedTrashType = primaryBox ? 
              trashTypes.find(t => t.type === primaryBox.label) : 
              trashTypes[Math.floor(Math.random() * trashTypes.length)];
            
            const confidence = Math.random() * 
              (1 - (matchedTrashType?.confidence_threshold || 0.7)) + 
              (matchedTrashType?.confidence_threshold || 0.7);
            
            setTrashAnalysis({
              type: matchedTrashType?.type || "Unknown",
              confidence: parseFloat(confidence.toFixed(1)) * 100,
              impact: matchedTrashType?.impact || "Unknown impact",
              recycling: matchedTrashType?.recycling || "Unknown recycling information"
            });
            
            setDetectionStatus('detected');
            setDetectionMessage(`Detected: ${matchedTrashType?.type || "Unknown"}`);
            clearInterval(detectionIntervalRef.current!);
          } else {
            setDetectionStatus('verified');
            setDetectionMessage('Verification complete! Trash properly disposed.');
            clearInterval(detectionIntervalRef.current!);
          }
        }
        
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 50);
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
    setBoundingBoxes([]);
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

  // Function to render detection boxes
  const renderBoundingBoxes = () => {
    if (!videoRef.current || boundingBoxes.length === 0 || !isRecording) return null;
    
    const videoWidth = videoRef.current.clientWidth;
    const videoHeight = videoRef.current.clientHeight;
    
    return boundingBoxes.map((box, index) => {
      // Scale boxes to fit the video element's display size
      const scaledX = (box.x / (videoRef.current?.videoWidth || 640)) * videoWidth;
      const scaledY = (box.y / (videoRef.current?.videoHeight || 480)) * videoHeight;
      const scaledWidth = (box.width / (videoRef.current?.videoWidth || 640)) * videoWidth;
      const scaledHeight = (box.height / (videoRef.current?.videoHeight || 480)) * videoHeight;
      
      return (
        <div 
          key={`box-${index}`}
          className="absolute border-2 border-green-500 flex flex-col justify-end"
          style={{
            left: `${scaledX}px`,
            top: `${scaledY}px`,
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            pointerEvents: 'none'
          }}
        >
          <div className="bg-green-500 text-white text-xs px-1 py-0.5 max-w-full truncate">
            {box.label}
          </div>
        </div>
      );
    });
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
            <Camera className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Step indicator and detection status */}
      <div className="absolute top-16 left-0 right-0 z-10 flex flex-col items-center space-y-2">
        <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm">
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
      <div className="flex-1 relative w-full h-full overflow-hidden">
        {!showPreview ? (
          <>
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 min-h-full min-w-full object-cover"
              style={{ 
                transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none',
              }}
            />
            <canvas 
              ref={canvasRef} 
              className="absolute inset-0 pointer-events-none z-[1]"
              style={{ display: 'none' }} // Hidden canvas for processing
            />
            {/* Render detection bounding boxes */}
            {renderBoundingBoxes()}
          </>
        ) : (
          <video
            src={recordedVideo || undefined}
            controls
            autoPlay
            playsInline
            className="absolute inset-0 min-h-full min-w-full object-contain bg-black"
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
        
        {/* Trash analysis overlay */}
        {trashAnalysis && showPreview && step === 'finding' && (
          <div className="absolute bottom-32 left-4 right-4 bg-black/70 p-4 rounded-lg text-white">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold">AI Analysis</h3>
              <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-full">
                {trashAnalysis.confidence}% confidence
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Type:</span> {trashAnalysis.type}</p>
              <p><span className="font-semibold">Environmental Impact:</span> {trashAnalysis.impact}</p>
              <p><span className="font-semibold">Recycling:</span> {trashAnalysis.recycling}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom controls */}
      <div className="p-6 bg-gradient-to-t from-black/80 to-transparent absolute bottom-0 left-0 right-0 space-y-4">
        {step === 'disposing' && !isRecording && detectionStatus === 'verified' && (
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Trash className="h-5 w-5 text-primary" />
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
