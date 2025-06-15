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
    Enums: {},
  },
} as const
