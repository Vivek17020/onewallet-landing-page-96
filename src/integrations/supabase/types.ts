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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      affiliate_products: {
        Row: {
          affiliate_url: string
          category_id: string | null
          commission_rate: number | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          price: number | null
          updated_at: string
        }
        Insert: {
          affiliate_url: string
          category_id?: string | null
          commission_rate?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          price?: number | null
          updated_at?: string
        }
        Update: {
          affiliate_url?: string
          category_id?: string | null
          commission_rate?: number | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      article_likes: {
        Row: {
          article_id: string
          created_at: string
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_likes_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_shares: {
        Row: {
          article_id: string
          created_at: string
          id: string
          ip_address: string | null
          platform: string
          user_id: string | null
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          platform: string
          user_id?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          platform?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_shares_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          ads_enabled: boolean | null
          affiliate_products_enabled: boolean | null
          author_id: string | null
          breaking_news: boolean | null
          category_id: string | null
          comments_count: number | null
          content: string
          created_at: string
          excerpt: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          is_premium: boolean | null
          likes_count: number | null
          meta_description: string | null
          meta_title: string | null
          premium_preview_length: number | null
          published: boolean
          published_at: string | null
          shares_count: number | null
          slug: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          ads_enabled?: boolean | null
          affiliate_products_enabled?: boolean | null
          author_id?: string | null
          breaking_news?: boolean | null
          category_id?: string | null
          comments_count?: number | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          likes_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          premium_preview_length?: number | null
          published?: boolean
          published_at?: string | null
          shares_count?: number | null
          slug: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          ads_enabled?: boolean | null
          affiliate_products_enabled?: boolean | null
          author_id?: string | null
          breaking_news?: boolean | null
          category_id?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          likes_count?: number | null
          meta_description?: string | null
          meta_title?: string | null
          premium_preview_length?: number | null
          published?: boolean
          published_at?: string | null
          shares_count?: number | null
          slug?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          article_id: string
          author_email: string | null
          author_name: string | null
          content: string
          created_at: string
          id: string
          is_approved: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          article_id: string
          author_email?: string | null
          author_name?: string | null
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          article_id?: string
          author_email?: string | null
          author_name?: string | null
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_trending_scores: {
        Row: {
          article_id: string
          comments_24h: number | null
          date: string
          id: string
          likes_24h: number | null
          score: number
          shares_24h: number | null
          views_24h: number | null
        }
        Insert: {
          article_id: string
          comments_24h?: number | null
          date?: string
          id?: string
          likes_24h?: number | null
          score?: number
          shares_24h?: number | null
          views_24h?: number | null
        }
        Update: {
          article_id?: string
          comments_24h?: number | null
          date?: string
          id?: string
          likes_24h?: number | null
          score?: number
          shares_24h?: number | null
          views_24h?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_trending_scores_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      monetization_analytics: {
        Row: {
          article_id: string | null
          created_at: string
          currency: string | null
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          revenue_amount: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          currency?: string | null
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          revenue_amount?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          article_id?: string | null
          created_at?: string
          currency?: string | null
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          revenue_amount?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monetization_analytics_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_preferences: {
        Row: {
          active: boolean
          categories: string[] | null
          created_at: string
          email: string
          frequency: string
          id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active?: boolean
          categories?: string[] | null
          created_at?: string
          email: string
          frequency?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active?: boolean
          categories?: string[] | null
          created_at?: string
          email?: string
          frequency?: string
          id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          status: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      transaction_notifications: {
        Row: {
          id: string
          notification_type: string
          sent_at: string
          transaction_hash: string
          user_id: string
        }
        Insert: {
          id?: string
          notification_type: string
          sent_at?: string
          transaction_hash: string
          user_id: string
        }
        Update: {
          id?: string
          notification_type?: string
          sent_at?: string
          transaction_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      user_analytics: {
        Row: {
          article_id: string | null
          browser: string | null
          click_target: string | null
          created_at: string
          device_type: string | null
          event_type: string
          id: string
          location_country: string | null
          metadata: Json | null
          page_url: string | null
          scroll_depth: number | null
          session_id: string | null
          time_spent: number | null
          user_id: string | null
        }
        Insert: {
          article_id?: string | null
          browser?: string | null
          click_target?: string | null
          created_at?: string
          device_type?: string | null
          event_type: string
          id?: string
          location_country?: string | null
          metadata?: Json | null
          page_url?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          time_spent?: number | null
          user_id?: string | null
        }
        Update: {
          article_id?: string | null
          browser?: string | null
          click_target?: string | null
          created_at?: string
          device_type?: string | null
          event_type?: string
          id?: string
          location_country?: string | null
          metadata?: Json | null
          page_url?: string | null
          scroll_depth?: number | null
          session_id?: string | null
          time_spent?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          preferred_categories: string[] | null
          preferred_tags: string[] | null
          reading_frequency: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          preferred_categories?: string[] | null
          preferred_tags?: string[] | null
          reading_frequency?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          preferred_categories?: string[] | null
          preferred_tags?: string[] | null
          reading_frequency?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_reading_history: {
        Row: {
          article_id: string
          id: string
          ip_address: string | null
          read_at: string
          read_percentage: number | null
          reading_duration: number | null
          user_id: string | null
        }
        Insert: {
          article_id: string
          id?: string
          ip_address?: string | null
          read_at?: string
          read_percentage?: number | null
          reading_duration?: number | null
          user_id?: string | null
        }
        Update: {
          article_id?: string
          id?: string
          ip_address?: string | null
          read_at?: string
          read_percentage?: number | null
          reading_duration?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reading_history_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          default_currency: string
          email_notifications: boolean
          id: string
          notifications_enabled: boolean
          price_alerts: boolean
          theme: string
          transaction_alerts: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_currency?: string
          email_notifications?: boolean
          id?: string
          notifications_enabled?: boolean
          price_alerts?: boolean
          theme?: string
          transaction_alerts?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_currency?: string
          email_notifications?: boolean
          id?: string
          notifications_enabled?: boolean
          price_alerts?: boolean
          theme?: string
          transaction_alerts?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vapid_config: {
        Row: {
          created_at: string
          id: string
          private_key: string
          public_key: string
        }
        Insert: {
          created_at?: string
          id?: string
          private_key: string
          public_key: string
        }
        Update: {
          created_at?: string
          id?: string
          private_key?: string
          public_key?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
