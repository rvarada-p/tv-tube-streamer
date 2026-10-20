import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { extractYouTubeId, youtubeEmbedUrl } from "@/lib/youtube";
import { checkUpload, UPLOAD_RULES, type UploadKind } from "@/lib/uploads";
import { 
  ArrowLeft, 
  Upload, 
  Trash2, 
  Loader2, 
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  ChevronUp,
  ChevronDown,
  Plus
} from "lucide-react";

interface ContentItem {
  id: string;
  title: string | null;
  content_type: string;
  content_url: string;
  display_order: number | null;
  is_active: boolean | null;
}

interface Store {
  id: string;
  store_name: string;
}

export default function StoreContent() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useDocumentTitle("Default content");
  const { toast } = useToast();
  
  const [store, setStore] = useState<Store | null>(null);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [contentType, setContentType] = useState<string>("image");
  const [title, setTitle] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { state: { from: location.pathname } });
    }
  }, [user, authLoading, navigate, location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch store
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("id, store_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (storeError) {
        toast({
          title: "Couldn't load your store",
          description: storeError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!storeData) {
        navigate("/store/setup");
        return;
      }

      setStore(storeData);

      // Fetch content items
      const { data: contentData, error: contentError } = await supabase
        .from("store_default_content")
        .select("*")
        .eq("store_id", storeData.id)
        .order("display_order", { ascending: true });

      if (contentError) {
        toast({
          title: "Couldn't load your content",
          description: contentError.message,
          variant: "destructive",
        });
      } else if (contentData) {
        setContentItems(contentData);
      }

      setLoading(false);
    };

    fetchData();
  }, [user, navigate, toast]);

  // A file picked for one type must not be uploaded under another
  useEffect(() => {
    setSelectedFile(null);
  }, [contentType]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file again still fires onChange
    e.target.value = "";
    if (file) {
      const problem = checkUpload(file, contentType as UploadKind);
      if (problem) {
        toast({ ...problem, variant: "destructive" });
        return;
      }

      setSelectedFile(file);
    }
  };

  // One past the highest position; the count can collide after a delete
  const nextDisplayOrder = () =>
    contentItems.reduce((max, item) => Math.max(max, item.display_order ?? -1), -1) + 1;

  const handleUpload = async () => {
    if (!store || !user) return;

    if (contentType === "youtube") {
      if (!youtubeUrl.trim()) {
        toast({
          title: "YouTube URL required",
          description: "Please enter a valid YouTube URL",
          variant: "destructive",
        });
        return;
      }

      // Extract YouTube video ID and create embed URL
      const videoId = extractYouTubeId(youtubeUrl);
      if (!videoId) {
        toast({
          title: "Invalid YouTube URL",
          description: "Please enter a valid YouTube video URL",
          variant: "destructive",
        });
        return;
      }

      setUploading(true);
      const { error } = await supabase
        .from("store_default_content")
        .insert({
          store_id: store.id,
          title: title.trim() || "YouTube Video",
          content_type: "youtube",
          content_url: youtubeEmbedUrl(videoId),
          display_order: nextDisplayOrder(),
        });

      if (error) {
        toast({
          title: "Error adding content",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Content added successfully" });
        // Refresh content list
        refreshContent();
        setYoutubeUrl("");
        setTitle("");
      }
      setUploading(false);
      return;
    }

    // Handle file upload
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    // From the checked MIME type, so files without an extension still get one
    const fileExt = selectedFile.type.split("/")[1]?.replace("quicktime", "mov") || "bin";
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("store-content")
      .upload(fileName, selectedFile);

    if (uploadError) {
      toast({
        title: "Upload failed",
        description: uploadError.message,
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("store-content")
      .getPublicUrl(fileName);

    const { error: insertError } = await supabase
      .from("store_default_content")
      .insert({
        store_id: store.id,
        title: title.trim() || selectedFile.name,
        content_type: contentType,
        content_url: urlData.publicUrl,
        display_order: nextDisplayOrder(),
      });

    if (insertError) {
      // Don't leave a file in storage that no row points at
      await supabase.storage.from("store-content").remove([fileName]);
      toast({
        title: "Error saving content",
        description: insertError.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Content uploaded successfully" });
      refreshContent();
      setSelectedFile(null);
      setTitle("");
    }

    setUploading(false);
  };

  const refreshContent = async () => {
    if (!store) return;
    const { data } = await supabase
      .from("store_default_content")
      .select("*")
      .eq("store_id", store.id)
      .order("display_order", { ascending: true });
    if (data) setContentItems(data);
  };

  const moveItem = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= contentItems.length) return;

    const reordered = [...contentItems];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setContentItems(reordered);

    // Save each item's list position as its display order
    const results = await Promise.all(
      reordered
        .map((item, position) => ({ item, position }))
        .filter(({ item, position }) => item.display_order !== position)
        .map(({ item, position }) =>
          supabase.from("store_default_content").update({ display_order: position }).eq("id", item.id)
        )
    );

    const failed = results.find((result) => result.error);
    if (failed) {
      toast({
        title: "Couldn't save the new order",
        description: failed.error?.message,
        variant: "destructive",
      });
    }
    refreshContent();
  };

  const setItemActive = async (item: ContentItem, isActive: boolean) => {
    setContentItems((items) => items.map((i) => (i.id === item.id ? { ...i, is_active: isActive } : i)));

    const { error } = await supabase
      .from("store_default_content")
      .update({ is_active: isActive })
      .eq("id", item.id);

    if (error) {
      toast({
        title: "Couldn't update the item",
        description: error.message,
        variant: "destructive",
      });
      refreshContent();
    }
  };

  const handleDelete = async (item: ContentItem) => {
    if (!confirm(`Delete "${item.title || "this content"}"? This can't be undone.`)) return;

    // Delete from storage if it's not a YouTube link
    if (item.content_type !== "youtube" && item.content_url.includes("store-content")) {
      const path = item.content_url.split("store-content/")[1];
      if (path) {
        const { error: storageError } = await supabase.storage.from("store-content").remove([path]);
        if (storageError) {
          console.error("Error removing file from storage:", storageError);
        }
      }
    }

    const { error } = await supabase
      .from("store_default_content")
      .delete()
      .eq("id", item.id);

    if (error) {
      toast({
        title: "Error deleting content",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Content deleted" });
      refreshContent();
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "image": return <ImageIcon className="w-5 h-5" />;
      case "video": return <Video className="w-5 h-5" />;
      case "youtube": return <LinkIcon className="w-5 h-5" />;
      default: return <ImageIcon className="w-5 h-5" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} aria-label="Back to dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold font-display">Default Content</h1>
            <p className="text-sm text-muted-foreground">{store?.store_name}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Content
            </CardTitle>
            <CardDescription>
              Add images, videos, or YouTube links to display when no sponsored ads are playing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content-type">Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger id="content-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="youtube">YouTube Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-title">Title (optional)</Label>
                <Input 
                  id="content-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Content title"
                />
              </div>
            </div>

            {contentType === "youtube" ? (
              <div className="space-y-2">
                <Label htmlFor="youtube-url">YouTube URL</Label>
                <Input 
                  id="youtube-url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Upload File</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    className="sr-only peer"
                    accept={contentType === "image" ? "image/*" : "video/*"}
                    onChange={handleFileSelect}
                  />
                  <label htmlFor="file-upload" className="block cursor-pointer rounded-md peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    {selectedFile ? (
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Click to upload {contentType === "image" ? "an image" : "a video"}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {UPLOAD_RULES[contentType as UploadKind].hint}
                    </p>
                  </label>
                </div>
              </div>
            )}

            <Button onClick={handleUpload} disabled={uploading} className="w-full sm:w-auto">
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Add Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Content List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Content ({contentItems.length})</CardTitle>
            <CardDescription>
              Content will play in order when no sponsored ads are scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contentItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No content added yet</p>
                <p className="text-sm">Add images, videos, or YouTube links above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contentItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className={`flex items-center gap-4 p-3 bg-muted/50 rounded-lg ${item.is_active === false ? "opacity-60" : ""}`}
                  >
                    <div className="flex flex-col">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveItem(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move ${item.title || "item"} up`}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === contentItems.length - 1}
                        aria-label={`Move ${item.title || "item"} down`}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Thumbnail */}
                    <div className="w-20 h-12 bg-background rounded overflow-hidden flex-shrink-0">
                      {item.content_type === "image" ? (
                        <img 
                          src={item.content_url} 
                          alt={item.title || "Content"}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : item.content_type === "youtube" && extractYouTubeId(item.content_url) ? (
                        <img
                          src={`https://i.ytimg.com/vi/${extractYouTubeId(item.content_url)}/mqdefault.jpg`}
                          alt={item.title || "YouTube video"}
                          className="w-full h-full object-cover"
                        />
                      ) : item.content_type === "video" ? (
                        <video
                          src={item.content_url}
                          muted
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="w-6 h-6 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.title || "Untitled"}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        {getContentIcon(item.content_type)}
                        {item.content_type}
                        {item.is_active === false && " · Paused"}
                      </p>
                    </div>

                    {/* Actions */}
                    <Switch
                      checked={item.is_active !== false}
                      onCheckedChange={(checked) => setItemActive(item, checked)}
                      aria-label={`Show ${item.title || "item"} on TV`}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDelete(item)}
                      aria-label={`Delete ${item.title || "content"}`}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
