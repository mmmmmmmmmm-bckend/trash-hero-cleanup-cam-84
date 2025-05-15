
import React from 'react';
import { Lock, Globe, Shield, HelpCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const AccountSection = () => {
  return (
    <section className="bg-card rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold mb-3 flex items-center">
        <Shield className="w-4 h-4 mr-2" />
        Account
      </h3>
      <div className="space-y-3">
        <Button variant="outline" className="w-full justify-start">
          <Lock className="w-4 h-4 mr-2" />
          Change Password
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Globe className="w-4 h-4 mr-2" />
          Language Settings
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Shield className="w-4 h-4 mr-2" />
          Privacy Settings
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <HelpCircle className="w-4 h-4 mr-2" />
          Help & Support
        </Button>
      </div>
    </section>
  );
};

export default AccountSection;
