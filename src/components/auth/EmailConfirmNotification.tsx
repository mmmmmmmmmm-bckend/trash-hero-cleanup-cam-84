
import React from 'react';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';

interface EmailConfirmNotificationProps {
  email: string;
  status: 'pending' | 'sent' | 'confirmed' | 'error';
  message?: string;
}

const EmailConfirmNotification = ({ email, status, message }: EmailConfirmNotificationProps) => {
  return (
    <div className={`mt-4 p-4 rounded-md text-sm ${
      status === 'pending' || status === 'sent' 
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' 
        : status === 'confirmed' 
          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
          : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
    }`}>
      <div className="flex items-start">
        {status === 'pending' && <Mail className="h-5 w-5 mr-2 flex-shrink-0" />}
        {status === 'sent' && <Mail className="h-5 w-5 mr-2 flex-shrink-0" />}
        {status === 'confirmed' && <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />}
        {status === 'error' && <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />}
        
        <div>
          {status === 'pending' && (
            <>
              <p className="font-medium">Verification Required</p>
              <p className="mt-1">Please check your inbox at <strong>{email}</strong> to verify your account.</p>
            </>
          )}
          
          {status === 'sent' && (
            <>
              <p className="font-medium">Verification Email Sent</p>
              <p className="mt-1">
                A confirmation link has been sent to <strong>{email}</strong>. 
                Please check your inbox and click the link to activate your account.
              </p>
            </>
          )}
          
          {status === 'confirmed' && (
            <>
              <p className="font-medium">Email Verified</p>
              <p className="mt-1">Your email has been successfully verified.</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <p className="font-medium">Verification Error</p>
              <p className="mt-1">{message || "There was an error verifying your email."}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmNotification;
