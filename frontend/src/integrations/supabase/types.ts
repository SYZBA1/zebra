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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointment_audit_log: {
        Row: {
          appointment_id: string
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          old_status: string | null
        }
        Insert: {
          appointment_id: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          old_status?: string | null
        }
        Update: {
          appointment_id?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          old_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointment_audit_log_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "consultant_appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string
          id: string
          items: Json
          name: string
          notes: string | null
          sector: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          items?: Json
          name: string
          notes?: string | null
          sector?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          items?: Json
          name?: string
          notes?: string | null
          sector?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          language: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultant_appointments: {
        Row: {
          conversation_id: string | null
          created_at: string
          description: string | null
          email: string
          full_name: string
          id: string
          language: string
          phone: string | null
          preferred_date: string | null
          preferred_time: string | null
          status: string
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          email: string
          full_name: string
          id?: string
          language?: string
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          status?: string
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          description?: string | null
          email?: string
          full_name?: string
          id?: string
          language?: string
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          status?: string
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultant_appointments_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_bookings: {
        Row: {
          admin_note: string | null
          amount_etb: number
          created_at: string
          description: string | null
          email: string
          expert_id: string
          expert_user_id: string | null
          full_name: string
          id: string
          language: string
          payment_method: string
          phone: string | null
          preferred_date: string | null
          preferred_time: string | null
          status: string
          topic: string
          transaction_ref: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount_etb?: number
          created_at?: string
          description?: string | null
          email: string
          expert_id: string
          expert_user_id?: string | null
          full_name: string
          id?: string
          language?: string
          payment_method?: string
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          status?: string
          topic: string
          transaction_ref?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount_etb?: number
          created_at?: string
          description?: string | null
          email?: string
          expert_id?: string
          expert_user_id?: string | null
          full_name?: string
          id?: string
          language?: string
          payment_method?: string
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          status?: string
          topic?: string
          transaction_ref?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_bookings_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "experts"
            referencedColumns: ["id"]
          },
        ]
      }
      experts: {
        Row: {
          accent: string
          appointments: number
          approval_rate: number
          bio: string
          created_at: string
          deliverable: string
          id: string
          industry: string
          initials: string
          name: string
          offering: string
          online: boolean
          price_etb: number
          rating: number
          tags: string[]
          title: string
          updated_at: string
          user_id: string | null
          verified: boolean
          years_experience: number
        }
        Insert: {
          accent?: string
          appointments?: number
          approval_rate?: number
          bio?: string
          created_at?: string
          deliverable?: string
          id?: string
          industry: string
          initials?: string
          name: string
          offering?: string
          online?: boolean
          price_etb?: number
          rating?: number
          tags?: string[]
          title: string
          updated_at?: string
          user_id?: string | null
          verified?: boolean
          years_experience?: number
        }
        Update: {
          accent?: string
          appointments?: number
          approval_rate?: number
          bio?: string
          created_at?: string
          deliverable?: string
          id?: string
          industry?: string
          initials?: string
          name?: string
          offering?: string
          online?: boolean
          price_etb?: number
          rating?: number
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string | null
          verified?: boolean
          years_experience?: number
        }
        Relationships: []
      }
      health_assessments: {
        Row: {
          answers: Json
          business_name: string
          created_at: string
          gaps: Json
          id: string
          language: string
          overall_score: number | null
          pillar_scores: Json
          project_id: string | null
          rating: string | null
          sector: string
          solutions: Json
          status: string
          summary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json
          business_name: string
          created_at?: string
          gaps?: Json
          id?: string
          language?: string
          overall_score?: number | null
          pillar_scores?: Json
          project_id?: string | null
          rating?: string | null
          sector: string
          solutions?: Json
          status?: string
          summary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json
          business_name?: string
          created_at?: string
          gaps?: Json
          id?: string
          language?: string
          overall_score?: number | null
          pillar_scores?: Json
          project_id?: string | null
          rating?: string | null
          sector?: string
          solutions?: Json
          status?: string
          summary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_assessments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      health_questions: {
        Row: {
          created_at: string
          id: string
          input_type: string
          is_active: boolean
          options: Json | null
          order_index: number
          pillar: string
          question_am: string | null
          question_en: string
        }
        Insert: {
          created_at?: string
          id?: string
          input_type?: string
          is_active?: boolean
          options?: Json | null
          order_index?: number
          pillar: string
          question_am?: string | null
          question_en: string
        }
        Update: {
          created_at?: string
          id?: string
          input_type?: string
          is_active?: boolean
          options?: Json | null
          order_index?: number
          pillar?: string
          question_am?: string | null
          question_en?: string
        }
        Relationships: []
      }
      knowledge_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          document_id: string
          embedding: string | null
          id: string
          metadata: Json
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          document_id: string
          embedding?: string | null
          id?: string
          metadata?: Json
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          document_id?: string
          embedding?: string | null
          id?: string
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "knowledge_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          created_at: string
          description: string | null
          file_path: string | null
          id: string
          language: string
          raw_text: string | null
          sector: string | null
          source: string | null
          status: string | null
          title: string
          total_chunks: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          language?: string
          raw_text?: string | null
          sector?: string | null
          source?: string | null
          status?: string | null
          title: string
          total_chunks?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string | null
          id?: string
          language?: string
          raw_text?: string | null
          sector?: string | null
          source?: string | null
          status?: string | null
          title?: string
          total_chunks?: number
          updated_at?: string
        }
        Relationships: []
      }
      knowledge_sectors: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      marketplace_templates: {
        Row: {
          category: string
          contents: Json
          cover_image_url: string | null
          created_at: string
          custom_titles: Json
          description: string
          document_type: string
          full_document: string | null
          id: string
          is_premium: boolean
          is_verified: boolean
          owner_name: string
          owner_type: string
          price_cents: number | null
          rating: number
          rating_count: number
          review_note: string | null
          review_ready_at: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by_user_id: string | null
          sector: string
          submission_file_name: string | null
          submission_file_path: string | null
          submitted_by_user_id: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          contents?: Json
          cover_image_url?: string | null
          created_at?: string
          custom_titles?: Json
          description: string
          document_type?: string
          full_document?: string | null
          id?: string
          is_premium?: boolean
          is_verified?: boolean
          owner_name?: string
          owner_type?: string
          price_cents?: number | null
          rating?: number
          rating_count?: number
          review_note?: string | null
          review_ready_at?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          sector: string
          submission_file_name?: string | null
          submission_file_path?: string | null
          submitted_by_user_id?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          contents?: Json
          cover_image_url?: string | null
          created_at?: string
          custom_titles?: Json
          description?: string
          document_type?: string
          full_document?: string | null
          id?: string
          is_premium?: boolean
          is_verified?: boolean
          owner_name?: string
          owner_type?: string
          price_cents?: number | null
          rating?: number
          rating_count?: number
          review_note?: string | null
          review_ready_at?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by_user_id?: string | null
          sector?: string
          submission_file_name?: string | null
          submission_file_path?: string | null
          submitted_by_user_id?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string | null
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          metadata?: Json | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string | null
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          display_name: string | null
          id: string
          phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          contents: Json
          created_at: string
          custom_titles: Json
          document_type: string
          id: string
          language: string
          name: string
          outline: Json
          phase1_answers: Json | null
          sector: string
          service_description: string | null
          template_id: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contents?: Json
          created_at?: string
          custom_titles?: Json
          document_type?: string
          id?: string
          language?: string
          name: string
          outline?: Json
          phase1_answers?: Json | null
          sector: string
          service_description?: string | null
          template_id?: string | null
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          contents?: Json
          created_at?: string
          custom_titles?: Json
          document_type?: string
          id?: string
          language?: string
          name?: string
          outline?: Json
          phase1_answers?: Json | null
          sector?: string
          service_description?: string | null
          template_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      template_purchases: {
        Row: {
          admin_note: string | null
          amount_etb: number
          created_at: string
          delivered_at: string | null
          id: string
          payment_method: string
          status: string
          template_id: string
          transaction_ref: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount_etb?: number
          created_at?: string
          delivered_at?: string | null
          id?: string
          payment_method: string
          status?: string
          template_id: string
          transaction_ref: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount_etb?: number
          created_at?: string
          delivered_at?: string | null
          id?: string
          payment_method?: string
          status?: string
          template_id?: string
          transaction_ref?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_purchases_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "marketplace_templates"
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
          role: Database["public"]["Enums"]["app_role"]
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
      visitor_feedback: {
        Row: {
          comment: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          rating: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          rating: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          rating?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_template_contents: { Args: { _template_id: string }; Returns: Json }
      get_template_full_document: {
        Args: { _template_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      match_knowledge: {
        Args: {
          filter_language?: string
          match_count?: number
          query_embedding: string
        }
        Returns: {
          content: string
          document_id: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
      match_knowledge_by_sector: {
        Args: {
          filter_language?: string
          match_count?: number
          query_embedding: string
          sector_id?: string
        }
        Returns: {
          content: string
          document_id: string
          document_title: string
          id: string
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "expert"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user", "expert"],
    },
  },
} as const
