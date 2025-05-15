
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import AuthCheck from "./components/AuthCheck";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CleanupCamera from "./pages/CleanupCamera";
import Map from "./pages/Map";
import Challenges from "./pages/Challenges";
import Points from "./pages/Points";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AllBadges from "./pages/AllBadges";
import AllRewards from "./pages/AllRewards";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes */}
            <Route path="/" element={<AuthCheck><Index /></AuthCheck>} />
            <Route path="/cleanup" element={<AuthCheck><CleanupCamera /></AuthCheck>} />
            <Route path="/map" element={<AuthCheck><Map /></AuthCheck>} />
            <Route path="/challenges" element={<AuthCheck><Challenges /></AuthCheck>} />
            <Route path="/points" element={<AuthCheck><Points /></AuthCheck>} />
            <Route path="/profile" element={<AuthCheck><Profile /></AuthCheck>} />
            <Route path="/settings" element={<AuthCheck><Settings /></AuthCheck>} />
            <Route path="/badges" element={<AuthCheck><AllBadges /></AuthCheck>} />
            <Route path="/rewards" element={<AuthCheck><AllRewards /></AuthCheck>} />
            
            {/* Fallback route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
