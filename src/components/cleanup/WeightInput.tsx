
import React from 'react';
import { Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface WeightInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const WeightInput: React.FC<WeightInputProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-3 mx-4 mb-4">
      <div className="bg-primary/10 p-2 rounded-full">
        <Trash className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <Input
          type="number"
          min="0.01"
          step="0.01"
          placeholder="Weight (kg)"
          className="bg-white/10 border-0 text-white placeholder-white/60"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default WeightInput;
