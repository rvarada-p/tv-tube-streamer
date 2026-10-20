import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TVLogin = lazy(() => import("./pages/TVLogin"));
const TVDisplay = lazy(() => import("./pages/TVDisplay"));
const StoreSetup = lazy(() => import("./pages/StoreSetup"));
const StoreContent = lazy(() => import("./pages/StoreContent"));
const StoreSchedule = lazy(() => import("./pages/StoreSchedule"));
const SponsorSetup = lazy(() => import("./pages/SponsorSetup"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            }
          >
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* TV Display Routes */}
            <Route path="/tv/login" element={<TVLogin />} />
            <Route path="/tv" element={<TVDisplay />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Store Routes */}
            <Route path="/store/setup" element={<StoreSetup />} />
            <Route path="/store/content" element={<StoreContent />} />
            <Route path="/store/schedule" element={<StoreSchedule />} />
            
            {/* Sponsor Routes */}
            <Route path="/sponsor/setup" element={<SponsorSetup />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
