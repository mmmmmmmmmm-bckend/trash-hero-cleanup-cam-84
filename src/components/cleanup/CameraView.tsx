
import React, { useState, useEffect } from 'react';
import { X, Camera, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  cameraFacing: 'user' | 'environment';
  isRecording: boolean;
  onSwitchCamera: () => void;
  onShowInfo: () => void;
  onNavigateBack: () => void;
  children: React.ReactNode;
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  actionLabel: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  stream,
  cameraFacing,
  isRecording,
  onSwitchCamera,
  onShowInfo,
  onNavigateBack,
  children,
  step,
  totalSteps,
  title,
  description,
  actionLabel,
  onStartRecording,
  onStopRecording
}) => {
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Initial sizing
    updateDimensions();

    // Handle resize
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Function to handle back navigation
  const handleBackNavigation = () => {
    onNavigateBack(); // Call the parent's cleanup function
    navigate(-1);
  };

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden bg-black">
      {/* Top header bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-primary-dark text-white p-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-primary-dark/50"
          onClick={handleBackNavigation}
        >
          <X className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold flex-1 text-center">Record Cleanup</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-primary-dark/50"
          onClick={onShowInfo}
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>

      {/* Step indicators */}
      <div className="absolute top-16 left-4 z-10 flex items-center gap-2">
        <div className="bg-black/70 text-white px-3 py-1.5 rounded-full text-sm">
          Step {step}/{totalSteps}
        </div>
      </div>
      
      {/* Step description */}
      <div className="absolute top-16 left-0 right-0 z-10 flex justify-center">
        <div className="bg-black/50 text-white px-4 py-2 rounded-full text-sm">
          {step === 1 ? 'Step 1: Record Finding Trash' : 'Step 2: Record Disposal in Bin'}
        </div>
      </div>

      {/* Camera view */}
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

      {/* Recording indicator */}
      {isRecording && (
        <div className="absolute top-28 right-4 flex items-center gap-2 bg-red-500/70 px-3 py-1 rounded-full">
          <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-white text-xs">Recording</span>
        </div>
      )}

      {/* Instruction overlay */}
      <div className="absolute bottom-32 left-0 right-0 px-4">
        <div className="bg-black/70 p-4 rounded-lg text-white">
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-sm">{description}</p>
        </div>
      </div>

      {/* Recording button */}
      <div className="absolute bottom-24 left-0 right-0 flex justify-center">
        <button 
          className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
          onClick={isRecording ? onStopRecording : onStartRecording}
        >
          <div className={isRecording ? "w-8 h-8 bg-white rounded-sm" : "w-14 h-14 bg-white rounded-full"}></div>
        </button>
      </div>

      {/* Navigation buttons */}
      <div className="absolute bottom-6 left-4 right-4 flex justify-between">
        <Button
          variant="ghost"
          size="lg"
          className="bg-black/50 text-white rounded-full w-12 h-12 flex items-center justify-center"
          onClick={handleBackNavigation}
        >
          <X className="h-5 w-5" />
        </Button>
        
        <Button
          variant="default"
          size="lg"
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6"
        >
          {actionLabel} →
        </Button>
      </div>

      {/* Additional components passed as children */}
      {children}
    </div>
  );
};

export default CameraView;
