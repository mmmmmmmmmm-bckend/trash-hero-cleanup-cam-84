
import { supabase } from '@/integrations/supabase/client';

interface TrashAnalysisResult {
  trashType: string;
  confidence: number;
  estimatedWeight: number;
  environmentalImpact: string;
  points: number;
}

export const analyzeTrashImage = async (imageBlob: Blob): Promise<TrashAnalysisResult> => {
  try {
    // Convert Blob to base64 for API transmission
    const base64 = await blobToBase64(imageBlob);
    
    // For now, we'll simulate AI analysis with mock data
    // In a real implementation, you would call an edge function here
    
    // Mock response - simulating AI analysis
    const mockTypes = ['Plastic', 'Paper', 'Metal', 'Glass', 'Organic'];
    const mockType = mockTypes[Math.floor(Math.random() * mockTypes.length)];
    const mockConfidence = 0.7 + Math.random() * 0.29;
    const mockWeight = 0.1 + Math.random() * 0.9;
    const mockPoints = Math.floor(10 + Math.random() * 40);
    
    const impactMap: Record<string, string> = {
      'Plastic': 'Saved 2L of ocean water from contamination',
      'Paper': 'Saved 0.5kg of CO2 emissions',
      'Metal': 'Conserved minerals and reduced mining impact',
      'Glass': 'Prevented sand extraction and saved energy',
      'Organic': 'Reduced methane emissions from landfills'
    };
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      trashType: mockType,
      confidence: parseFloat(mockConfidence.toFixed(2)),
      estimatedWeight: parseFloat(mockWeight.toFixed(2)),
      environmentalImpact: impactMap[mockType] || 'Positive environmental impact',
      points: mockPoints
    };
  } catch (error) {
    console.error("Error analyzing trash image:", error);
    throw error;
  }
};

// Helper function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};
