
import React from 'react';
import { formatTime } from '@/utils/recordingUtils';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isCameraReady: boolean;
  isRecording: boolean;
  recordingTime: number;
  step: number;
  stepsCount: number;
  stepTitle: string;
  stepDescription: string;
  videoPreview?: string;
}

const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  isCameraReady,
  isRecording,
  recordingTime,
  step,
  stepsCount,
  stepTitle,
  stepDescription,
  videoPreview
}) => {
  return (
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
        <span className="text-white text-sm font-medium">Step {step + 1}/{stepsCount}</span>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-32 left-0 right-0 px-4">
        <div className="bg-black/60 backdrop-blur-sm text-white p-4 rounded-xl max-w-md mx-auto">
          <h3 className="text-xl font-bold mb-1">{stepTitle}</h3>
          <p>{stepDescription}</p>
        </div>
      </div>
      
      {/* Preview of recorded video */}
      {videoPreview && !isRecording && (
        <div className="absolute bottom-28 right-4 w-24 h-32 rounded-lg overflow-hidden border-2 border-white">
          <video 
            src={videoPreview} 
            className="w-full h-full object-cover" 
            autoPlay 
            loop 
            muted
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-1 right-1">
            <div className="w-4 h-4 text-green-500">✓</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraView;
