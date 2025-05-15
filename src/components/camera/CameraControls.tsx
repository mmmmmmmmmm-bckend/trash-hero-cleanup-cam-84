
import React from 'react';
import { Video, X, ArrowLeft, ArrowRight } from 'lucide-react';

interface CameraControlsProps {
  isRecording: boolean;
  videoData: string[];
  step: number;
  totalSteps: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  isCameraReady: boolean;
}

const CameraControls: React.FC<CameraControlsProps> = ({
  isRecording,
  videoData,
  step,
  totalSteps,
  onStartRecording,
  onStopRecording,
  onPrevStep,
  onNextStep,
  isCameraReady
}) => {
  return (
    <>
      {/* Recording controls */}
      <div className="absolute bottom-16 left-0 right-0 px-4">
        <div className="flex justify-center items-center gap-4">
          {!isRecording ? (
            <button 
              onClick={onStartRecording}
              className="bg-red-500 text-white p-4 rounded-full"
              disabled={!isCameraReady}
            >
              <Video className="w-8 h-8" />
            </button>
          ) : (
            <button 
              onClick={onStopRecording}
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
            onClick={onPrevStep}
            className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          {videoData[step] && (
            <button 
              onClick={onNextStep}
              className="bg-primary text-white px-4 py-2 rounded-full flex items-center gap-1"
            >
              {step === totalSteps - 1 ? 'Submit' : 'Next'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default CameraControls;
