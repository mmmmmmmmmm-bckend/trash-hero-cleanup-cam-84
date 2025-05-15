
import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface PasswordFieldProps {
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
}

const PasswordField = ({ password, setPassword, confirmPassword, setConfirmPassword }: PasswordFieldProps) => {
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength checker
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordMessage('');
      return;
    }

    let strength = 0;
    let messages = [];

    // Check for length
    if (password.length >= 8) {
      strength += 25;
    } else {
      messages.push('At least 8 characters');
    }

    // Check for uppercase
    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else {
      messages.push('At least one uppercase letter');
    }

    // Check for lowercase
    if (/[a-z]/.test(password)) {
      strength += 25;
    } else {
      messages.push('At least one lowercase letter');
    }

    // Check for special characters or numbers
    if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      strength += 25;
    } else {
      messages.push('At least one number or special character');
    }

    setPasswordStrength(strength);
    setPasswordMessage(messages.join(', '));
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-red-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <>
      <div className="space-y-2">
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10"
            required
          />
          <button 
            type="button"
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {password && (
          <>
            <Progress value={passwordStrength} className={`h-1 ${getStrengthColor()}`} />
            <p className="text-xs text-muted-foreground">
              {passwordMessage || (
                passwordStrength < 75 
                  ? "Password strength: " + (passwordStrength <= 25 ? "Weak" : "Medium") 
                  : "Password strength: Strong"
              )}
            </p>
          </>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 pr-10"
            required
          />
          <button 
            type="button"
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {confirmPassword && password !== confirmPassword && (
          <p className="text-xs text-red-500">
            Passwords don't match
          </p>
        )}
      </div>
    </>
  );
};

export default PasswordField;
