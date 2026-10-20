import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tv, Loader2, Clock, Calendar, Play } from "lucide-react";
import { format } from "date-fns";
import { extractYouTubeId } from "@/lib/youtube";

interface AdContent {
  id: string;
  title: string;
  content_type: string;
  content_url: string;
  duration_seconds: number;
}

interface ScheduledAd {
  id: string;
  scheduled_date: string;
  slot_time: string;
  ad: AdContent;
}

interface DefaultContent {
  id: string;
  content_type: string;
  content_url: string;
  title: string | null;
}

export default function TVDisplay() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [currentContent, setCurrentContent] = useState<AdContent | DefaultContent | null>(null);
  const [scheduledAds, setScheduledAds] = useState<ScheduledAd[]>([]);
  const [defaultContent, setDefaultContent] = useState<DefaultContent[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [defaultContentIndex, setDefaultContentIndex] = useState(-1);
  const [noStore, setNoStore] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/tv/login");
    }
  }, [user, authLoading, navigate]);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keep the screen from sleeping while the display runs
  useEffect(() => {
    let lock: WakeLockSentinel | undefined;
    const request = async () => {
      try {
        lock = await navigator.wakeLock?.request("screen");
      } catch {
        // Not supported or not allowed; the device's own sleep settings apply
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") request();
    };
    request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release();
    };
  }, []);

  // Local date, so the evening's ads are not looked up under tomorrow's UTC date
  const today = format(currentTime, "yyyy-MM-dd");

  // Fetch store info
  useEffect(() => {
    const fetchStoreInfo = async () => {
      if (!user) return;

      const { data: store, error } = await supabase
        .from("stores")
        .select("id, store_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching store:", error);
        return;
      }

      if (store) {
        setStoreId(store.id);
        setStoreName(store.store_name);
      } else {
        setNoStore(true);
      }
    };

    fetchStoreInfo();
  }, [user]);

  // Fetch scheduled ads and default content
  useEffect(() => {
    const fetchContent = async () => {
      if (!storeId) return;

      // Fetch scheduled ads for today
      const { data: ads, error: adsError } = await supabase
        .from("ad_schedule")
        .select(`
          id,
          scheduled_date,
          slot_time,
          ad:ads(id, title, content_type, content_url, duration_seconds)
        `)
        .eq("store_id", storeId)
        .eq("scheduled_date", today)
        .is("played_at", null)
        .order("slot_time", { ascending: true });

      if (adsError) {
        console.error("Error fetching ads:", adsError);
      } else if (ads) {
        setScheduledAds(ads as unknown as ScheduledAd[]);
      }

      // Fetch default content
      const { data: defaults, error: defaultsError } = await supabase
        .from("store_default_content")
        .select("*")
        .eq("store_id", storeId)
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (defaultsError) {
        console.error("Error fetching default content:", defaultsError);
      } else if (defaults) {
        setDefaultContent(defaults);
      }
    };

    fetchContent();

    // Set up realtime subscription for schedule updates
    const channel = supabase
      .channel(`ad-schedule-${storeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ad_schedule",
          filter: `store_id=eq.${storeId}`,
        },
        () => {
          fetchContent();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "store_default_content",
          filter: `store_id=eq.${storeId}`,
        },
        () => {
          fetchContent();
        }
      )
      .subscribe();

    // Catch up on anything missed while the TV was offline
    const handleOnline = () => fetchContent();
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
      supabase.removeChannel(channel);
    };
  }, [storeId, today]);

  // Play default content in rotation
  const playDefaultContent = useCallback(() => {
    if (defaultContent.length === 0) {
      setCurrentContent(null);
      return;
    }

    const nextIndex = (defaultContentIndex + 1) % defaultContent.length;
    setDefaultContentIndex(nextIndex);
    setCurrentContent(defaultContent[nextIndex]);
  }, [defaultContent, defaultContentIndex]);

  // Timers started earlier call the latest version
  const playDefaultContentRef = useRef(playDefaultContent);
  const adTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    playDefaultContentRef.current = playDefaultContent;
  }, [playDefaultContent]);

  // Check for scheduled ads and play them
  const checkAndPlayAd = useCallback(() => {
    const now = new Date();
    const currentTimeStr = now.toTimeString().slice(0, 5);

    // Find an unplayed ad whose slot started in the last 2 minutes, so a late
    // or restarted check still plays it
    const graceStartStr = new Date(now.getTime() - 2 * 60 * 1000).toTimeString().slice(0, 5);
    const scheduledAd = scheduledAds.find((ad) => {
      const adTime = ad.slot_time.slice(0, 5);
      return adTime <= currentTimeStr && adTime >= graceStartStr;
    });

    if (scheduledAd && scheduledAd.ad) {
      setCurrentContent(scheduledAd.ad);
      setIsPlaying(true);

      // Mark as played
      supabase
        .from("ad_schedule")
        .update({ played_at: now.toISOString() })
        .eq("id", scheduledAd.id)
        .then(({ error }) => {
          if (error) {
            console.error("Error marking ad as played:", error);
          }
          // Remove from local state
          setScheduledAds((prev) => prev.filter((a) => a.id !== scheduledAd.id));
        });

      // Switch back to default content after ad duration
      clearTimeout(adTimeoutRef.current);
      adTimeoutRef.current = setTimeout(() => {
        setIsPlaying(false);
        playDefaultContentRef.current();
      }, (scheduledAd.ad.duration_seconds || 15) * 1000);
    }
  }, [scheduledAds]);

  useEffect(() => () => clearTimeout(adTimeoutRef.current), []);

  // Check for due ads every 15 seconds
  useEffect(() => {
    const interval = setInterval(checkAndPlayAd, 15000);
    checkAndPlayAd(); // Check immediately
    return () => clearInterval(interval);
  }, [checkAndPlayAd]);

  // Rotate default content every 30 seconds when not playing ads
  useEffect(() => {
    if (isPlaying) return;

    const interval = setInterval(playDefaultContent, 30000);
    if (!currentContent && defaultContent.length > 0) {
      playDefaultContent();
    }
    return () => clearInterval(interval);
  }, [isPlaying, playDefaultContent, currentContent, defaultContent]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  };

  // Render content based on type
  const renderContent = () => {
    if (!currentContent) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-pulse-glow p-8 rounded-full bg-secondary/30">
            <Tv className="w-32 h-32 text-primary" />
          </div>
          <h2 className="tv-heading mt-8 text-muted-foreground">
            {noStore ? "No Store on This Account" : "No Content Scheduled"}
          </h2>
          <p className="tv-body text-muted-foreground/60 mt-4">
            {noStore
              ? "Sign in with a store owner account, or set up your store in the dashboard"
              : "Add content in your store dashboard"}
          </p>
        </div>
      );
    }

    const contentType = currentContent.content_type;
    const contentUrl = currentContent.content_url;

    if (contentType === "video") {
      return (
        <video
          src={contentUrl}
          autoPlay
          muted
          playsInline
          loop={!isPlaying}
          className="w-full h-full object-cover"
          onEnded={() => !isPlaying && playDefaultContent()}
          onError={() => !isPlaying && playDefaultContent()}
        />
      );
    }

    if (contentType === "youtube") {
      const videoId = extractYouTubeId(contentUrl);
      
      if (videoId) {
        return (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`}
            className="w-full h-full"
            title={currentContent.title || "YouTube video"}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        );
      }
    }

    if (contentType === "image") {
      return (
        <img
          src={contentUrl}
          alt={"title" in currentContent ? currentContent.title || "" : ""}
          className="w-full h-full object-cover"
          onError={() => !isPlaying && playDefaultContent()}
        />
      );
    }

    return null;
  };

  if (authLoading) {
    return (
      <div className="dark tv-display flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="dark tv-display relative overflow-hidden cursor-none" onDoubleClick={toggleFullscreen}>
      {/* Main Content Area */}
      <div className="absolute inset-0">
        {renderContent()}
      </div>

      {/* Overlay Info Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-background/80 to-transparent">
        <div className="flex items-center justify-between">
          {/* Store Info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Tv className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{storeName || "AdStation"}</h1>
              <p className="text-sm text-muted-foreground">
                {isPlaying ? (
                  <span className="flex items-center gap-2 text-accent">
                    <Play className="w-4 h-4" />
                    Playing Sponsored Ad
                  </span>
                ) : (
                  "Store Content"
                )}
              </p>
            </div>
          </div>

          {/* Time & Date */}
          <div className="text-right">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <Clock className="w-6 h-6 text-primary" />
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {currentTime.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Ads Indicator */}
      {scheduledAds.length > 0 && (
        <div className="absolute bottom-6 right-6 glass-card px-4 py-3 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
          <span className="text-sm">
            {scheduledAds.length} ad{scheduledAds.length !== 1 ? "s" : ""} scheduled today
          </span>
        </div>
      )}
    </div>
  );
}
