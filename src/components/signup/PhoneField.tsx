
import React from 'react';
import { Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PhoneFieldProps {
  phone: string;
  setPhone: (phone: string) => void;
  countryCode: string;
  setCountryCode: (code: string) => void;
}

const PhoneField = ({ phone, setPhone, countryCode, setCountryCode }: PhoneFieldProps) => {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="w-1/4">
          <Select value={countryCode} onValueChange={setCountryCode}>
            <SelectTrigger>
              <SelectValue placeholder="+20" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="+20">🇪🇬 +20</SelectItem>
              <SelectItem value="+1">🇺🇸 +1</SelectItem>
              <SelectItem value="+44">🇬🇧 +44</SelectItem>
              <SelectItem value="+91">🇮🇳 +91</SelectItem>
              <SelectItem value="+966">🇸🇦 +966</SelectItem>
              <SelectItem value="+971">🇦🇪 +971</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
};

export default PhoneField;
