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
          is_archived: boolean | null
          is_primary: boolean | null
          linkedin_url: string | null
          mes_relevance_score: number | null
          phone: string | null
          tier: string | null
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
          is_archived?: boolean | null
          is_primary?: boolean | null
          linkedin_url?: string | null
          mes_relevance_score?: number | null
          phone?: string | null
          tier?: string | null
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
          is_archived?: boolean | null
          is_primary?: boolean | null
          linkedin_url?: string | null
          mes_relevance_score?: number | null
          phone?: string | null
          tier?: string | null
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
      case_study_quotes: {
        Row: {
          attributed_to: string
          case_study_id: string
          created_at: string
          display_order: number
          id: string
          quote: string
          role: string | null
          section_id: string | null
          source_label: string | null
          source_url: string | null
          updated_at: string
        }
        Insert: {
          attributed_to: string
          case_study_id: string
          created_at?: string
          display_order?: number
          id?: string
          quote: string
          role?: string | null
          section_id?: string | null
          source_label?: string | null
          source_url?: string | null
          updated_at?: string
        }
        Update: {
          attributed_to?: string
          case_study_id?: string
          created_at?: string
          display_order?: number
          id?: string
          quote?: string
          role?: string | null
          section_id?: string | null
          source_label?: string | null
          source_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_study_quotes_case_study_id_fkey"
            columns: ["case_study_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_study_quotes_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "content_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      case_study_sources: {
        Row: {
          accessed_at: string | null
          case_study_id: string
          citation_number: number | null
          created_at: string
          id: string
          label: string
          section_id: string | null
          source_type: string | null
          updated_at: string
          url: string
        }
        Insert: {
          accessed_at?: string | null
          case_study_id: string
          citation_number?: number | null
          created_at?: string
          id?: string
          label: string
          section_id?: string | null
          source_type?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          accessed_at?: string | null
          case_study_id?: string
          citation_number?: number | null
          created_at?: string
          id?: string
          label?: string
          section_id?: string | null
          source_type?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_study_sources_case_study_id_fkey"
            columns: ["case_study_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_study_sources_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "content_sections"
            referencedColumns: ["id"]
          },
        ]
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
          archetype: string | null
          associated_countries: string[] | null
          company: string | null
          contact: string | null
          created_at: string
          description: string
          experience: string
          experience_tiles: Json | null
          id: string
          image: string | null
          is_active: boolean | null
          is_anonymous: boolean
          is_featured: boolean | null
          location: string
          location_id: string | null
          name: string
          origin_country: string | null
          persona_fit: string[] | null
          slug: string
          specialties: string[]
          title: string
          updated_at: string
          website: string | null
        }
        Insert: {
          archetype?: string | null
          associated_countries?: string[] | null
          company?: string | null
          contact?: string | null
          created_at?: string
          description: string
          experience: string
          experience_tiles?: Json | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_anonymous?: boolean
          is_featured?: boolean | null
          location: string
          location_id?: string | null
          name: string
          origin_country?: string | null
          persona_fit?: string[] | null
          slug: string
          specialties?: string[]
          title: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          archetype?: string | null
          associated_countries?: string[] | null
          company?: string | null
          contact?: string | null
          created_at?: string
          description?: string
          experience?: string
          experience_tiles?: Json | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          is_anonymous?: boolean
          is_featured?: boolean | null
          location?: string
          location_id?: string | null
          name?: string
          origin_country?: string | null
          persona_fit?: string[] | null
          slug?: string
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
          body_images: Json | null
          category_id: string | null
          content_type: string
          created_at: string
          featured: boolean | null
          hero_image_alt: string | null
          hero_image_credit: string | null
          hero_image_url: string | null
          id: string
          last_verified_at: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          publish_date: string | null
          quick_facts: Json | null
          read_time: number | null
          researched_by: string | null
          researched_by_avatar_url: string | null
          sector_tags: string[] | null
          slug: string
          status: string
          style_version: number
          subtitle: string | null
          title: string
          tldr: string[] | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          body_images?: Json | null
          category_id?: string | null
          content_type?: string
          created_at?: string
          featured?: boolean | null
          hero_image_alt?: string | null
          hero_image_credit?: string | null
          hero_image_url?: string | null
          id?: string
          last_verified_at?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          publish_date?: string | null
          quick_facts?: Json | null
          read_time?: number | null
          researched_by?: string | null
          researched_by_avatar_url?: string | null
          sector_tags?: string[] | null
          slug: string
          status?: string
          style_version?: number
          subtitle?: string | null
          title: string
          tldr?: string[] | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          body_images?: Json | null
          category_id?: string | null
          content_type?: string
          created_at?: string
          featured?: boolean | null
          hero_image_alt?: string | null
          hero_image_credit?: string | null
          hero_image_url?: string | null
          id?: string
          last_verified_at?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          publish_date?: string | null
          quick_facts?: Json | null
          read_time?: number | null
          researched_by?: string | null
          researched_by_avatar_url?: string | null
          sector_tags?: string[] | null
          slug?: string
          status?: string
          style_version?: number
          subtitle?: string | null
          title?: string
          tldr?: string[] | null
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
      country_case_studies: {
        Row: {
          company_name: string
          content_item_id: string | null
          country_id: string
          created_at: string | null
          id: string
          logo_color: string | null
          outcome: string
          sector: string
          sort_order: number
          updated_at: string | null
          wordmark: string | null
        }
        Insert: {
          company_name: string
          content_item_id?: string | null
          country_id: string
          created_at?: string | null
          id?: string
          logo_color?: string | null
          outcome: string
          sector: string
          sort_order: number
          updated_at?: string | null
          wordmark?: string | null
        }
        Update: {
          company_name?: string
          content_item_id?: string | null
          country_id?: string
          created_at?: string | null
          id?: string
          logo_color?: string | null
          outcome?: string
          sector?: string
          sort_order?: number
          updated_at?: string | null
          wordmark?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "country_case_studies_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "country_case_studies_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      country_faqs: {
        Row: {
          answer: string
          country_id: string
          created_at: string | null
          id: string
          question: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          answer: string
          country_id: string
          created_at?: string | null
          id?: string
          question: string
          sort_order: number
          updated_at?: string | null
        }
        Update: {
          answer?: string
          country_id?: string
          created_at?: string | null
          id?: string
          question?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "country_faqs_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      country_funding_instruments: {
        Row: {
          body: string
          country_id: string
          created_at: string | null
          id: string
          side: string
          sort_order: number
          tag: string
          title: string
          updated_at: string | null
        }
        Insert: {
          body: string
          country_id: string
          created_at?: string | null
          id?: string
          side: string
          sort_order: number
          tag: string
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          country_id?: string
          created_at?: string | null
          id?: string
          side?: string
          sort_order?: number
          tag?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "country_funding_instruments_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      country_page_content: {
        Row: {
          country_id: string
          created_at: string | null
          differentiators: Json
          featured_city_slugs: string[] | null
          hero_badge: string | null
          hero_headline: string
          hero_subhead: string
          hero_trust_companies: string[] | null
          hero_trust_extra: number | null
          live_snapshot: Json | null
          narrative_bullets: Json
          pull_quote: string | null
          pull_quote_attr: string | null
          updated_at: string | null
        }
        Insert: {
          country_id: string
          created_at?: string | null
          differentiators?: Json
          featured_city_slugs?: string[] | null
          hero_badge?: string | null
          hero_headline: string
          hero_subhead: string
          hero_trust_companies?: string[] | null
          hero_trust_extra?: number | null
          live_snapshot?: Json | null
          narrative_bullets?: Json
          pull_quote?: string | null
          pull_quote_attr?: string | null
          updated_at?: string | null
        }
        Update: {
          country_id?: string
          created_at?: string | null
          differentiators?: Json
          featured_city_slugs?: string[] | null
          hero_badge?: string | null
          hero_headline?: string
          hero_subhead?: string
          hero_trust_companies?: string[] | null
          hero_trust_extra?: number | null
          live_snapshot?: Json | null
          narrative_bullets?: Json
          pull_quote?: string | null
          pull_quote_attr?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "country_page_content_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: true
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      country_playbook_stages: {
        Row: {
          country_id: string
          created_at: string | null
          id: string
          stage_number: number
          sub_steps: string[]
          summary: string
          time_range: string
          title: string
          updated_at: string | null
        }
        Insert: {
          country_id: string
          created_at?: string | null
          id?: string
          stage_number: number
          sub_steps?: string[]
          summary: string
          time_range: string
          title: string
          updated_at?: string | null
        }
        Update: {
          country_id?: string
          created_at?: string | null
          id?: string
          stage_number?: number
          sub_steps?: string[]
          summary?: string
          time_range?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "country_playbook_stages_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      country_trade_metrics: {
        Row: {
          country_id: string
          created_at: string | null
          delta: string | null
          id: string
          label: string
          positive: boolean | null
          sort_order: number
          source: string
          source_url: string | null
          updated_at: string | null
          value: string
        }
        Insert: {
          country_id: string
          created_at?: string | null
          delta?: string | null
          id?: string
          label: string
          positive?: boolean | null
          sort_order: number
          source: string
          source_url?: string | null
          updated_at?: string | null
          value: string
        }
        Update: {
          country_id?: string
          created_at?: string | null
          delta?: string | null
          id?: string
          label?: string
          positive?: boolean | null
          sort_order?: number
          source?: string
          source_url?: string | null
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "country_trade_metrics_country_id_fkey"
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
      edge_function_rate_limits: {
        Row: {
          function_name: string
          id: string
          invoked_at: string
          user_id: string
        }
        Insert: {
          function_name: string
          id?: string
          invoked_at?: string
          user_id: string
        }
        Update: {
          function_name?: string
          id?: string
          invoked_at?: string
          user_id?: string
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
      email_log: {
        Row: {
          created_at: string | null
          email_type: string
          error_message: string | null
          id: string
          idempotency_key: string | null
          metadata: Json | null
          recipient_email: string
          resend_id: string | null
          status: string
          subject: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_type: string
          error_message?: string | null
          id?: string
          idempotency_key?: string | null
          metadata?: Json | null
          recipient_email: string
          resend_id?: string | null
          status?: string
          subject: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_type?: string
          error_message?: string | null
          id?: string
          idempotency_key?: string | null
          metadata?: Json | null
          recipient_email?: string
          resend_id?: string | null
          status?: string
          subject?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_sequence_steps: {
        Row: {
          delay_days: number
          id: string
          is_active: boolean | null
          sequence_name: string
          step_number: number
          subject: string
          template_name: string
        }
        Insert: {
          delay_days: number
          id?: string
          is_active?: boolean | null
          sequence_name: string
          step_number: number
          subject: string
          template_name: string
        }
        Update: {
          delay_days?: number
          id?: string
          is_active?: boolean | null
          sequence_name?: string
          step_number?: number
          subject?: string
          template_name?: string
        }
        Relationships: []
      }
      email_sequences: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_step: number
          id: string
          next_send_at: string | null
          paused: boolean | null
          sequence_name: string
          started_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number
          id?: string
          next_send_at?: string | null
          paused?: boolean | null
          sequence_name?: string
          started_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number
          id?: string
          next_send_at?: string | null
          paused?: boolean | null
          sequence_name?: string
          started_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          attendees: number
          attendees_label: string | null
          category: string
          city: string | null
          created_at: string
          date: string | null
          date_precision: string
          description: string
          event_logo_url: string | null
          exhibitors: number | null
          exhibitors_label: string | null
          frequency: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          location: string
          location_id: string | null
          organizer: string | null
          organizer_email: string | null
          organizer_website: string | null
          price: string | null
          registration_url: string | null
          sector: string | null
          slug: string
          state_region: string | null
          tags: string[] | null
          time: string | null
          title: string
          type: string
          typical_month: string | null
          updated_at: string
          venue: string | null
          website_url: string | null
        }
        Insert: {
          attendees?: number
          attendees_label?: string | null
          category: string
          city?: string | null
          created_at?: string
          date?: string | null
          date_precision?: string
          description: string
          event_logo_url?: string | null
          exhibitors?: number | null
          exhibitors_label?: string | null
          frequency?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          location: string
          location_id?: string | null
          organizer?: string | null
          organizer_email?: string | null
          organizer_website?: string | null
          price?: string | null
          registration_url?: string | null
          sector?: string | null
          slug: string
          state_region?: string | null
          tags?: string[] | null
          time?: string | null
          title: string
          type: string
          typical_month?: string | null
          updated_at?: string
          venue?: string | null
          website_url?: string | null
        }
        Update: {
          attendees?: number
          attendees_label?: string | null
          category?: string
          city?: string | null
          created_at?: string
          date?: string | null
          date_precision?: string
          description?: string
          event_logo_url?: string | null
          exhibitors?: number | null
          exhibitors_label?: string | null
          frequency?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          location?: string
          location_id?: string | null
          organizer?: string | null
          organizer_email?: string | null
          organizer_website?: string | null
          price?: string | null
          registration_url?: string | null
          sector?: string | null
          slug?: string
          state_region?: string | null
          tags?: string[] | null
          time?: string | null
          title?: string
          type?: string
          typical_month?: string | null
          updated_at?: string
          venue?: string | null
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
      guide_attachments: {
        Row: {
          content_item_id: string
          created_at: string | null
          display_name: string
          download_count: number | null
          file_name: string
          file_path: string
          file_size_bytes: number | null
          file_type: string
          id: string
          is_premium: boolean | null
          mime_type: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          content_item_id: string
          created_at?: string | null
          display_name: string
          download_count?: number | null
          file_name: string
          file_path: string
          file_size_bytes?: number | null
          file_type: string
          id?: string
          is_premium?: boolean | null
          mime_type?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          content_item_id?: string
          created_at?: string | null
          display_name?: string
          download_count?: number | null
          file_name?: string
          file_path?: string
          file_size_bytes?: number | null
          file_type?: string
          id?: string
          is_premium?: boolean | null
          mime_type?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guide_attachments_content_item_id_fkey"
            columns: ["content_item_id"]
            isOneToOne: false
            referencedRelation: "content_items"
            referencedColumns: ["id"]
          },
        ]
      }
      ii_content: {
        Row: {
          author_handle: string | null
          author_name: string | null
          author_url: string | null
          body_html: string | null
          body_text: string | null
          category: string | null
          classifier_reasoning: string | null
          classifier_version: string | null
          created_at: string | null
          embedder_version: string | null
          embedding: string | null
          embedding_model: string | null
          entities: Json | null
          extractor_version: string | null
          from_email: string | null
          from_name: string | null
          gmail_labels: string[] | null
          gmail_message_id: string | null
          id: string
          is_canonical: boolean | null
          is_ii_relevant: boolean | null
          key_quote: string | null
          processed_at: string | null
          published_at: string | null
          received_at: string | null
          relevance_score: number | null
          source_id: string
          source_metadata: Json | null
          source_type: string
          source_url: string | null
          story_cluster_id: string | null
          subject: string | null
          summary: string | null
          tags: string[] | null
          thread_id: string | null
          title: string | null
          to_email: string | null
          updated_at: string | null
        }
        Insert: {
          author_handle?: string | null
          author_name?: string | null
          author_url?: string | null
          body_html?: string | null
          body_text?: string | null
          category?: string | null
          classifier_reasoning?: string | null
          classifier_version?: string | null
          created_at?: string | null
          embedder_version?: string | null
          embedding?: string | null
          embedding_model?: string | null
          entities?: Json | null
          extractor_version?: string | null
          from_email?: string | null
          from_name?: string | null
          gmail_labels?: string[] | null
          gmail_message_id?: string | null
          id?: string
          is_canonical?: boolean | null
          is_ii_relevant?: boolean | null
          key_quote?: string | null
          processed_at?: string | null
          published_at?: string | null
          received_at?: string | null
          relevance_score?: number | null
          source_id: string
          source_metadata?: Json | null
          source_type: string
          source_url?: string | null
          story_cluster_id?: string | null
          subject?: string | null
          summary?: string | null
          tags?: string[] | null
          thread_id?: string | null
          title?: string | null
          to_email?: string | null
          updated_at?: string | null
        }
        Update: {
          author_handle?: string | null
          author_name?: string | null
          author_url?: string | null
          body_html?: string | null
          body_text?: string | null
          category?: string | null
          classifier_reasoning?: string | null
          classifier_version?: string | null
          created_at?: string | null
          embedder_version?: string | null
          embedding?: string | null
          embedding_model?: string | null
          entities?: Json | null
          extractor_version?: string | null
          from_email?: string | null
          from_name?: string | null
          gmail_labels?: string[] | null
          gmail_message_id?: string | null
          id?: string
          is_canonical?: boolean | null
          is_ii_relevant?: boolean | null
          key_quote?: string | null
          processed_at?: string | null
          published_at?: string | null
          received_at?: string | null
          relevance_score?: number | null
          source_id?: string
          source_metadata?: Json | null
          source_type?: string
          source_url?: string | null
          story_cluster_id?: string | null
          subject?: string | null
          summary?: string | null
          tags?: string[] | null
          thread_id?: string | null
          title?: string | null
          to_email?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ii_curated_log: {
        Row: {
          action: string
          created_at: string
          curation_id: string | null
          details: Json
          id: string
        }
        Insert: {
          action: string
          created_at?: string
          curation_id?: string | null
          details?: Json
          id?: string
        }
        Update: {
          action?: string
          created_at?: string
          curation_id?: string | null
          details?: Json
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ii_curated_log_curation_id_fkey"
            columns: ["curation_id"]
            isOneToOne: false
            referencedRelation: "ii_curations"
            referencedColumns: ["id"]
          },
        ]
      }
      ii_curations: {
        Row: {
          brief: Json | null
          content_id: string
          created_at: string
          curated_for: string
          id: string
          is_wildcard: boolean
          model_config_version: string
          notion_page_id: string | null
          prompt_version: string | null
          rejection_reason: string | null
          score_breakdown: Json
          score_total: number | null
          scoring_breakdown_v2: Json | null
          scoring_version: string
          slack_ts: string | null
          slot: number | null
          status: string
          surface: string
          updated_at: string
        }
        Insert: {
          brief?: Json | null
          content_id: string
          created_at?: string
          curated_for: string
          id?: string
          is_wildcard?: boolean
          model_config_version?: string
          notion_page_id?: string | null
          prompt_version?: string | null
          rejection_reason?: string | null
          score_breakdown?: Json
          score_total?: number | null
          scoring_breakdown_v2?: Json | null
          scoring_version?: string
          slack_ts?: string | null
          slot?: number | null
          status?: string
          surface: string
          updated_at?: string
        }
        Update: {
          brief?: Json | null
          content_id?: string
          created_at?: string
          curated_for?: string
          id?: string
          is_wildcard?: boolean
          model_config_version?: string
          notion_page_id?: string | null
          prompt_version?: string | null
          rejection_reason?: string | null
          score_breakdown?: Json
          score_total?: number | null
          scoring_breakdown_v2?: Json | null
          scoring_version?: string
          slack_ts?: string | null
          slot?: number | null
          status?: string
          surface?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ii_curations_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "ii_content"
            referencedColumns: ["id"]
          },
        ]
      }
      ii_experiment_outputs: {
        Row: {
          arm: string
          content_id: string
          cost_usd: number | null
          created_at: string | null
          editor_notes: string | null
          editor_verdict: string | null
          experiment_id: string
          id: string
          latency_ms: number | null
          model: string
          output: Json
          prompt_version: string
          week_of: string
        }
        Insert: {
          arm: string
          content_id: string
          cost_usd?: number | null
          created_at?: string | null
          editor_notes?: string | null
          editor_verdict?: string | null
          experiment_id: string
          id?: string
          latency_ms?: number | null
          model: string
          output: Json
          prompt_version: string
          week_of: string
        }
        Update: {
          arm?: string
          content_id?: string
          cost_usd?: number | null
          created_at?: string | null
          editor_notes?: string | null
          editor_verdict?: string | null
          experiment_id?: string
          id?: string
          latency_ms?: number | null
          model?: string
          output?: Json
          prompt_version?: string
          week_of?: string
        }
        Relationships: [
          {
            foreignKeyName: "ii_experiment_outputs_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "ii_content"
            referencedColumns: ["id"]
          },
        ]
      }
      ii_intro_archive: {
        Row: {
          candidates: Json
          created_at: string
          id: string
          prompt_version: string | null
          selected_at: string | null
          selected_slot: number | null
          week_of: string
        }
        Insert: {
          candidates?: Json
          created_at?: string
          id?: string
          prompt_version?: string | null
          selected_at?: string | null
          selected_slot?: number | null
          week_of: string
        }
        Update: {
          candidates?: Json
          created_at?: string
          id?: string
          prompt_version?: string | null
          selected_at?: string | null
          selected_slot?: number | null
          week_of?: string
        }
        Relationships: []
      }
      ii_prefilter_log: {
        Row: {
          body_preview: string | null
          id: string
          kept: boolean
          logged_at: string
          metadata: Json
          reason: string | null
          source_id: string
          source_type: string
        }
        Insert: {
          body_preview?: string | null
          id?: string
          kept: boolean
          logged_at?: string
          metadata?: Json
          reason?: string | null
          source_id: string
          source_type: string
        }
        Update: {
          body_preview?: string | null
          id?: string
          kept?: boolean
          logged_at?: string
          metadata?: Json
          reason?: string | null
          source_id?: string
          source_type?: string
        }
        Relationships: []
      }
      ii_published_archive: {
        Row: {
          ab_variant_data: Json | null
          beehiiv_post_id: string | null
          beehiiv_publication_id: string | null
          click_rate: number | null
          created_at: string
          embedding: string | null
          extractor_version: string
          id: string
          metrics_updated_at: string | null
          open_rate: number | null
          preview_text: string | null
          published_at: string | null
          raw_metadata: Json | null
          section_index: number
          section_name: string
          section_text: string
          sent_at: string | null
          source_id: string
          source_type: string
          spam_complaints: number | null
          status: string | null
          subject_line: string | null
          title: string | null
          total_clicks: number | null
          total_opens: number | null
          unsubscribes: number | null
          updated_at: string
          web_url: string | null
        }
        Insert: {
          ab_variant_data?: Json | null
          beehiiv_post_id?: string | null
          beehiiv_publication_id?: string | null
          click_rate?: number | null
          created_at?: string
          embedding?: string | null
          extractor_version?: string
          id?: string
          metrics_updated_at?: string | null
          open_rate?: number | null
          preview_text?: string | null
          published_at?: string | null
          raw_metadata?: Json | null
          section_index?: number
          section_name: string
          section_text: string
          sent_at?: string | null
          source_id: string
          source_type: string
          spam_complaints?: number | null
          status?: string | null
          subject_line?: string | null
          title?: string | null
          total_clicks?: number | null
          total_opens?: number | null
          unsubscribes?: number | null
          updated_at?: string
          web_url?: string | null
        }
        Update: {
          ab_variant_data?: Json | null
          beehiiv_post_id?: string | null
          beehiiv_publication_id?: string | null
          click_rate?: number | null
          created_at?: string
          embedding?: string | null
          extractor_version?: string
          id?: string
          metrics_updated_at?: string | null
          open_rate?: number | null
          preview_text?: string | null
          published_at?: string | null
          raw_metadata?: Json | null
          section_index?: number
          section_name?: string
          section_text?: string
          sent_at?: string | null
          source_id?: string
          source_type?: string
          spam_complaints?: number | null
          status?: string | null
          subject_line?: string | null
          title?: string | null
          total_clicks?: number | null
          total_opens?: number | null
          unsubscribes?: number | null
          updated_at?: string
          web_url?: string | null
        }
        Relationships: []
      }
      ii_reddit_signals: {
        Row: {
          actioned_as: string | null
          actioned_at: string | null
          author_handle: string | null
          author_metadata: Json
          author_url: string | null
          classifier_reasoning: string | null
          created_at: string
          distinguished: string | null
          editorial_angle: string | null
          editorial_angle_score: number | null
          embedding: string | null
          embedding_model: string
          engagement_score: number | null
          error_message: string | null
          flair: string | null
          id: string
          irish_identity_score: number | null
          matched_archive_ids: string[]
          matched_content_ids: string[]
          max_cosine_archive: number | null
          max_cosine_content: number | null
          nsfw: boolean
          num_comments: number
          originality_score: number | null
          permalink: string
          post_kind: string
          post_url: string | null
          posted_at: string
          prefilter_reason: string | null
          promoted_content_id: string | null
          reddit_post_id: string
          scanned_at: string
          score_breakdown: Json
          score_normalized: number | null
          score_total: number | null
          scorer_version: string
          selftext: string | null
          slack_channel_id: string | null
          slack_ts: string | null
          source_credibility_score: number | null
          status: string
          subreddit: string
          summary: string | null
          title: string
          topic_cluster: string | null
          topic_fit_score: number | null
          updated_at: string
          upvote_ratio: number | null
          upvotes: number
        }
        Insert: {
          actioned_as?: string | null
          actioned_at?: string | null
          author_handle?: string | null
          author_metadata?: Json
          author_url?: string | null
          classifier_reasoning?: string | null
          created_at?: string
          distinguished?: string | null
          editorial_angle?: string | null
          editorial_angle_score?: number | null
          embedding?: string | null
          embedding_model?: string
          engagement_score?: number | null
          error_message?: string | null
          flair?: string | null
          id?: string
          irish_identity_score?: number | null
          matched_archive_ids?: string[]
          matched_content_ids?: string[]
          max_cosine_archive?: number | null
          max_cosine_content?: number | null
          nsfw?: boolean
          num_comments?: number
          originality_score?: number | null
          permalink: string
          post_kind: string
          post_url?: string | null
          posted_at: string
          prefilter_reason?: string | null
          promoted_content_id?: string | null
          reddit_post_id: string
          scanned_at?: string
          score_breakdown?: Json
          score_normalized?: number | null
          score_total?: number | null
          scorer_version?: string
          selftext?: string | null
          slack_channel_id?: string | null
          slack_ts?: string | null
          source_credibility_score?: number | null
          status?: string
          subreddit: string
          summary?: string | null
          title: string
          topic_cluster?: string | null
          topic_fit_score?: number | null
          updated_at?: string
          upvote_ratio?: number | null
          upvotes?: number
        }
        Update: {
          actioned_as?: string | null
          actioned_at?: string | null
          author_handle?: string | null
          author_metadata?: Json
          author_url?: string | null
          classifier_reasoning?: string | null
          created_at?: string
          distinguished?: string | null
          editorial_angle?: string | null
          editorial_angle_score?: number | null
          embedding?: string | null
          embedding_model?: string
          engagement_score?: number | null
          error_message?: string | null
          flair?: string | null
          id?: string
          irish_identity_score?: number | null
          matched_archive_ids?: string[]
          matched_content_ids?: string[]
          max_cosine_archive?: number | null
          max_cosine_content?: number | null
          nsfw?: boolean
          num_comments?: number
          originality_score?: number | null
          permalink?: string
          post_kind?: string
          post_url?: string | null
          posted_at?: string
          prefilter_reason?: string | null
          promoted_content_id?: string | null
          reddit_post_id?: string
          scanned_at?: string
          score_breakdown?: Json
          score_normalized?: number | null
          score_total?: number | null
          scorer_version?: string
          selftext?: string | null
          slack_channel_id?: string | null
          slack_ts?: string | null
          source_credibility_score?: number | null
          status?: string
          subreddit?: string
          summary?: string | null
          title?: string
          topic_cluster?: string | null
          topic_fit_score?: number | null
          updated_at?: string
          upvote_ratio?: number | null
          upvotes?: number
        }
        Relationships: [
          {
            foreignKeyName: "ii_reddit_signals_promoted_content_id_fkey"
            columns: ["promoted_content_id"]
            isOneToOne: false
            referencedRelation: "ii_content"
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
          domain: string | null
          employees: string
          experience_tiles: Json | null
          founded: string
          id: string
          location: string
          location_id: string | null
          logo: string | null
          name: string
          sectors: string[] | null
          services: string[]
          slug: string
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
          domain?: string | null
          employees: string
          experience_tiles?: Json | null
          founded: string
          id?: string
          location: string
          location_id?: string | null
          logo?: string | null
          name: string
          sectors?: string[] | null
          services?: string[]
          slug: string
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
          domain?: string | null
          employees?: string
          experience_tiles?: Json | null
          founded?: string
          id?: string
          location?: string
          location_id?: string | null
          logo?: string | null
          name?: string
          sectors?: string[] | null
          services?: string[]
          slug?: string
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
      innovation_ecosystem_enrichment_staging: {
        Row: {
          created_at: string
          enrichment: Json
          id: string
          notes: string | null
          reviewed_at: string | null
          source_id: string
          status: string
        }
        Insert: {
          created_at?: string
          enrichment: Json
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          source_id: string
          status?: string
        }
        Update: {
          created_at?: string
          enrichment?: Json
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          source_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "innovation_ecosystem_enrichment_staging_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "innovation_ecosystem"
            referencedColumns: ["id"]
          },
        ]
      }
      investors: {
        Row: {
          application_url: string | null
          basic_info: string | null
          check_size_max: number | null
          check_size_min: number | null
          contact_email: string | null
          contact_name: string | null
          country: string | null
          created_at: string | null
          currently_investing: boolean | null
          description: string
          details: Json | null
          fund_size: string | null
          id: string
          investor_type: string
          is_featured: boolean | null
          leads_deals: boolean | null
          linkedin_url: string | null
          location: string
          logo: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          portfolio_companies: string[] | null
          sector_focus: string[] | null
          slug: string
          stage_focus: string[] | null
          updated_at: string | null
          website: string | null
          why_work_with_us: string | null
          year_fund_closed: string | null
        }
        Insert: {
          application_url?: string | null
          basic_info?: string | null
          check_size_max?: number | null
          check_size_min?: number | null
          contact_email?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          currently_investing?: boolean | null
          description: string
          details?: Json | null
          fund_size?: string | null
          id?: string
          investor_type: string
          is_featured?: boolean | null
          leads_deals?: boolean | null
          linkedin_url?: string | null
          location: string
          logo?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          portfolio_companies?: string[] | null
          sector_focus?: string[] | null
          slug: string
          stage_focus?: string[] | null
          updated_at?: string | null
          website?: string | null
          why_work_with_us?: string | null
          year_fund_closed?: string | null
        }
        Update: {
          application_url?: string | null
          basic_info?: string | null
          check_size_max?: number | null
          check_size_min?: number | null
          contact_email?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          currently_investing?: boolean | null
          description?: string
          details?: Json | null
          fund_size?: string | null
          id?: string
          investor_type?: string
          is_featured?: boolean | null
          leads_deals?: boolean | null
          linkedin_url?: string | null
          location?: string
          logo?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          portfolio_companies?: string[] | null
          sector_focus?: string[] | null
          slug?: string
          stage_focus?: string[] | null
          updated_at?: string | null
          website?: string | null
          why_work_with_us?: string | null
          year_fund_closed?: string | null
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
      legacy_industry_mapping: {
        Row: {
          created_at: string
          id: string
          legacy_value: string
          linkedin_industry_group: string
          linkedin_sector: string
        }
        Insert: {
          created_at?: string
          id?: string
          legacy_value: string
          linkedin_industry_group: string
          linkedin_sector: string
        }
        Update: {
          created_at?: string
          id?: string
          legacy_value?: string
          linkedin_industry_group?: string
          linkedin_sector?: string
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
      linkedin_industries: {
        Row: {
          created_at: string
          display_name: string
          display_order: number
          id: string
          industry_group: string
          is_active: boolean
          sector: string
          sector_slug: string
          slug: string
          sub_industry: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          display_order?: number
          id?: string
          industry_group: string
          is_active?: boolean
          sector: string
          sector_slug: string
          slug: string
          sub_industry?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          display_order?: number
          id?: string
          industry_group?: string
          is_active?: boolean
          sector?: string
          sector_slug?: string
          slug?: string
          sub_industry?: string | null
        }
        Relationships: []
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
      mentor_contact_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          mentor_id: string
          message: string
          requester_company: string | null
          requester_country: string | null
          requester_email: string
          requester_name: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          mentor_id: string
          message: string
          requester_company?: string | null
          requester_country?: string | null
          requester_email: string
          requester_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          mentor_id?: string
          message?: string
          requester_company?: string | null
          requester_country?: string | null
          requester_email?: string
          requester_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_contact_requests_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "community_members"
            referencedColumns: ["id"]
          },
        ]
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
      partner_domain_lookup: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          name: string
          name_normalized: string | null
          notes: string | null
          source: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          name: string
          name_normalized?: string | null
          notes?: string | null
          source?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          name?: string
          name_normalized?: string | null
          notes?: string | null
          source?: string
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
          is_email_subscribed: boolean | null
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
          is_email_subscribed?: boolean | null
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
          is_email_subscribed?: boolean | null
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
      service_provider_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
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
      service_provider_contacts: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          is_primary: boolean | null
          linkedin_url: string | null
          phone: string | null
          role: string | null
          service_provider_id: string | null
          sort_order: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_primary?: boolean | null
          linkedin_url?: string | null
          phone?: string | null
          role?: string | null
          service_provider_id?: string | null
          sort_order?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_primary?: boolean | null
          linkedin_url?: string | null
          phone?: string | null
          role?: string | null
          service_provider_id?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_contacts_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_provider_reviews: {
        Row: {
          created_at: string | null
          id: string
          is_verified: boolean | null
          rating: number | null
          review_text: string | null
          reviewer_company: string | null
          reviewer_country: string | null
          reviewer_name: string | null
          service_provider_id: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          rating?: number | null
          review_text?: string | null
          reviewer_company?: string | null
          reviewer_country?: string | null
          reviewer_name?: string | null
          service_provider_id?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          rating?: number | null
          review_text?: string | null
          reviewer_company?: string | null
          reviewer_country?: string | null
          reviewer_name?: string | null
          service_provider_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_provider_reviews_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
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
          slug: string
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
          slug: string
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
          slug?: string
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
      trade_agencies_enrichment_staging: {
        Row: {
          applied_at: string | null
          created_at: string | null
          enrichment: Json
          id: string
          research_notes: string | null
          reviewed_at: string | null
          source_id: string | null
          source_name: string
          status: string | null
        }
        Insert: {
          applied_at?: string | null
          created_at?: string | null
          enrichment: Json
          id?: string
          research_notes?: string | null
          reviewed_at?: string | null
          source_id?: string | null
          source_name: string
          status?: string | null
        }
        Update: {
          applied_at?: string | null
          created_at?: string | null
          enrichment?: Json
          id?: string
          research_notes?: string | null
          reviewed_at?: string | null
          source_id?: string | null
          source_name?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_agencies_enrichment_staging_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: true
            referencedRelation: "agencies_report_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trade_agencies_enrichment_staging_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: true
            referencedRelation: "trade_investment_agencies"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_investment_agencies: {
        Row: {
          basic_info: string | null
          category_slug: string | null
          contact: string | null
          contact_persons: Json | null
          country_iso2: string | null
          created_at: string
          description: string
          description_full: string | null
          domain: string | null
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
          needs_re_research: boolean | null
          organisation_type: string | null
          phone: string | null
          sectors_supported: string[] | null
          services: string[]
          slug: string
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
          country_iso2?: string | null
          created_at?: string
          description: string
          description_full?: string | null
          domain?: string | null
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
          needs_re_research?: boolean | null
          organisation_type?: string | null
          phone?: string | null
          sectors_supported?: string[] | null
          services?: string[]
          slug: string
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
          country_iso2?: string | null
          created_at?: string
          description?: string
          description_full?: string | null
          domain?: string | null
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
          needs_re_research?: boolean | null
          organisation_type?: string | null
          phone?: string | null
          sectors_supported?: string[] | null
          services?: string[]
          slug?: string
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
          country_iso2: string | null
          description: string | null
          description_full: string | null
          domain: string | null
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
          team_contacts: Json | null
          view_count: number | null
          website: string | null
          website_url: string | null
          why_work_with_us: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_slug: { Args: { input_text: string }; Returns: string }
      get_tier_gated_report: { Args: { p_report_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_download_count: {
        Args: { attachment_id: string }
        Returns: undefined
      }
      match_archive: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
          section_filter?: string[]
          source_type_filter?: string
        }
        Returns: {
          id: string
          published_at: string
          section_index: number
          section_name: string
          similarity: number
          source_id: string
          source_type: string
          title: string
        }[]
      }
      match_content: {
        Args: {
          canonical_only?: boolean
          category_filter?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
          since_date?: string
          source_type_filter?: string
        }
        Returns: {
          author_handle: string
          author_name: string
          category: string
          entities: Json
          id: string
          published_at: string
          similarity: number
          source_id: string
          source_type: string
          source_url: string
          summary: string
          tags: string[]
          title: string
        }[]
      }
      match_emails: {
        Args: {
          category_filter?: string
          match_count?: number
          match_threshold?: number
          query_embedding: string
          since_date?: string
        }
        Returns: {
          category: string
          entities: Json
          from_name: string
          id: string
          received_at: string
          similarity: number
          source_url: string
          subject: string
          summary: string
          tags: string[]
        }[]
      }
      recent_ii_content: {
        Args: {
          canonical_only?: boolean
          category_filter?: string
          days?: number
          max_count?: number
          source_type_filter?: string
        }
        Returns: {
          author_handle: string
          author_name: string
          category: string
          entities: Json
          id: string
          published_at: string
          source_id: string
          source_type: string
          source_url: string
          summary: string
          tags: string[]
          title: string
        }[]
      }
      recent_ii_emails: {
        Args: { category_filter?: string; days?: number; max_count?: number }
        Returns: {
          category: string
          entities: Json
          from_name: string
          id: string
          received_at: string
          source_url: string
          subject: string
          summary: string
          tags: string[]
        }[]
      }
      roll_forward_month_precision_events: { Args: never; Returns: number }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      validate_industry_sector_values: {
        Args: { industries: string[] }
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
