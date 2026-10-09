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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      ai_usage: {
        Row: {
          count: number
          feature: string
          period: string
          user_id: string
        }
        Insert: {
          count?: number
          feature: string
          period: string
          user_id: string
        }
        Update: {
          count?: number
          feature?: string
          period?: string
          user_id?: string
        }
        Relationships: []
      }
      child_profiles: {
        Row: {
          created_at: string
          daily_minutes: number
          id: string
          max_rating: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_minutes?: number
          id?: string
          max_rating?: string
          name: string
          user_id?: string
        }
        Update: {
          created_at?: string
          daily_minutes?: number
          id?: string
          max_rating?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          source: string
          topic: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          source?: string
          topic: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          source?: string
          topic?: string
        }
        Relationships: []
      }
      content_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          status: string
          title: string
          title_ref: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id?: string
          status?: string
          title: string
          title_ref: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          title?: string
          title_ref?: string
        }
        Relationships: []
      }
      creations: {
        Row: {
          age_rating: string
          ai_analysis: Json | null
          audio_path: string | null
          cover_path: string | null
          created_at: string
          data: Json
          description: string | null
          id: string
          moderation_note: string | null
          status: string
          title: string
          tool: string
          updated_at: string
          user_id: string
        }
        Insert: {
          age_rating?: string
          ai_analysis?: Json | null
          audio_path?: string | null
          cover_path?: string | null
          created_at?: string
          data?: Json
          description?: string | null
          id?: string
          moderation_note?: string | null
          status?: string
          title?: string
          tool: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          age_rating?: string
          ai_analysis?: Json | null
          audio_path?: string | null
          cover_path?: string | null
          created_at?: string
          data?: Json
          description?: string | null
          id?: string
          moderation_note?: string | null
          status?: string
          title?: string
          tool?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      moderation_decisions: {
        Row: {
          created_at: string
          decision: string
          id: string
          moderator_id: string
          note: string | null
          rating: string | null
          target_id: string
          target_title: string
          target_type: string
        }
        Insert: {
          created_at?: string
          decision: string
          id?: string
          moderator_id: string
          note?: string | null
          rating?: string | null
          target_id: string
          target_title: string
          target_type: string
        }
        Update: {
          created_at?: string
          decision?: string
          id?: string
          moderator_id?: string
          note?: string | null
          rating?: string | null
          target_id?: string
          target_title?: string
          target_type?: string
        }
        Relationships: []
      }
      parent_biometrics: {
        Row: {
          consent_at: string
          descriptor: number[]
          failed_attempts: number
          locked_until: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consent_at?: string
          descriptor: number[]
          failed_attempts?: number
          locked_until?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consent_at?: string
          descriptor?: number[]
          failed_attempts?: number
          locked_until?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      parental_events: {
        Row: {
          action: string
          created_at: string
          detail: string | null
          id: string
          result: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          detail?: string | null
          id?: string
          result: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          detail?: string | null
          id?: string
          result?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          brand: string | null
          created_at: string
          id: string
          is_default: boolean
          kind: string
          label: string
          last4: string | null
          pix_key: string | null
          user_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          kind: string
          label: string
          last4?: string | null
          pix_key?: string | null
          user_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          kind?: string
          label?: string
          last4?: string | null
          pix_key?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payout_accounts: {
        Row: {
          account: string | null
          agency: string | null
          bank: string | null
          created_at: string
          id: string
          is_default: boolean
          kind: string
          label: string
          min_withdraw: number
          network: string | null
          pix_key: string | null
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          account?: string | null
          agency?: string | null
          bank?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          kind: string
          label: string
          min_withdraw?: number
          network?: string | null
          pix_key?: string | null
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          account?: string | null
          agency?: string | null
          bank?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          kind?: string
          label?: string
          min_withdraw?: number
          network?: string | null
          pix_key?: string | null
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_date: string | null
          city: string | null
          cpf: string | null
          created_at: string
          full_name: string | null
          id: string
          nickname: string | null
          phone: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          nickname?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birth_date?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          nickname?: string | null
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      purchase_requests: {
        Row: {
          child_profile_id: string
          created_at: string
          id: string
          price: number
          status: string
          title: string
          title_id: string
          user_id: string
        }
        Insert: {
          child_profile_id: string
          created_at?: string
          id?: string
          price?: number
          status?: string
          title: string
          title_id: string
          user_id?: string
        }
        Update: {
          child_profile_id?: string
          created_at?: string
          id?: string
          price?: number
          status?: string
          title?: string
          title_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requests_child_profile_id_fkey"
            columns: ["child_profile_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          plan: Database["public"]["Enums"]["plan_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          plan?: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          plan?: Database["public"]["Enums"]["plan_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          kids_default: boolean
          language: string
          network: string
          notify_email: boolean
          notify_push: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          kids_default?: boolean
          language?: string
          network?: string
          notify_email?: boolean
          notify_push?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          kids_default?: boolean
          language?: string
          network?: string
          notify_email?: boolean
          notify_push?: boolean
          updated_at?: string
          user_id?: string
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
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          direction: string
          id: string
          label: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          direction: string
          id?: string
          label: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          direction?: string
          id?: string
          label?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_quota: {
        Args: {
          _feature: string
          _limit: number
          _period: string
          _uid: string
        }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reported_open_titles: { Args: never; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      plan_tier: "free" | "premium" | "family" | "creator_pro"
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
      app_role: ["admin", "moderator", "user"],
      plan_tier: ["free", "premium", "family", "creator_pro"],
    },
  },
} as const
