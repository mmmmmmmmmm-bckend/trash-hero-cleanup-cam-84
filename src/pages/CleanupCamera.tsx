
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Video, Check, X, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import NavBar from '../components/NavBar';
import Header from '../components/Header';

const CleanupCamera = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [step, setStep] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [videoData, setVideoData] = useState<string[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [isCameraReady, setCameraReady] = useState(false);
  
  const steps = [
    { title: "Show the trash", description: "First, show us the trash you've found" },
    { title: "Pick it up", description: "Now pick up the trash" },
    { title: "Proper disposal", description: "Finally, show putting it in a bin" }
  ];

  // Start the camera on component mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
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

  const startRecording = async () => {
    if (!streamRef.current) {
      await startCamera();
    }
    
    if (streamRef.current) {
      setIsRecording(true);
      
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
      
      // Clear the timer
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      setRecordingTime(0);
    }
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
      // For now, just add a cleanup record
      const { data, error } = await supabase
        .from('cleanups')
        .insert([
          { 
            user_id: user.id,
            location: 'Custom location', 
            points: 25,
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
          .update({ total_points: currentPoints + 25 })
          .eq('id', user.id);
      }
      
      toast({
        title: "Cleanup Submitted",
        description: "Your cleanup has been submitted for verification. You'll receive points soon!",
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
        {/* Camera view */}
        <div className="relative h-full">
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover"
          />
          
          {!isCameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80">
              <div className="text-center text-white">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p>Setting up camera...</p>
              </div>
            </div>
          )}
          
          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-white text-sm font-medium">{formatTime(recordingTime)}</span>
            </div>
          )}
          
          {/* Step indicator */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
            <span className="text-white text-sm font-medium">Step {step + 1}/{steps.length}</span>
          </div>
          
          {/* Instructions */}
          <div className="absolute bottom-32 left-0 right-0 px-4">
            <div className="bg-black/60 backdrop-blur-sm text-white p-4 rounded-xl max-w-md mx-auto">
              <h3 className="text-xl font-bold mb-1">{steps[step].title}</h3>
              <p>{steps[step].description}</p>
            </div>
          </div>
          
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
              <div className="absolute bottom-1 right-1">
                <Check className="w-4 h-4 text-green-500" />
              </div>
            </div>
          )}
          
          {/* Controls */}
          <div className="absolute bottom-16 left-0 right-0 px-4">
            <div className="flex justify-center items-center gap-4">
              {!isRecording ? (
                <button 
                  onClick={startRecording}
                  className="bg-red-500 text-white p-4 rounded-full"
                  disabled={!isCameraReady}
                >
                  <Video className="w-8 h-8" />
                </button>
              ) : (
                <button 
                  onClick={stopRecording}
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
                onClick={prevStep}
                className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              
              {videoData[step] && (
                <button 
                  onClick={nextStep}
                  className="bg-primary text-white px-4 py-2 rounded-full flex items-center gap-1"
                >
                  {step === steps.length - 1 ? 'Submit' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <NavBar />
    </div>
  );
};

export default CleanupCamera;
