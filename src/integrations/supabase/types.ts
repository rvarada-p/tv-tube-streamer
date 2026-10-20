export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ad_packages: {
        Row: {
          ad_changes_included: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          package_type: Database["public"]["Enums"]["package_type"]
          price_cents: number
          store_count: number
        }
        Insert: {
          ad_changes_included?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          package_type: Database["public"]["Enums"]["package_type"]
          price_cents: number
          store_count: number
        }
        Update: {
          ad_changes_included?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          package_type?: Database["public"]["Enums"]["package_type"]
          price_cents?: number
          store_count?: number
        }
        Relationships: []
      }
      ad_schedule: {
        Row: {
          ad_id: string
          created_at: string
          id: string
          order_id: string
          played_at: string | null
          scheduled_date: string
          slot_time: string
          store_id: string
        }
        Insert: {
          ad_id: string
          created_at?: string
          id?: string
          order_id: string
          played_at?: string | null
          scheduled_date: string
          slot_time: string
          store_id: string
        }
        Update: {
          ad_id?: string
          created_at?: string
          id?: string
          order_id?: string
          played_at?: string | null
          scheduled_date?: string
          slot_time?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_schedule_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_schedule_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_schedule_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      ad_sponsors: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          company_type: string | null
          country: string | null
          created_at: string
          id: string
          state: string | null
          updated_at: string
          user_id: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name: string
          company_type?: string | null
          country?: string | null
          created_at?: string
          id?: string
          state?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          company_type?: string | null
          country?: string | null
          created_at?: string
          id?: string
          state?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      ads: {
        Row: {
          category: Database["public"]["Enums"]["ad_category"]
          content_type: string
          content_url: string
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          is_active: boolean | null
          sponsor_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["ad_category"]
          content_type: string
          content_url: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          sponsor_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["ad_category"]
          content_type?: string
          content_url?: string
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_active?: boolean | null
          sponsor_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ads_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "ad_sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      order_stores: {
        Row: {
          approved_at: string | null
          id: string
          order_id: string
          rejected_at: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["order_status"]
          store_id: string
        }
        Insert: {
          approved_at?: string | null
          id?: string
          order_id: string
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          store_id: string
        }
        Update: {
          approved_at?: string | null
          id?: string
          order_id?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_stores_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_stores_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          ad_id: string | null
          created_at: string
          end_date: string
          id: string
          invoice_url: string | null
          package_id: string
          payment_intent_id: string | null
          sponsor_id: string
          start_date: string
          status: Database["public"]["Enums"]["order_status"]
          total_price_cents: number
          updated_at: string
        }
        Insert: {
          ad_id?: string | null
          created_at?: string
          end_date: string
          id?: string
          invoice_url?: string | null
          package_id: string
          payment_intent_id?: string | null
          sponsor_id: string
          start_date: string
          status?: Database["public"]["Enums"]["order_status"]
          total_price_cents: number
          updated_at?: string
        }
        Update: {
          ad_id?: string | null
          created_at?: string
          end_date?: string
          id?: string
          invoice_url?: string | null
          package_id?: string
          payment_intent_id?: string | null
          sponsor_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_price_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "ad_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "ad_sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          order_id: string
          payment_type: string
          status: string | null
          store_id: string | null
          stripe_payment_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          order_id: string
          payment_type: string
          status?: string | null
          store_id?: string | null
          stripe_payment_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          order_id?: string
          payment_type?: string
          status?: string | null
          store_id?: string | null
          stripe_payment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      store_default_content: {
        Row: {
          content_type: string
          content_url: string
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          store_id: string
          title: string | null
        }
        Insert: {
          content_type: string
          content_url: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          store_id: string
          title?: string | null
        }
        Update: {
          content_type?: string
          content_url?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          store_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_default_content_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          ad_categories: Database["public"]["Enums"]["ad_category"][]
          address: string
          bank_account_name: string | null
          bank_account_number: string | null
          bank_routing_number: string | null
          city: string
          closing_time: string
          country: string
          created_at: string
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          opening_time: string
          state: string
          store_name: string
          store_type: Database["public"]["Enums"]["store_category"]
          tv_device_id: string | null
          updated_at: string
          user_id: string
          zip_code: string
        }
        Insert: {
          ad_categories?: Database["public"]["Enums"]["ad_category"][]
          address: string
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_routing_number?: string | null
          city: string
          closing_time?: string
          country?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          opening_time?: string
          state: string
          store_name: string
          store_type?: Database["public"]["Enums"]["store_category"]
          tv_device_id?: string | null
          updated_at?: string
          user_id: string
          zip_code: string
        }
        Update: {
          ad_categories?: Database["public"]["Enums"]["ad_category"][]
          address?: string
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_routing_number?: string | null
          city?: string
          closing_time?: string
          country?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          opening_time?: string
          state?: string
          store_name?: string
          store_type?: Database["public"]["Enums"]["store_category"]
          tv_device_id?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      mark_ad_played: {
        Args: { _schedule_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      ad_category:
        | "food"
        | "retail"
        | "health"
        | "beauty"
        | "automotive"
        | "entertainment"
        | "technology"
        | "real_estate"
        | "services"
        | "other"
      app_role: "admin" | "moderator" | "user"
      order_status:
        | "pending"
        | "approved"
        | "rejected"
        | "active"
        | "completed"
        | "cancelled"
      package_type: "monthly" | "yearly"
      store_category:
        | "restaurant"
        | "retail"
        | "grocery"
        | "pharmacy"
        | "salon"
        | "gym"
        | "medical"
        | "automotive"
        | "entertainment"
        | "other"
      user_type: "store" | "ad_sponsor" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ad_category: [
        "food",
        "retail",
        "health",
        "beauty",
        "automotive",
        "entertainment",
        "technology",
        "real_estate",
        "services",
        "other",
      ],
      app_role: ["admin", "moderator", "user"],
      order_status: [
        "pending",
        "approved",
        "rejected",
        "active",
        "completed",
        "cancelled",
      ],
      package_type: ["monthly", "yearly"],
      store_category: [
        "restaurant",
        "retail",
        "grocery",
        "pharmacy",
        "salon",
        "gym",
        "medical",
        "automotive",
        "entertainment",
        "other",
      ],
      user_type: ["store", "ad_sponsor", "admin"],
    },
  },
} as const
