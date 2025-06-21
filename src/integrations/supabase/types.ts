export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      bookmarks: {
        Row: {
          content_description: string | null
          content_id: string
          content_metadata: Json | null
          content_title: string
          content_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_description?: string | null
          content_id: string
          content_metadata?: Json | null
          content_title: string
          content_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_description?: string | null
          content_id?: string
          content_metadata?: Json | null
          content_title?: string
          content_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      Community: {
        Row: {
          created_at: string
          "First Name": string | null
          id: number
        }
        Insert: {
          created_at?: string
          "First Name"?: string | null
          id?: number
        }
        Update: {
          created_at?: string
          "First Name"?: string | null
          id?: number
        }
        Relationships: []
      }
      community_members: {
        Row: {
          company: string | null
          contact: string | null
          created_at: string
          description: string
          experience: string
          experience_tiles: Json | null
          id: string
          image: string | null
          is_anonymous: boolean
          location: string
          name: string
          specialties: string[]
          title: string
          updated_at: string
          website: string | null
        }
        Insert: {
          company?: string | null
          contact?: string | null
          created_at?: string
          description: string
          experience: string
          experience_tiles?: Json | null
          id?: string
          image?: string | null
          is_anonymous?: boolean
          location: string
          name: string
          specialties?: string[]
          title: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          company?: string | null
          contact?: string | null
          created_at?: string
          description?: string
          experience?: string
          experience_tiles?: Json | null
          id?: string
          image?: string | null
          is_anonymous?: boolean
          location?: string
          name?: string
          specialties?: string[]
          title?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      content_bodies: {
        Row: {
          body_markdown: string | null
          body_text: string
          content_id: string | null
          content_type: string | null
          created_at: string
          id: string
          question: string | null
          section_id: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          body_markdown?: string | null
          body_text: string
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          id?: string
          question?: string | null
          section_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          body_markdown?: string | null
          body_text?: string
          content_id?: string | null
          content_type?: string | null
          created_at?: string
          id?: string
          question?: string | null
          section_id?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_bodies_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_bodies_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "content_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      content_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      content_company_profiles: {
        Row: {
          annual_revenue: string | null
          business_model: string | null
          company_logo: string | null
          company_name: string
          content_id: string | null
          created_at: string
          employee_count: number | null
          entry_date: string | null
          founder_count: number | null
          gross_margin: string | null
          id: string
          industry: string | null
          is_profitable: boolean | null
          monthly_revenue: string | null
          origin_country: string | null
          startup_costs: string | null
          target_market: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          annual_revenue?: string | null
          business_model?: string | null
          company_logo?: string | null
          company_name: string
          content_id?: string | null
          created_at?: string
          employee_count?: number | null
          entry_date?: string | null
          founder_count?: number | null
          gross_margin?: string | null
          id?: string
          industry?: string | null
          is_profitable?: boolean | null
          monthly_revenue?: string | null
          origin_country?: string | null
          startup_costs?: string | null
          target_market?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          annual_revenue?: string | null
          business_model?: string | null
          company_logo?: string | null
          company_name?: string
          content_id?: string | null
          created_at?: string
          employee_count?: number | null
          entry_date?: string | null
          founder_count?: number | null
          gross_margin?: string | null
          id?: string
          industry?: string | null
          is_profitable?: boolean | null
          monthly_revenue?: string | null
          origin_country?: string | null
          startup_costs?: string | null
          target_market?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_company_profiles_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_founders: {
        Row: {
          bio: string | null
          content_id: string | null
          created_at: string
          id: string
          image: string | null
          is_primary: boolean | null
          name: string
          social_instagram: string | null
          social_linkedin: string | null
          social_twitter: string | null
          social_youtube: string | null
          title: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          content_id?: string | null
          created_at?: string
          id?: string
          image?: string | null
          is_primary?: boolean | null
          name: string
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          content_id?: string | null
          created_at?: string
          id?: string
          image?: string | null
          is_primary?: boolean | null
          name?: string
          social_instagram?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_founders_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      content_items: {
        Row: {
          category_id: string | null
          content_type: string
          created_at: string
          featured: boolean | null
          id: string
          meta_description: string | null
          meta_keywords: string[] | null
          publish_date: string | null
          read_time: number | null
          sector_tags: string[] | null
          slug: string
          status: string
          subtitle: string | null
          title: string
          updated_at: string
          view_count: number | null
        }
        Insert: {
          category_id?: string | null
          content_type?: string
          created_at?: string
          featured?: boolean | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          publish_date?: string | null
          read_time?: number | null
          sector_tags?: string[] | null
          slug: string
          status?: string
          subtitle?: string | null
          title: string
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          category_id?: string | null
          content_type?: string
          created_at?: string
          featured?: boolean | null
          id?: string
          meta_description?: string | null
          meta_keywords?: string[] | null
          publish_date?: string | null
          read_time?: number | null
          sector_tags?: string[] | null
          slug?: string
          status?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "content_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      content_sections: {
        Row: {
          content_id: string | null
          created_at: string
          id: string
          is_active: boolean | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          content_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_sections_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendees: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          location: string
          organizer: string
          time: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          attendees?: number
          category: string
          created_at?: string
          date: string
          description: string
          id?: string
          location: string
          organizer: string
          time: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          attendees?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          location?: string
          organizer?: string
          time?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      industry_sectors: {
        Row: {
          content_keywords: string[]
          created_at: string
          description: string
          event_keywords: string[]
          featured: boolean
          hero_description: string
          hero_title: string
          id: string
          industries: string[]
          keywords: string[]
          lead_keywords: string[]
          name: string
          service_keywords: string[]
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          content_keywords?: string[]
          created_at?: string
          description: string
          event_keywords?: string[]
          featured?: boolean
          hero_description: string
          hero_title: string
          id?: string
          industries?: string[]
          keywords?: string[]
          lead_keywords?: string[]
          name: string
          service_keywords?: string[]
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          content_keywords?: string[]
          created_at?: string
          description?: string
          event_keywords?: string[]
          featured?: boolean
          hero_description?: string
          hero_title?: string
          id?: string
          industries?: string[]
          keywords?: string[]
          lead_keywords?: string[]
          name?: string
          service_keywords?: string[]
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      innovation_ecosystem: {
        Row: {
          basic_info: string | null
          contact: string | null
          contact_persons: Json | null
          created_at: string
          description: string
          employees: string
          experience_tiles: Json | null
          founded: string
          id: string
          location: string
          logo: string | null
          name: string
          services: string[]
          updated_at: string
          website: string | null
          why_work_with_us: string | null
        }
        Insert: {
          basic_info?: string | null
          contact?: string | null
          contact_persons?: Json | null
          created_at?: string
          description: string
          employees: string
          experience_tiles?: Json | null
          founded: string
          id?: string
          location: string
          logo?: string | null
          name: string
          services?: string[]
          updated_at?: string
          website?: string | null
          why_work_with_us?: string | null
        }
        Update: {
          basic_info?: string | null
          contact?: string | null
          contact_persons?: Json | null
          created_at?: string
          description?: string
          employees?: string
          experience_tiles?: Json | null
          founded?: string
          id?: string
          location?: string
          logo?: string | null
          name?: string
          services?: string[]
          updated_at?: string
          website?: string | null
          why_work_with_us?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          category: string
          contact_email: string | null
          created_at: string
          currency: string | null
          data_quality_score: number | null
          description: string
          file_url: string | null
          id: string
          industry: string
          last_updated: string | null
          location: string
          name: string
          preview_url: string | null
          price: number | null
          provider_name: string | null
          record_count: number | null
          tags: string[] | null
          type: string
          updated_at: string
        }
        Insert: {
          category: string
          contact_email?: string | null
          created_at?: string
          currency?: string | null
          data_quality_score?: number | null
          description: string
          file_url?: string | null
          id?: string
          industry: string
          last_updated?: string | null
          location: string
          name: string
          preview_url?: string | null
          price?: number | null
          provider_name?: string | null
          record_count?: number | null
          tags?: string[] | null
          type: string
          updated_at?: string
        }
        Update: {
          category?: string
          contact_email?: string | null
          created_at?: string
          currency?: string | null
          data_quality_score?: number | null
          description?: string
          file_url?: string | null
          id?: string
          industry?: string
          last_updated?: string | null
          location?: string
          name?: string
          preview_url?: string | null
          price?: number | null
          provider_name?: string | null
          record_count?: number | null
          tags?: string[] | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          location: string | null
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          location?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          location?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          basic_info: string | null
          contact: string | null
          contact_persons: Json | null
          created_at: string
          description: string
          employees: string
          experience_tiles: Json | null
          founded: string
          id: string
          location: string
          logo: string | null
          name: string
          services: string[]
          updated_at: string
          website: string | null
          why_work_with_us: string | null
        }
        Insert: {
          basic_info?: string | null
          contact?: string | null
          contact_persons?: Json | null
          created_at?: string
          description: string
          employees: string
          experience_tiles?: Json | null
          founded: string
          id?: string
          location: string
          logo?: string | null
          name: string
          services?: string[]
          updated_at?: string
          website?: string | null
          why_work_with_us?: string | null
        }
        Update: {
          basic_info?: string | null
          contact?: string | null
          contact_persons?: Json | null
          created_at?: string
          description?: string
          employees?: string
          experience_tiles?: Json | null
          founded?: string
          id?: string
          location?: string
          logo?: string | null
          name?: string
          services?: string[]
          updated_at?: string
          website?: string | null
          why_work_with_us?: string | null
        }
        Relationships: []
      }
      trade_investment_agencies: {
        Row: {
          basic_info: string | null
          contact: string | null
          contact_persons: Json | null
          created_at: string
          description: string
          employees: string
          experience_tiles: Json | null
          founded: string
          id: string
          location: string
          logo: string | null
          name: string
          services: string[]
          updated_at: string
          website: string | null
          why_work_with_us: string | null
        }
        Insert: {
          basic_info?: string | null
          contact?: string | null
          contact_persons?: Json | null
          created_at?: string
          description: string
          employees: string
          experience_tiles?: Json | null
          founded: string
          id?: string
          location: string
          logo?: string | null
          name: string
          services?: string[]
          updated_at?: string
          website?: string | null
          why_work_with_us?: string | null
        }
        Update: {
          basic_info?: string | null
          contact?: string | null
          contact_persons?: Json | null
          created_at?: string
          description?: string
          employees?: string
          experience_tiles?: Json | null
          founded?: string
          id?: string
          location?: string
          logo?: string | null
          name?: string
          services?: string[]
          updated_at?: string
          website?: string | null
          why_work_with_us?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          tier: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          tier?: Database["public"]["Enums"]["subscription_tier"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_usage: {
        Row: {
          content_type: string
          id: string
          item_id: string
          session_id: string
          viewed_at: string | null
        }
        Insert: {
          content_type: string
          id?: string
          item_id: string
          session_id: string
          viewed_at?: string | null
        }
        Update: {
          content_type?: string
          id?: string
          item_id?: string
          session_id?: string
          viewed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      subscription_tier: "free" | "premium" | "concierge"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      subscription_tier: ["free", "premium", "concierge"],
    },
  },
} as const
