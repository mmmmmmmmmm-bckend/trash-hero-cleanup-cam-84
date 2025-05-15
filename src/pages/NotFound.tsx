
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "../components/Header";

const NotFound = () => {
  const location = useLocation();

  React.useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header title="404 Not Found" showBack={true} />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-lg text-muted-foreground mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="hero-button inline-flex">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
