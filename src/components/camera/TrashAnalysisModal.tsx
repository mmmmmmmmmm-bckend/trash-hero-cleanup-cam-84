
import React from 'react';
import { Check, X } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface TrashAnalysisData {
  trashType: string;
  confidence: number;
  estimatedWeight: number;
  environmentalImpact: string;
  points: number;
}

interface TrashAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: TrashAnalysisData | null;
  isLoading: boolean;
}

const TrashAnalysisModal: React.FC<TrashAnalysisModalProps> = ({ 
  isOpen, 
  onClose, 
  analysisData,
  isLoading
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Trash Analysis</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex flex-col items-center py-8 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-center">AI is analyzing your cleanup...</p>
          </div>
        ) : (
          <>
            {analysisData && (
              <div className="space-y-4 py-4">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="font-bold text-lg text-primary">{analysisData.trashType}</h3>
                  <p className="text-sm text-muted-foreground">
                    Identified with {Math.round(analysisData.confidence * 100)}% confidence
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{analysisData.estimatedWeight} kg</p>
                    <p className="text-xs text-muted-foreground">Estimated Weight</p>
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">+{analysisData.points}</p>
                    <p className="text-xs text-muted-foreground">Points Earned</p>
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-medium text-green-700 dark:text-green-400 mb-1">Environmental Impact</h4>
                  <p className="text-sm">{analysisData.environmentalImpact}</p>
                </div>
              </div>
            )}
          </>
        )}
        
        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={onClose}
            disabled={isLoading}
            className="w-full"
          >
            <Check className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrashAnalysisModal;
