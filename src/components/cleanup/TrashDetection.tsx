import { useState, useRef, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';

interface TrashDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isRecording: boolean;
  detectionStatus: 'none' | 'detecting' | 'detected' | 'verified';
  step: 'finding' | 'disposing';
  onDetectionComplete: (trashType: string, impact: string, recycling: string, confidence: number) => void;
}

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

export const TrashDetection: React.FC<TrashDetectionProps> = ({
  videoRef,
  isRecording,
  detectionStatus,
  step,
  onDetectionComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [detectionMessage, setDetectionMessage] = useState('');
  const [boundingBoxes, setBoundingBoxes] = useState<{x: number, y: number, width: number, height: number, label: string}[]>([]);

  // Listen for custom detection events
  useEffect(() => {
    const handleVerification = () => {
      if (step === 'disposing') {
        // Update UI for verification
        setDetectionMessage('Verification complete! Trash properly disposed.');
        setDetectionProgress(100);
        // Clear any existing interval
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
          detectionIntervalRef.current = null;
        }
      }
    };

    document.addEventListener('trash-verified', handleVerification);
    return () => {
      document.removeEventListener('trash-verified', handleVerification);
    };
  }, [step]);

  useEffect(() => {
    // Clean up detection interval when component unmounts
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Start or reset detection when recording status changes
    if (isRecording && detectionStatus === 'detecting') {
      startDetection();
    } else if (!isRecording) {
      resetDetection();
    }
  }, [isRecording, detectionStatus]);

  const startDetection = () => {
    // Reset any previous detection state
    resetDetection();
    
    setDetectionMessage('Analyzing environment...');
    setDetectionProgress(0);
    
    // Simulate frame analysis during detection
    const analyzeFrames = () => {
      if (!videoRef.current || !canvasRef.current) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) return;
      
      // Match canvas size to video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Draw current video frame to canvas for "analysis"
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
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
            
            if (matchedTrashType) {
              onDetectionComplete(
                matchedTrashType.type,
                matchedTrashType.impact,
                matchedTrashType.recycling,
                parseFloat(confidence.toFixed(2)) * 100
              );
            }
            
            setDetectionMessage(`Detected: ${matchedTrashType?.type || "Unknown"}`);
            clearInterval(detectionIntervalRef.current!);
          } else if (step === 'disposing') {
            // Step 2 needs a bit more time before verification
            if (window._trashDetectionStatus === 'verified') {
              setDetectionMessage('Verification complete! Trash properly disposed.');
              clearInterval(detectionIntervalRef.current!);
            } else {
              // Keep checking until verified
              setDetectionMessage('Verifying proper disposal...');
              return 95; // Keep at 95% until verified
            }
          }
        }
        
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 50);
  };
  
  const resetDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setBoundingBoxes([]);
    setDetectionProgress(0);
    setDetectionMessage('');
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
    <>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{ display: 'none' }} // Hidden canvas for processing
      />
      
      {/* Render detection bounding boxes */}
      {renderBoundingBoxes()}
      
      {/* Detection status display */}
      {detectionStatus === 'detecting' && (
        <div className="absolute top-16 left-0 right-0 z-10 flex flex-col items-center space-y-2">
          <div className="bg-black/50 text-white px-4 py-2 rounded-full text-xs">
            {detectionMessage}
          </div>
          
          <div className="w-48 bg-black/50 rounded-full p-1">
            <Progress value={detectionProgress} className="h-1" />
          </div>
        </div>
      )}
    </>
  );
};

export default TrashDetection;
