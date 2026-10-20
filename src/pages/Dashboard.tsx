import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Tv, 
  LogOut, 
  Building2, 
  Megaphone, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  Plus,
  Settings,
  Loader2
} from "lucide-react";

interface Profile {
  first_name: string | null;
  last_name: string | null;
  user_type: string;
}

interface Store {
  id: string;
  store_name: string;
  is_active: boolean | null;
}

interface AdSponsor {
  id: string;
  company_name: string;
}

function ComingSoon() {
  return <p className="text-xs font-medium uppercase tracking-wide opacity-80">Coming soon</p>;
}

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [sponsor, setSponsor] = useState<AdSponsor | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [adsToday, setAdsToday] = useState(0);
  const [contentCount, setContentCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name, user_type")
        .eq("user_id", user.id)
        .single();

      if (profileError) {
        setLoadError(profileError.message);
      }

      if (profileData) {
        setProfile(profileData);

        // Fetch store or sponsor based on user type
        if (profileData.user_type === "store") {
          const { data: storeData } = await supabase
            .from("stores")
            .select("id, store_name, is_active")
            .eq("user_id", user.id)
            .maybeSingle();
          setStore(storeData);

          if (storeData) {
            const { count } = await supabase
              .from("ad_schedule")
              .select("id", { count: "exact", head: true })
              .eq("store_id", storeData.id)
              .eq("scheduled_date", format(new Date(), "yyyy-MM-dd"));
            setAdsToday(count ?? 0);

            const { count: items } = await supabase
              .from("store_default_content")
              .select("id", { count: "exact", head: true })
              .eq("store_id", storeData.id);
            setContentCount(items ?? 0);
          }
        } else if (profileData.user_type === "ad_sponsor") {
          const { data: sponsorData } = await supabase
            .from("ad_sponsors")
            .select("id, company_name")
            .eq("user_id", user.id)
            .maybeSingle();
          setSponsor(sponsorData);
        }
      }

      setLoading(false);
    };

    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isStore = profile?.user_type === "store";
  const isSponsor = profile?.user_type === "ad_sponsor";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Tv className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display">AdStation</span>
            {(store || sponsor) && (
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {store?.store_name || sponsor?.company_name}
              </span>
            )}
            {store && !store.is_active && (
              <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">Inactive</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {profile?.first_name || user?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loadError && (
          <Card className="mb-8 border-destructive/50">
            <CardHeader>
              <CardTitle>Couldn't load your account</CardTitle>
              <CardDescription>{loadError}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Setup Banner - Show if no store/sponsor set up */}
        {isStore && !store && (
          <Card className="mb-8 border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Complete Your Store Setup
              </CardTitle>
              <CardDescription>
                Set up your store details to start receiving ad placements and earning revenue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/store/setup">
                  <Plus className="w-4 h-4 mr-2" />
                  Set Up Store
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {isSponsor && !sponsor && (
          <Card className="mb-8 border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                Complete Your Company Setup
              </CardTitle>
              <CardDescription>
                Set up your company details to start posting ads on store TVs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/sponsor/setup">
                  <Plus className="w-4 h-4 mr-2" />
                  Set Up Company
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Store Owner Cards */}
          {isStore && (
            <>
              <Link to="/store/schedule" className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5 text-primary" />
                    Ad Schedule
                  </CardTitle>
                  <CardDescription>View and manage your ad slots</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{adsToday}</p>
                  <p className="text-sm text-muted-foreground">Ads scheduled today</p>
                </CardContent>
              </Card>
              </Link>

              <Card className="opacity-60" aria-disabled="true">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Megaphone className="w-5 h-5 text-accent" />
                    Ad Requests
                  </CardTitle>
                  <CardDescription>Approve or reject ad placements</CardDescription>
                  <ComingSoon />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Pending approvals</p>
                </CardContent>
              </Card>

              <Card className="opacity-60" aria-disabled="true">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="w-5 h-5 text-success" />
                    Earnings
                  </CardTitle>
                  <CardDescription>Track your ad revenue</CardDescription>
                  <ComingSoon />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">$0.00</p>
                  <p className="text-sm text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Link to="/store/content" className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Tv className="w-5 h-5 text-primary" />
                    Default Content
                  </CardTitle>
                  <CardDescription>Manage content when no ads play</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{contentCount}</p>
                  <p className="text-sm text-muted-foreground">Content items</p>
                </CardContent>
              </Card>
              </Link>

              <Card className="opacity-60" aria-disabled="true">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    Store Settings
                  </CardTitle>
                  <CardDescription>Update store details and preferences</CardDescription>
                  <ComingSoon />
                </CardHeader>
              </Card>

              <Link to="/tv" className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Card className="h-full hover:shadow-lg transition-shadow gradient-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-primary-foreground">
                    <Tv className="w-5 h-5" />
                    Launch TV Display
                  </CardTitle>
                  <CardDescription className="text-primary-foreground/80">Open the TV display mode</CardDescription>
                </CardHeader>
              </Card>
              </Link>
            </>
          )}

          {/* Ad Sponsor Cards */}
          {isSponsor && (
            <>
              <Card className="opacity-60 gradient-primary text-primary-foreground" aria-disabled="true">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-primary-foreground">
                    <Plus className="w-5 h-5" />
                    Post New Ad
                  </CardTitle>
                  <CardDescription className="text-primary-foreground/80">Create a new ad campaign</CardDescription>
                  <ComingSoon />
                </CardHeader>
              </Card>

              <Card className="opacity-60" aria-disabled="true">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Megaphone className="w-5 h-5 text-primary" />
                    My Campaigns
                  </CardTitle>
                  <CardDescription>View and manage your ad campaigns</CardDescription>
                  <ComingSoon />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Active campaigns</p>
                </CardContent>
              </Card>

              <Card className="opacity-60" aria-disabled="true">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    Analytics
                  </CardTitle>
                  <CardDescription>Track ad performance and reach</CardDescription>
                  <ComingSoon />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Total impressions</p>
                </CardContent>
              </Card>

              <Card className="opacity-60" aria-disabled="true">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <DollarSign className="w-5 h-5 text-success" />
                    Billing
                  </CardTitle>
                  <CardDescription>Manage payments and invoices</CardDescription>
                  <ComingSoon />
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">$0.00</p>
                  <p className="text-sm text-muted-foreground">Total spent</p>
                </CardContent>
              </Card>

              <Card className="opacity-60" aria-disabled="true">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                    Company Settings
                  </CardTitle>
                  <CardDescription>Update company details</CardDescription>
                  <ComingSoon />
                </CardHeader>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
