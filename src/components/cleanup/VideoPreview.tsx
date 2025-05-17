
import React from 'react';
import { Button } from '@/components/ui/button';

interface TrashAnalysis {
  type: string;
  confidence: number;
  impact: string;
  recycling: string;
}

interface VideoPreviewProps {
  videoUrl: string | null;
  trashAnalysis: TrashAnalysis | null;
  step: 'finding' | 'disposing';
  detectionStatus: 'none' | 'detecting' | 'detected' | 'verified';
  onRetake: () => void;
  onNext: () => void;
  loading: boolean;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ 
  videoUrl,
  trashAnalysis,
  step,
  detectionStatus,
  onRetake,
  onNext,
  loading
}) => {
  const isNextDisabled = loading || 
    (step === 'finding' && detectionStatus !== 'detected') || 
    (step === 'disposing' && detectionStatus !== 'verified');

  // Auto-verify for step 2 after video is loaded
  React.useEffect(() => {
    let timeoutId: number;
    if (step === 'disposing' && videoUrl && detectionStatus !== 'verified') {
      timeoutId = window.setTimeout(() => {
        if (detectionStatus !== 'verified') {
          // Auto-verify for step 2
          window._trashDetectionStatus = 'verified';
          document.dispatchEvent(new CustomEvent('trash-verified'));
        }
      }, 2000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [videoUrl, step, detectionStatus]);

  return (
    <div className="relative h-full">
      {/* Video preview */}
      {videoUrl && (
        <video
          src={videoUrl}
          controls
          autoPlay
          playsInline
          className="absolute inset-0 min-h-full min-w-full object-contain bg-black"
        />
      )}

      {/* AI detection status overlay */}
      {detectionStatus === 'detected' && (
        <div className="absolute inset-0 border-4 border-green-500 pointer-events-none"></div>
      )}
      
      {/* Trash analysis overlay */}
      {trashAnalysis && step === 'finding' && (
        <div className="absolute bottom-32 left-4 right-4 bg-black/70 p-4 rounded-lg text-white">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">AI Analysis</h3>
            <span className="text-sm bg-primary/20 text-primary px-2 py-1 rounded-full">
              {trashAnalysis.confidence.toFixed(1)}% confidence
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold">Type:</span> {trashAnalysis.type}</p>
            <p><span className="font-semibold">Environmental Impact:</span> {trashAnalysis.impact}</p>
            <p><span className="font-semibold">Recycling:</span> {trashAnalysis.recycling}</p>
          </div>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-6 left-4 right-4 flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1 text-white border-white hover:bg-white/20"
          onClick={onRetake}
          disabled={loading}
        >
          Retake
        </Button>
        <Button 
          className="flex-1"
          onClick={onNext}
          disabled={isNextDisabled}
        >
          {loading ? "Saving..." : step === 'finding' ? "Next" : "Save"}
        </Button>
      </div>
    </div>
  );
};

// For auto-verification in step 2
declare global {
  interface Window {
    _trashDetectionStatus?: string;
  }
}

export default VideoPreview;
