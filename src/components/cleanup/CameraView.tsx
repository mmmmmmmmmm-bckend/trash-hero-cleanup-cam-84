
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
  onNavigateBack: () => void; // New prop for handling back navigation
  children: React.ReactNode;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  stream,
  cameraFacing,
  isRecording,
  onSwitchCamera,
  onShowInfo,
  onNavigateBack, // New prop for handling back navigation
  children
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
    <div className="relative flex-1 w-full h-full overflow-hidden">
      {/* Top navigation */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-black/50 text-white hover:bg-black/70"
          onClick={handleBackNavigation}
        >
          <X className="h-5 w-5" />
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={onShowInfo}
          >
            <Info className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={onSwitchCamera}
            disabled={isRecording}
          >
            <Camera className="h-5 w-5" />
          </Button>
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

      {/* Additional components passed as children */}
      {children}
    </div>
  );
};

export default CameraView;
