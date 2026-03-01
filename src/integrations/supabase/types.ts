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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agency_contacts: {
        Row: {
          agency_id: string | null
          avatar_url: string | null
          created_at: string | null
          display_order: number | null
          email: string | null
          full_name: string
          id: string
          is_primary: boolean | null
          linkedin_url: string | null
          phone: string | null
          title: string | null
        }
        Insert: {
          agency_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          display_order?: number | null
          email?: string | null
          full_name: string
          id?: string
          is_primary?: boolean | null
          linkedin_url?: string | null
          phone?: string | null
          title?: string | null
        }
        Update: {
          agency_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          display_order?: number | null
          email?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean | null
          linkedin_url?: string | null
          phone?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_contacts_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_report_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_contacts_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "trade_investment_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      agency_resources: {
        Row: {
          agency_id: string | null
          created_at: string | null
          deadline_date: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_value_aud: number | null
          resource_type: string | null
          title: string
          url: string | null
        }
        Insert: {
          agency_id?: string | null
          created_at?: string | null
          deadline_date?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_value_aud?: number | null
          resource_type?: string | null
          title: string
          url?: string | null
        }
        Update: {
          agency_id?: string | null
          created_at?: string | null
          deadline_date?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_value_aud?: number | null
          resource_type?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agency_resources_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "agencies_report_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agency_resources_agency_id_fkey"
            columns: ["agency_id"]
            isOneToOne: false
            referencedRelation: "trade_investment_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
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
          associated_countries: string[] | null
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
          location_id: string | null
          name: string
          origin_country: string | null
          specialties: string[]
          title: string
          updated_at: string
          website: string | null
        }
        Insert: {
          associated_countries?: string[] | null
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
          location_id?: string | null
          name: string
          origin_country?: string | null
          specialties?: string[]
          title: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          associated_countries?: string[] | null
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
          location_id?: string | null
          name?: string
          origin_country?: string | null
          specialties?: string[]
          title?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_members_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
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
          outcome: string | null
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
          outcome?: string | null
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
          outcome?: string | null
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
      countries: {
        Row: {
          content_keywords: string[]
          created_at: string
          description: string
          economic_indicators: Json | null
          event_keywords: string[]
          featured: boolean
          hero_description: string
          hero_title: string
          id: string
          key_industries: string[]
          keywords: string[]
          lead_keywords: string[]
          location_type: string
          name: string
          service_keywords: string[]
          slug: string
          sort_order: number | null
          trade_relationship_strength: string | null
          updated_at: string
        }
        Insert: {
          content_keywords?: string[]
          created_at?: string
          description: string
          economic_indicators?: Json | null
          event_keywords?: string[]
          featured?: boolean
          hero_description: string
          hero_title: string
          id?: string
          key_industries?: string[]
          keywords?: string[]
          lead_keywords?: string[]
          location_type?: string
          name: string
          service_keywords?: string[]
          slug: string
          sort_order?: number | null
          trade_relationship_strength?: string | null
          updated_at?: string
        }
        Update: {
          content_keywords?: string[]
          created_at?: string
          description?: string
          economic_indicators?: Json | null
          event_keywords?: string[]
          featured?: boolean
          hero_description?: string
          hero_title?: string
          id?: string
          key_industries?: string[]
          keywords?: string[]
          lead_keywords?: string[]
          location_type?: string
          name?: string
          service_keywords?: string[]
          slug?: string
          sort_order?: number | null
          trade_relationship_strength?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      country_trade_organizations: {
        Row: {
          basic_info: string | null
          contact: string | null
          contact_persons: Json | null
          country_id: string | null
          created_at: string
          description: string
          employees: string
          experience_tiles: Json | null
          founded: string
          id: string
          location: string
          logo: string | null
          name: string
          organization_type: string
          services: string[]
          updated_at: string
          website: string | null
          why_work_with_us: string | null
        }
        Insert: {
          basic_info?: string | null
          contact?: string | null
          contact_persons?: Json | null
          country_id?: string | null
          created_at?: string
          description: string
          employees: string
          experience_tiles?: Json | null
          founded: string
          id?: string
          location: string
          logo?: string | null
          name: string
          organization_type?: string
          services?: string[]
          updated_at?: string
          website?: string | null
          why_work_with_us?: string | null
        }
        Update: {
          basic_info?: string | null
          contact?: string | null
          contact_persons?: Json | null
          country_id?: string | null
          created_at?: string
          description?: string
          employees?: string
          experience_tiles?: Json | null
          founded?: string
          id?: string
          location?: string
          logo?: string | null
          name?: string
          organization_type?: string
          services?: string[]
          updated_at?: string
          website?: string | null
          why_work_with_us?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "country_trade_organizations_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      directory_submissions: {
        Row: {
          contact_email: string
          created_at: string
          form_data: Json
          id: string
          status: string
          submission_type: string
          updated_at: string
        }
        Insert: {
          contact_email: string
          created_at?: string
          form_data?: Json
          id?: string
          status?: string
          submission_type: string
          updated_at?: string
        }
        Update: {
          contact_email?: string
          created_at?: string
          form_data?: Json
          id?: string
          status?: string
          submission_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
          updated_at?: string
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
          event_logo_url: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          location: string
          location_id: string | null
          organizer: string
          organizer_email: string | null
          organizer_website: string | null
          price: string | null
          registration_url: string | null
          sector: string | null
          slug: string
          tags: string[] | null
          time: string
          title: string
          type: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          attendees?: number
          category: string
          created_at?: string
          date: string
          description: string
          event_logo_url?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          location: string
          location_id?: string | null
          organizer: string
          organizer_email?: string | null
          organizer_website?: string | null
          price?: string | null
          registration_url?: string | null
          sector?: string | null
          slug: string
          tags?: string[] | null
          time: string
          title: string
          type: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          attendees?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          event_logo_url?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          location?: string
          location_id?: string | null
          organizer?: string
          organizer_email?: string | null
          organizer_website?: string | null
          price?: string | null
          registration_url?: string | null
          sector?: string | null
          slug?: string
          tags?: string[] | null
          time?: string
          title?: string
          type?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
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
          location_id: string | null
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
          location_id?: string | null
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
          location_id?: string | null
          logo?: string | null
          name?: string
          services?: string[]
          updated_at?: string
          website?: string | null
          why_work_with_us?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "innovation_ecosystem_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      investors: {
        Row: {
          basic_info: string | null
          check_size_max: number | null
          check_size_min: number | null
          contact_email: string | null
          contact_name: string | null
          created_at: string | null
          description: string
          details: Json | null
          id: string
          investor_type: string
          is_featured: boolean | null
          linkedin_url: string | null
          location: string
          logo: string | null
          name: string
          sector_focus: string[] | null
          stage_focus: string[] | null
          updated_at: string | null
          website: string | null
          why_work_with_us: string | null
        }
        Insert: {
          basic_info?: string | null
          check_size_max?: number | null
          check_size_min?: number | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          description: string
          details?: Json | null
          id?: string
          investor_type: string
          is_featured?: boolean | null
          linkedin_url?: string | null
          location: string
          logo?: string | null
          name: string
          sector_focus?: string[] | null
          stage_focus?: string[] | null
          updated_at?: string | null
          website?: string | null
          why_work_with_us?: string | null
        }
        Update: {
          basic_info?: string | null
          check_size_max?: number | null
          check_size_min?: number | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string | null
          description?: string
          details?: Json | null
          id?: string
          investor_type?: string
          is_featured?: boolean | null
          linkedin_url?: string | null
          location?: string
          logo?: string | null
          name?: string
          sector_focus?: string[] | null
          stage_focus?: string[] | null
          updated_at?: string | null
          website?: string | null
          why_work_with_us?: string | null
        }
        Relationships: []
      }
      lead_database_records: {
        Row: {
          buying_signals: string[] | null
          city: string | null
          company_description: string | null
          company_name: string | null
          contact_name: string | null
          country: string | null
          created_at: string | null
          email: string | null
          employee_count_range: string | null
          founded_year: number | null
          id: string
          is_preview: boolean | null
          job_title: string | null
          lead_database_id: string | null
          linkedin_url: string | null
          location: string | null
          notes: string | null
          phone: string | null
          revenue_range: string | null
          sector: string | null
          state: string | null
          technologies_used: string[] | null
          website_url: string | null
        }
        Insert: {
          buying_signals?: string[] | null
          city?: string | null
          company_description?: string | null
          company_name?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          employee_count_range?: string | null
          founded_year?: number | null
          id?: string
          is_preview?: boolean | null
          job_title?: string | null
          lead_database_id?: string | null
          linkedin_url?: string | null
          location?: string | null
          notes?: string | null
          phone?: string | null
          revenue_range?: string | null
          sector?: string | null
          state?: string | null
          technologies_used?: string[] | null
          website_url?: string | null
        }
        Update: {
          buying_signals?: string[] | null
          city?: string | null
          company_description?: string | null
          company_name?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          employee_count_range?: string | null
          founded_year?: number | null
          id?: string
          is_preview?: boolean | null
          job_title?: string | null
          lead_database_id?: string | null
          linkedin_url?: string | null
          location?: string | null
          notes?: string | null
          phone?: string | null
          revenue_range?: string | null
          sector?: string | null
          state?: string | null
          technologies_used?: string[] | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_database_records_lead_database_id_fkey"
            columns: ["lead_database_id"]
            isOneToOne: false
            referencedRelation: "lead_databases"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_databases: {
        Row: {
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          is_free: boolean | null
          last_updated: string | null
          list_type: string | null
          location: string | null
          preview_available: boolean | null
          price_aud: number | null
          provider_logo_url: string | null
          provider_name: string | null
          quality_score: number | null
          record_count: number | null
          sample_fields: string[] | null
          sector: string | null
          short_description: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_free?: boolean | null
          last_updated?: string | null
          list_type?: string | null
          location?: string | null
          preview_available?: boolean | null
          price_aud?: number | null
          provider_logo_url?: string | null
          provider_name?: string | null
          quality_score?: number | null
          record_count?: number | null
          sample_fields?: string[] | null
          sector?: string | null
          short_description?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_free?: boolean | null
          last_updated?: string | null
          list_type?: string | null
          location?: string | null
          preview_available?: boolean | null
          price_aud?: number | null
          provider_logo_url?: string | null
          provider_name?: string | null
          quality_score?: number | null
          record_count?: number | null
          sample_fields?: string[] | null
          sector?: string | null
          short_description?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lead_submissions: {
        Row: {
          company_website: string | null
          created_at: string
          email: string
          id: string
          notes: string | null
          phone: string
          sector: string
          status: string | null
          target_market: string
          updated_at: string
        }
        Insert: {
          company_website?: string | null
          created_at?: string
          email: string
          id?: string
          notes?: string | null
          phone: string
          sector: string
          status?: string | null
          target_market: string
          updated_at?: string
        }
        Update: {
          company_website?: string | null
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
          phone?: string
          sector?: string
          status?: string | null
          target_market?: string
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
      lemlist_companies: {
        Row: {
          created_at: string
          domain: string | null
          fields: Json | null
          id: string
          industry: string | null
          lemlist_created_at: string | null
          lemlist_id: string
          linkedin_url: string | null
          location: string | null
          name: string
          owner_id: string | null
          size: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          fields?: Json | null
          id?: string
          industry?: string | null
          lemlist_created_at?: string | null
          lemlist_id: string
          linkedin_url?: string | null
          location?: string | null
          name: string
          owner_id?: string | null
          size?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          fields?: Json | null
          id?: string
          industry?: string | null
          lemlist_created_at?: string | null
          lemlist_id?: string
          linkedin_url?: string | null
          location?: string | null
          name?: string
          owner_id?: string | null
          size?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lemlist_contacts: {
        Row: {
          campaigns: Json | null
          client: string | null
          company_id: string | null
          company_name: string | null
          company_website: string | null
          contact_location: string | null
          created_at: string
          email: string | null
          email_status: string | null
          fields: Json | null
          first_contacted_date: string | null
          first_name: string | null
          full_name: string | null
          hubspot_id: string | null
          id: string
          industry: string | null
          job_title: string | null
          last_contacted_date: string | null
          last_name: string | null
          last_replied_date: string | null
          lead_notes: string | null
          lead_status: string | null
          lemlist_created_at: string | null
          lemlist_id: string
          lifecycle_status: string | null
          linkedin_connection_degree: string | null
          linkedin_description: string | null
          linkedin_followers: number | null
          linkedin_headline: string | null
          linkedin_job_industry: string | null
          linkedin_open: boolean | null
          linkedin_profile_id: string | null
          linkedin_skills: string | null
          linkedin_url: string | null
          linkedin_url_sales_nav: string | null
          location: string | null
          owner_id: string | null
          personal_email: string | null
          phone: string | null
          priority: string | null
          source: string | null
          status: string | null
          summary: string | null
          tagline: string | null
          twitter_profile: string | null
          updated_at: string
        }
        Insert: {
          campaigns?: Json | null
          client?: string | null
          company_id?: string | null
          company_name?: string | null
          company_website?: string | null
          contact_location?: string | null
          created_at?: string
          email?: string | null
          email_status?: string | null
          fields?: Json | null
          first_contacted_date?: string | null
          first_name?: string | null
          full_name?: string | null
          hubspot_id?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          last_contacted_date?: string | null
          last_name?: string | null
          last_replied_date?: string | null
          lead_notes?: string | null
          lead_status?: string | null
          lemlist_created_at?: string | null
          lemlist_id: string
          lifecycle_status?: string | null
          linkedin_connection_degree?: string | null
          linkedin_description?: string | null
          linkedin_followers?: number | null
          linkedin_headline?: string | null
          linkedin_job_industry?: string | null
          linkedin_open?: boolean | null
          linkedin_profile_id?: string | null
          linkedin_skills?: string | null
          linkedin_url?: string | null
          linkedin_url_sales_nav?: string | null
          location?: string | null
          owner_id?: string | null
          personal_email?: string | null
          phone?: string | null
          priority?: string | null
          source?: string | null
          status?: string | null
          summary?: string | null
          tagline?: string | null
          twitter_profile?: string | null
          updated_at?: string
        }
        Update: {
          campaigns?: Json | null
          client?: string | null
          company_id?: string | null
          company_name?: string | null
          company_website?: string | null
          contact_location?: string | null
          created_at?: string
          email?: string | null
          email_status?: string | null
          fields?: Json | null
          first_contacted_date?: string | null
          first_name?: string | null
          full_name?: string | null
          hubspot_id?: string | null
          id?: string
          industry?: string | null
          job_title?: string | null
          last_contacted_date?: string | null
          last_name?: string | null
          last_replied_date?: string | null
          lead_notes?: string | null
          lead_status?: string | null
          lemlist_created_at?: string | null
          lemlist_id?: string
          lifecycle_status?: string | null
          linkedin_connection_degree?: string | null
          linkedin_description?: string | null
          linkedin_followers?: number | null
          linkedin_headline?: string | null
          linkedin_job_industry?: string | null
          linkedin_open?: boolean | null
          linkedin_profile_id?: string | null
          linkedin_skills?: string | null
          linkedin_url?: string | null
          linkedin_url_sales_nav?: string | null
          location?: string | null
          owner_id?: string | null
          personal_email?: string | null
          phone?: string | null
          priority?: string | null
          source?: string | null
          status?: string | null
          summary?: string | null
          tagline?: string | null
          twitter_profile?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lemlist_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "lemlist_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          active: boolean
          business_environment_score: number | null
          content_keywords: string[]
          country: string
          created_at: string
          description: string
          economic_indicators: Json | null
          event_keywords: string[]
          featured: boolean
          government_agency_contact: string | null
          government_agency_name: string | null
          government_agency_website: string | null
          hero_description: string
          hero_title: string
          id: string
          key_industries: string[]
          keywords: string[]
          lead_keywords: string[]
          location_type: string
          name: string
          parent_location: string | null
          parent_location_id: string | null
          population: number | null
          service_keywords: string[]
          slug: string
          sort_order: number | null
          startup_ecosystem_strength: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          business_environment_score?: number | null
          content_keywords?: string[]
          country?: string
          created_at?: string
          description: string
          economic_indicators?: Json | null
          event_keywords?: string[]
          featured?: boolean
          government_agency_contact?: string | null
          government_agency_name?: string | null
          government_agency_website?: string | null
          hero_description: string
          hero_title: string
          id?: string
          key_industries?: string[]
          keywords?: string[]
          lead_keywords?: string[]
          location_type: string
          name: string
          parent_location?: string | null
          parent_location_id?: string | null
          population?: number | null
          service_keywords?: string[]
          slug: string
          sort_order?: number | null
          startup_ecosystem_strength?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          business_environment_score?: number | null
          content_keywords?: string[]
          country?: string
          created_at?: string
          description?: string
          economic_indicators?: Json | null
          event_keywords?: string[]
          featured?: boolean
          government_agency_contact?: string | null
          government_agency_name?: string | null
          government_agency_website?: string | null
          hero_description?: string
          hero_title?: string
          id?: string
          key_industries?: string[]
          keywords?: string[]
          lead_keywords?: string[]
          location_type?: string
          name?: string
          parent_location?: string | null
          parent_location_id?: string | null
          population?: number | null
          service_keywords?: string[]
          slug?: string
          sort_order?: number | null
          startup_ecosystem_strength?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_parent_location_id_fkey"
            columns: ["parent_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      market_entry_reports: {
        Row: {
          created_at: string
          created_by_team_member: string | null
          delivered_at: string | null
          description: string | null
          file_url: string | null
          id: string
          metadata: Json | null
          report_type: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_team_member?: string | null
          delivered_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          report_type?: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_team_member?: string | null
          delivered_at?: string | null
          description?: string | null
          file_url?: string | null
          id?: string
          metadata?: Json | null
          report_type?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      MES: {
        Row: {
          archived: boolean | null
          attrs: Json | null
          created_time: string | null
          id: string | null
          last_edited_time: string | null
          url: string | null
        }
        Insert: {
          archived?: boolean | null
          attrs?: Json | null
          created_time?: string | null
          id?: string | null
          last_edited_time?: string | null
          url?: string | null
        }
        Update: {
          archived?: boolean | null
          attrs?: Json | null
          created_time?: string | null
          id?: string | null
          last_edited_time?: string | null
          url?: string | null
        }
        Relationships: []
      }
      organisation_categories: {
        Row: {
          colour: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          colour?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          colour?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      payment_webhook_logs: {
        Row: {
          created_at: string | null
          id: string
          parsed: Json | null
          stripe_event_id: string
          stripe_payload: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          parsed?: Json | null
          stripe_event_id: string
          stripe_payload: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          parsed?: Json | null
          stripe_event_id?: string
          stripe_payload?: Json
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
          stripe_customer_id: string | null
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
          stripe_customer_id?: string | null
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
          stripe_customer_id?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      report_templates: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          prompt_body: string
          section_name: string
          updated_at: string
          variables: string[]
          version: number
          visibility_tier: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          prompt_body: string
          section_name: string
          updated_at?: string
          variables?: string[]
          version?: number
          visibility_tier?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          prompt_body?: string
          section_name?: string
          updated_at?: string
          variables?: string[]
          version?: number
          visibility_tier?: string
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
          location_id: string | null
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
          location_id?: string | null
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
          location_id?: string | null
          logo?: string | null
          name?: string
          services?: string[]
          updated_at?: string
          website?: string | null
          why_work_with_us?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          avatar: string | null
          company: string
          country_flag: string
          country_name: string
          created_at: string | null
          id: string
          is_featured: boolean | null
          name: string
          outcome: string
          sort_order: number | null
          testimonial: string
          title: string
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          company: string
          country_flag: string
          country_name: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          name: string
          outcome: string
          sort_order?: number | null
          testimonial: string
          title: string
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          company?: string
          country_flag?: string
          country_name?: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          name?: string
          outcome?: string
          sort_order?: number | null
          testimonial?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trade_investment_agencies: {
        Row: {
          basic_info: string | null
          category_slug: string | null
          contact: string | null
          contact_persons: Json | null
          created_at: string
          description: string
          description_full: string | null
          email: string | null
          employees: string
          experience_tiles: Json | null
          founded: string
          founded_year: string | null
          government_level: string | null
          grants_available: boolean | null
          has_multiple_locations: boolean | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_free_to_access: boolean | null
          is_government_funded: boolean | null
          is_verified: boolean | null
          jurisdiction: string[] | null
          last_updated_at: string | null
          linkedin_url: string | null
          location: string
          location_city: string | null
          location_country: string | null
          location_id: string | null
          location_state: string | null
          logo: string | null
          max_grant_aud: number | null
          membership_fee_aud: number | null
          membership_required: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          organisation_type: string | null
          phone: string | null
          sectors_supported: string[] | null
          services: string[]
          slug: string | null
          support_types: string[] | null
          tagline: string | null
          target_company_origin: string[] | null
          target_company_stage: string[] | null
          updated_at: string
          view_count: number | null
          website: string | null
          website_url: string | null
          why_work_with_us: string | null
        }
        Insert: {
          basic_info?: string | null
          category_slug?: string | null
          contact?: string | null
          contact_persons?: Json | null
          created_at?: string
          description: string
          description_full?: string | null
          email?: string | null
          employees: string
          experience_tiles?: Json | null
          founded: string
          founded_year?: string | null
          government_level?: string | null
          grants_available?: boolean | null
          has_multiple_locations?: boolean | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_free_to_access?: boolean | null
          is_government_funded?: boolean | null
          is_verified?: boolean | null
          jurisdiction?: string[] | null
          last_updated_at?: string | null
          linkedin_url?: string | null
          location: string
          location_city?: string | null
          location_country?: string | null
          location_id?: string | null
          location_state?: string | null
          logo?: string | null
          max_grant_aud?: number | null
          membership_fee_aud?: number | null
          membership_required?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          organisation_type?: string | null
          phone?: string | null
          sectors_supported?: string[] | null
          services?: string[]
          slug?: string | null
          support_types?: string[] | null
          tagline?: string | null
          target_company_origin?: string[] | null
          target_company_stage?: string[] | null
          updated_at?: string
          view_count?: number | null
          website?: string | null
          website_url?: string | null
          why_work_with_us?: string | null
        }
        Update: {
          basic_info?: string | null
          category_slug?: string | null
          contact?: string | null
          contact_persons?: Json | null
          created_at?: string
          description?: string
          description_full?: string | null
          email?: string | null
          employees?: string
          experience_tiles?: Json | null
          founded?: string
          founded_year?: string | null
          government_level?: string | null
          grants_available?: boolean | null
          has_multiple_locations?: boolean | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_free_to_access?: boolean | null
          is_government_funded?: boolean | null
          is_verified?: boolean | null
          jurisdiction?: string[] | null
          last_updated_at?: string | null
          linkedin_url?: string | null
          location?: string
          location_city?: string | null
          location_country?: string | null
          location_id?: string | null
          location_state?: string | null
          logo?: string | null
          max_grant_aud?: number | null
          membership_fee_aud?: number | null
          membership_required?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          organisation_type?: string | null
          phone?: string | null
          sectors_supported?: string[] | null
          services?: string[]
          slug?: string | null
          support_types?: string[] | null
          tagline?: string | null
          target_company_origin?: string[] | null
          target_company_stage?: string[] | null
          updated_at?: string
          view_count?: number | null
          website?: string | null
          website_url?: string | null
          why_work_with_us?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_investment_agencies_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_intake_forms: {
        Row: {
          budget_level: string
          company_name: string
          company_stage: string
          country_of_origin: string
          created_at: string
          employee_count: string
          end_buyer_industries: string[] | null
          end_buyers: Json | null
          enriched_input: Json | null
          id: string
          industry_sector: string[]
          key_challenges: string | null
          known_competitors: Json | null
          primary_goals: string | null
          raw_input: Json
          services_needed: string[]
          status: string
          target_regions: string[]
          timeline: string
          updated_at: string
          user_id: string | null
          website_url: string
        }
        Insert: {
          budget_level: string
          company_name: string
          company_stage: string
          country_of_origin: string
          created_at?: string
          employee_count: string
          end_buyer_industries?: string[] | null
          end_buyers?: Json | null
          enriched_input?: Json | null
          id?: string
          industry_sector: string[]
          key_challenges?: string | null
          known_competitors?: Json | null
          primary_goals?: string | null
          raw_input?: Json
          services_needed?: string[]
          status?: string
          target_regions?: string[]
          timeline: string
          updated_at?: string
          user_id?: string | null
          website_url: string
        }
        Update: {
          budget_level?: string
          company_name?: string
          company_stage?: string
          country_of_origin?: string
          created_at?: string
          employee_count?: string
          end_buyer_industries?: string[] | null
          end_buyers?: Json | null
          enriched_input?: Json | null
          id?: string
          industry_sector?: string[]
          key_challenges?: string | null
          known_competitors?: Json | null
          primary_goals?: string | null
          raw_input?: Json
          services_needed?: string[]
          status?: string
          target_regions?: string[]
          timeline?: string
          updated_at?: string
          user_id?: string | null
          website_url?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          created_at: string
          feedback_notes: string | null
          feedback_score: number | null
          id: string
          intake_form_id: string | null
          report_json: Json
          sections_generated: string[] | null
          share_token: string | null
          status: string
          tier_at_generation: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          feedback_notes?: string | null
          feedback_score?: number | null
          id?: string
          intake_form_id?: string | null
          report_json?: Json
          sections_generated?: string[] | null
          share_token?: string | null
          status?: string
          tier_at_generation?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          feedback_notes?: string | null
          feedback_score?: number | null
          id?: string
          intake_form_id?: string | null
          report_json?: Json
          sections_generated?: string[] | null
          share_token?: string | null
          status?: string
          tier_at_generation?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_reports_intake_form_id_fkey"
            columns: ["intake_form_id"]
            isOneToOne: false
            referencedRelation: "user_intake_forms"
            referencedColumns: ["id"]
          },
        ]
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
      agencies_report_view: {
        Row: {
          basic_info: string | null
          category_colour: string | null
          category_icon: string | null
          category_name: string | null
          category_slug: string | null
          contact: string | null
          contact_persons: Json | null
          description: string | null
          description_full: string | null
          email: string | null
          employees: string | null
          experience_tiles: Json | null
          founded: string | null
          founded_year: string | null
          government_level: string | null
          grants_available: boolean | null
          has_multiple_locations: boolean | null
          id: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_free_to_access: boolean | null
          is_government_funded: boolean | null
          is_verified: boolean | null
          jurisdiction: string[] | null
          last_updated_at: string | null
          linkedin_url: string | null
          location: string | null
          location_city: string | null
          location_country: string | null
          location_state: string | null
          logo: string | null
          max_grant_aud: number | null
          membership_fee_aud: number | null
          membership_required: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string | null
          organisation_type: string | null
          phone: string | null
          primary_contacts: Json | null
          resources: Json | null
          sectors_supported: string[] | null
          services: string[] | null
          slug: string | null
          support_types: string[] | null
          tagline: string | null
          target_company_origin: string[] | null
          target_company_stage: string[] | null
          view_count: number | null
          website: string | null
          website_url: string | null
          why_work_with_us: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      subscription_tier:
        | "free"
        | "premium"
        | "concierge"
        | "growth"
        | "scale"
        | "enterprise"
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
      app_role: ["admin", "moderator", "user"],
      subscription_tier: [
        "free",
        "premium",
        "concierge",
        "growth",
        "scale",
        "enterprise",
      ],
    },
  },
} as const
