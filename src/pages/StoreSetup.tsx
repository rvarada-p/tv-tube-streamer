import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Building2, ArrowLeft, Loader2 } from "lucide-react";

const STORE_TYPES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "retail", label: "Retail Store" },
  { value: "grocery", label: "Grocery Store" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "salon", label: "Salon / Spa" },
  { value: "gym", label: "Gym / Fitness" },
  { value: "medical", label: "Medical Office" },
  { value: "automotive", label: "Automotive" },
  { value: "entertainment", label: "Entertainment" },
  { value: "other", label: "Other" },
];

const AD_CATEGORIES = [
  { value: "food", label: "Food & Dining" },
  { value: "retail", label: "Retail & Shopping" },
  { value: "health", label: "Health & Wellness" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "automotive", label: "Automotive" },
  { value: "entertainment", label: "Entertainment" },
  { value: "technology", label: "Technology" },
  { value: "real_estate", label: "Real Estate" },
  { value: "services", label: "Professional Services" },
  { value: "other", label: "Other" },
];

export default function StoreSetup() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  useDocumentTitle("Set up your store");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    storeName: "",
    storeType: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    openingTime: "09:00",
    closingTime: "21:00",
    adCategories: [] as string[],
  });

  // Signed-out visitors sign in first
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Each account has one store; setting it up again can only fail
  useEffect(() => {
    if (!user) return;
    supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) navigate("/dashboard", { replace: true });
      });
  }, [user, navigate]);

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      adCategories: prev.adCategories.includes(category)
        ? prev.adCategories.filter((c) => c !== category)
        : [...prev.adCategories, category],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    const { error } = await supabase.from("stores").insert({
      user_id: user.id,
      store_name: formData.storeName.trim(),
      store_type: formData.storeType as "restaurant" | "retail" | "grocery" | "pharmacy" | "salon" | "gym" | "medical" | "automotive" | "entertainment" | "other",
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      zip_code: formData.zipCode.trim(),
      opening_time: formData.openingTime,
      closing_time: formData.closingTime,
      ad_categories: formData.adCategories as ("food" | "retail" | "health" | "beauty" | "automotive" | "entertainment" | "technology" | "real_estate" | "services" | "other")[],
      is_active: true,
    });

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.code === "23505"
          ? "This account already has a store."
          : `Failed to create store: ${error.message}`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Store Created!",
      description: "Your store is now set up and ready to receive ads.",
    });

    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container max-w-2xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle>Set Up Your Store</CardTitle>
                <CardDescription>
                  Enter your store details to start receiving ad placements
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Store Name */}
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name *</Label>
                <Input
                  id="storeName"
                  autoComplete="organization"
                  placeholder="My Awesome Store"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  required
                />
              </div>

              {/* Store Type */}
              <div className="space-y-2">
                <Label htmlFor="storeType">Store Type *</Label>
                <Select
                  value={formData.storeType}
                  onValueChange={(v) => setFormData({ ...formData, storeType: v })}
                  required
                >
                  <SelectTrigger id="storeType">
                    <SelectValue placeholder="Select store type" />
                  </SelectTrigger>
                  <SelectContent>
                    {STORE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  autoComplete="street-address"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>

              {/* City, State, Zip */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    autoComplete="address-level2"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    autoComplete="address-level1"
                    placeholder="CA"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    autoComplete="postal-code"
                    placeholder="12345"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Store Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openingTime">Opening Time *</Label>
                  <Input
                    id="openingTime"
                    type="time"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closingTime">Closing Time *</Label>
                  <Input
                    id="closingTime"
                    type="time"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Ad Categories */}
              <div className="space-y-3">
                <Label>Preferred Ad Categories</Label>
                <p className="text-sm text-muted-foreground">
                  Select the types of ads you're comfortable showing in your store
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {AD_CATEGORIES.map((category) => (
                    <div key={category.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ad-category-${category.value}`}
                        checked={formData.adCategories.includes(category.value)}
                        onCheckedChange={() => handleCategoryToggle(category.value)}
                      />
                      <label
                        htmlFor={`ad-category-${category.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {category.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Store...
                  </>
                ) : (
                  "Create Store"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
