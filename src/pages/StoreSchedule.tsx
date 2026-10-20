import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";
import { slotTimes } from "@/lib/schedule";
import { Clock, Tv, ArrowLeft, Play, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Store {
  id: string;
  store_name: string;
  opening_time: string;
  closing_time: string;
}

interface ScheduledAd {
  id: string;
  scheduled_date: string;
  slot_time: string;
  played_at: string | null;
  ads: {
    title: string;
    category: string;
    duration_seconds: number | null;
    content_type: string;
  } | null;
}

interface TimeSlot {
  time: string;
  isBooked: boolean;
  ad?: ScheduledAd;
}

const StoreSchedule = () => {
  const navigate = useNavigate();
  useDocumentTitle("Ad schedule");
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [store, setStore] = useState<Store | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [scheduledAds, setScheduledAds] = useState<ScheduledAd[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const fetchStore = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("id, store_name, opening_time, closing_time")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        toast({
          title: "No store found",
          description: "Please set up your store first.",
          variant: "destructive",
        });
        navigate("/store/setup");
        return;
      }

      setStore(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast, navigate]);

  useEffect(() => {
    if (user) {
      fetchStore();
    }
  }, [user, fetchStore]);

  useEffect(() => {
    if (!store || !selectedDate) return;

    // Ignore responses for a date the user has already moved away from.
    let cancelled = false;

    const fetchScheduledAds = async () => {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("ad_schedule")
        .select(`
          id,
          scheduled_date,
          slot_time,
          played_at,
          ads (
            title,
            category,
            duration_seconds,
            content_type
          )
        `)
        .eq("store_id", store.id)
        .eq("scheduled_date", dateStr)
        .order("slot_time");

      if (cancelled) return;

      if (error) {
        console.error("Error fetching scheduled ads:", error);
        toast({
          title: "Couldn't load the schedule",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setScheduledAds(data || []);
    };

    fetchScheduledAds();

    return () => {
      cancelled = true;
    };
  }, [store, selectedDate, toast]);

  const generateTimeSlots = (): TimeSlot[] => {
    if (!store) return [];

    return slotTimes(store.opening_time, store.closing_time).map((time) => {
      const bookedAd = scheduledAds.find((ad) => ad.slot_time === time);
      return { time, isBooked: !!bookedAd, ad: bookedAd };
    });
  };

  const timeSlots = generateTimeSlots();
  const totalSlots = timeSlots.length;
  const bookedSlots = timeSlots.filter(slot => slot.isBooked).length;
  const availableSlots = totalSlots - bookedSlots;
  const utilizationRate = totalSlots > 0 ? Math.round((bookedSlots / totalSlots) * 100) : 0;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} aria-label="Back to dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ad Schedule</h1>
            <p className="text-muted-foreground">{store?.store_name}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalSlots}</p>
                  <p className="text-sm text-muted-foreground">Total Slots</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{availableSlots}</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Tv className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{bookedSlots}</p>
                  <p className="text-sm text-muted-foreground">Booked</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Play className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{utilizationRate}%</p>
                  <p className="text-sm text-muted-foreground">Utilization</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Select Date</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())}>
                  Today
                </Button>
              </div>
              <CardDescription>View schedule for a specific day</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border border-border pointer-events-auto"
              />
            </CardContent>
          </Card>

          {/* Time Slots Grid */}
          <Card className="md:col-span-2 bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Time Slots</CardTitle>
                  <CardDescription>
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    Available
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    Booked
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {timeSlots.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No time slots configured</p>
                  <p className="text-sm">Store hours: {store?.opening_time} - {store?.closing_time}</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {timeSlots.map((slot) => (
                    <Popover key={slot.time}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-label={`${format(parse(slot.time, "HH:mm:ss", new Date()), "h:mm a")}, ${slot.isBooked ? "booked" : "available"}`}
                          className={cn(
                            "p-2 rounded-lg text-xs font-medium transition-all hover:scale-105",
                            slot.isBooked
                              ? "bg-blue-500/20 text-blue-600 border border-blue-500/30 hover:bg-blue-500/30"
                              : "bg-green-500/10 text-green-600 border border-green-500/20 hover:bg-green-500/20"
                          )}
                        >
                          {format(parse(slot.time, "HH:mm:ss", new Date()), "h:mm a")}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 bg-popover border-border">
                        <div className="space-y-2">
                          <p className="font-medium text-foreground">
                            {format(parse(slot.time, "HH:mm:ss", new Date()), "h:mm a")}
                          </p>
                          {slot.isBooked && slot.ad?.ads ? (
                            <div className="space-y-1">
                              <p className="text-sm text-foreground">{slot.ad.ads.title}</p>
                              <div className="flex gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {slot.ad.ads.category}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {slot.ad.ads.duration_seconds ?? 15}s
                                </Badge>
                              </div>
                              {slot.ad.played_at && (
                                <p className="text-xs text-green-600">
                                  ✓ Played at {format(new Date(slot.ad.played_at), "h:mm a")}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Available for booking</p>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Scheduled Ads List */}
        <Card className="mt-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Scheduled Ads for {format(selectedDate, "MMM d")}</CardTitle>
            <CardDescription>All ads scheduled for the selected date</CardDescription>
          </CardHeader>
          <CardContent>
            {scheduledAds.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Tv className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>No ads scheduled for this date</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledAds.map((ad) => (
                  <div
                    key={ad.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Play className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{ad.ads?.title || "Unknown Ad"}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(parse(ad.slot_time, "HH:mm:ss", new Date()), "h:mm a")} • {ad.ads?.duration_seconds || 15}s
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{ad.ads?.category}</Badge>
                      {ad.played_at ? (
                        <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Played</Badge>
                      ) : parse(ad.slot_time, "HH:mm:ss", selectedDate) < new Date() ? (
                        <Badge variant="outline" className="text-destructive border-destructive/30">Missed</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StoreSchedule;
