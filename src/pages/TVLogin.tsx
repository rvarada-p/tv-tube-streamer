import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tv, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TVLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  useDocumentTitle("TV sign in");

  useEffect(() => {
    if (user) {
      navigate("/tv");
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(email.trim(), password);
    setIsLoading(false);

    if (error) {
      toast({
        title: "Login Failed",
        description: error.message === "Invalid login credentials"
          ? "Invalid credentials. Please try again."
          : error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="dark tv-display flex items-center justify-center p-8">
      <div className="w-full max-w-lg text-center">
        {/* Logo */}
        <div className="mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl gradient-primary tv-glow mb-6">
            <Tv className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="tv-heading bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            AdStation
          </h1>
          <p className="tv-subheading text-muted-foreground mt-4">
            Store TV Display
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSignIn} className="space-y-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Store Email"
              aria-label="Store email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-16 text-xl bg-secondary/50 border-border/50 text-center placeholder:text-muted-foreground"
              required
            />
            <Input
              type="password"
              placeholder="Password"
              aria-label="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-16 text-xl bg-secondary/50 border-border/50 text-center placeholder:text-muted-foreground"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-16 text-xl font-semibold gradient-primary hover:opacity-90 tv-glow transition-all duration-300"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In to Display"
            )}
          </Button>
        </form>

        {/* Help Text */}
        <p className="mt-8 text-muted-foreground tv-body opacity-60">
          Use your store account credentials to login
        </p>
        <p className="mt-2 text-sm text-muted-foreground/50">
          Register at {window.location.host}/auth to create a store account
        </p>
      </div>
    </div>
  );
}
