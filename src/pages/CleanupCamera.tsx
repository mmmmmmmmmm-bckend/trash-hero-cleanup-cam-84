
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import NavBar from '@/components/NavBar';
import CameraView from '@/components/camera/CameraView';
import CameraControls from '@/components/camera/CameraControls';
import TrashAnalysisModal from '@/components/camera/TrashAnalysisModal';
import { startCamera, stopCamera } from '@/utils/cameraUtils';
import { startRecording, stopRecording } from '@/utils/recordingUtils';
import { analyzeTrashImage } from '@/services/TrashAnalysisService';
import type { TrashAnalysisData } from '@/components/camera/TrashAnalysisModal';

const CleanupCamera = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  
  const [step, setStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [videoData, setVideoData] = useState<string[]>([]);
  const [videoBlobs, setVideoBlobs] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [isCameraReady, setCameraReady] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [analysisData, setAnalysisData] = useState<TrashAnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const steps = [
    { title: "Show the trash", description: "First, show us the trash you've found" },
    { title: "Pick it up", description: "Now pick up the trash" },
    { title: "Proper disposal", description: "Finally, show putting it in a bin" }
  ];

  // Start the camera on component mount
  useEffect(() => {
    initializeCamera();
    return () => {
      cleanupResources();
    };
  }, []);

  const initializeCamera = async () => {
    const stream = await startCamera(videoRef, setCameraReady);
    if (stream) {
      streamRef.current = stream;
    } else {
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const cleanupResources = () => {
    stopCamera(streamRef.current);
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  };

  const handleStartRecording = async () => {
    if (!streamRef.current) {
      await initializeCamera();
    }
    
    const startTimer = () => {
      const interval = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
      setTimerInterval(interval);
    };
    
    const { recorder, recordingStream } = await startRecording(
      streamRef.current, 
      startTimer, 
      setIsRecording
    );
    
    mediaRecorderRef.current = recorder;
    recordingStreamRef.current = recordingStream;
    
    // Setup chunks collection
    const chunks: BlobPart[] = [];
    if (recorder) {
      recorder.ondataavailable = (e) => chunks.push(e.data);
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const videoUrl = URL.createObjectURL(blob);
        
        setVideoData(prev => [...prev, videoUrl]);
        setVideoBlobs(prev => [...prev, blob]);
        
        // If this is the first video, analyze it
        if (step === 0) {
          analyzeTrash(blob);
        }
      };
    }
  };

  const handleStopRecording = () => {
    const stopTimer = () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      setRecordingTime(0);
    };
    
    const handleVideoData = (videoUrl: string) => {
      // This is handled by the ondataavailable and onstop events
    };
    
    stopRecording(
      mediaRecorderRef.current,
      recordingStreamRef.current,
      streamRef.current,
      setIsRecording,
      stopTimer,
      handleVideoData
    );
  };

  const analyzeTrash = async (blob: Blob) => {
    try {
      setIsAnalyzing(true);
      setShowAnalysisModal(true);
      
      const result = await analyzeTrashImage(blob);
      setAnalysisData(result);
    } catch (error) {
      console.error("Error analyzing trash:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze trash. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      submitCleanup();
    }
  };

  const handlePrevStep = () => {
    if (step > 0) {
      setStep(step - 1);
      // Remove the last recorded video
      setVideoData(videoData.slice(0, -1));
      setVideoBlobs(videoBlobs.slice(0, -1));
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
      // Calculate points based on AI analysis or default to 25
      const points = analysisData?.points || 25;
      
      // Upload video/evidence data would go here in a real implementation
      const { data, error } = await supabase
        .from('cleanups')
        .insert([
          { 
            user_id: user.id,
            location: 'Custom location', 
            points: points,
            verified: false,
            trash_weight_kg: analysisData?.estimatedWeight || 0.5, // Use AI estimate or default
            trash_type: analysisData?.trashType || 'Mixed' // Use AI detected type or default
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
          .update({ total_points: currentPoints + points })
          .eq('id', user.id);
      }
      
      toast({
        title: "Cleanup Submitted",
        description: `Great job! You've earned ${points} points for your cleanup.`,
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

  return (
    <div className="min-h-screen bg-black pb-16">
      <Header title="Record Cleanup" showBack={true} />
      
      <div className="relative h-[calc(100vh-132px)]">
        {/* Camera view component */}
        <CameraView
          videoRef={videoRef}
          isCameraReady={isCameraReady}
          isRecording={isRecording}
          recordingTime={recordingTime}
          step={step}
          stepsCount={steps.length}
          stepTitle={steps[step].title}
          stepDescription={steps[step].description}
          videoPreview={videoData[step]}
        />
        
        {/* Camera controls component */}
        <CameraControls
          isRecording={isRecording}
          videoData={videoData}
          step={step}
          totalSteps={steps.length}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onPrevStep={handlePrevStep}
          onNextStep={handleNextStep}
          isCameraReady={isCameraReady}
        />
      </div>
      
      {/* Only show NavBar when not recording */}
      {!isRecording && <NavBar />}
      
      {/* AI Analysis Modal */}
      <TrashAnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        analysisData={analysisData}
        isLoading={isAnalyzing}
      />
    </div>
  );
};

export default CleanupCamera;
