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
      ai_logs: {
        Row: {
          created_at: string
          duration: number | null
          error_message: string | null
          id: string
          model: string | null
          prompt: string | null
          request_type: string
          status: string | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration?: number | null
          error_message?: string | null
          id?: string
          model?: string | null
          prompt?: string | null
          request_type: string
          status?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration?: number | null
          error_message?: string | null
          id?: string
          model?: string | null
          prompt?: string | null
          request_type?: string
          status?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          event_type: string
          id: string
          set_id: string | null
          start_time: string
          task_id: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time: string
          event_type: string
          id?: string
          set_id?: string | null
          start_time: string
          task_id?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string
          event_type?: string
          id?: string
          set_id?: string | null
          start_time?: string
          task_id?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          ai_feedback: string | null
          created_at: string
          id: string
          score: number | null
          student_id: string
          submission_id: string | null
          task_id: string
          teacher_feedback: string | null
        }
        Insert: {
          ai_feedback?: string | null
          created_at?: string
          id?: string
          score?: number | null
          student_id: string
          submission_id?: string | null
          task_id: string
          teacher_feedback?: string | null
        }
        Update: {
          ai_feedback?: string | null
          created_at?: string
          id?: string
          score?: number | null
          student_id?: string
          submission_id?: string | null
          task_id?: string
          teacher_feedback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "task_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      model_answers: {
        Row: {
          answer_text: string | null
          created_at: string
          file_id: string | null
          id: string
          past_paper_id: string | null
          question_number: string | null
        }
        Insert: {
          answer_text?: string | null
          created_at?: string
          file_id?: string | null
          id?: string
          past_paper_id?: string | null
          question_number?: string | null
        }
        Update: {
          answer_text?: string | null
          created_at?: string
          file_id?: string | null
          id?: string
          past_paper_id?: string | null
          question_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_answers_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_answers_past_paper_id_fkey"
            columns: ["past_paper_id"]
            isOneToOne: false
            referencedRelation: "past_papers"
            referencedColumns: ["id"]
          },
        ]
      }
      past_papers: {
        Row: {
          created_at: string
          exam_board: string | null
          file_id: string | null
          id: string
          season: string | null
          subject: string
          title: string
          year: number | null
        }
        Insert: {
          created_at?: string
          exam_board?: string | null
          file_id?: string | null
          id?: string
          season?: string | null
          subject: string
          title: string
          year?: number | null
        }
        Update: {
          created_at?: string
          exam_board?: string | null
          file_id?: string | null
          id?: string
          season?: string | null
          subject?: string
          title?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "past_papers_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          role: string
          school_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
          role: string
          school_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          role?: string
          school_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_school"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          created_at: string
          duration: number | null
          id: string
          max_score: number | null
          score: number | null
          student_id: string
          subject: string
          topic: string | null
        }
        Insert: {
          created_at?: string
          duration?: number | null
          id?: string
          max_score?: number | null
          score?: number | null
          student_id: string
          subject: string
          topic?: string | null
        }
        Update: {
          created_at?: string
          duration?: number | null
          id?: string
          max_score?: number | null
          score?: number | null
          student_id?: string
          subject?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      schools: {
        Row: {
          address: string | null
          contact_email: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      sets: {
        Row: {
          created_at: string
          id: string
          name: string
          school_id: string | null
          subject: string
          teacher_id: string | null
          year_group: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          school_id?: string | null
          subject: string
          teacher_id?: string | null
          year_group?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          school_id?: string | null
          subject?: string
          teacher_id?: string | null
          year_group?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sets_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sets_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_sets: {
        Row: {
          id: string
          joined_at: string
          set_id: string
          student_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          set_id: string
          student_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          set_id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_sets_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_sets_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_submissions: {
        Row: {
          created_at: string
          file_id: string | null
          id: string
          status: string | null
          student_id: string
          submission_text: string | null
          submitted_at: string | null
          task_id: string
        }
        Insert: {
          created_at?: string
          file_id?: string | null
          id?: string
          status?: string | null
          student_id: string
          submission_text?: string | null
          submitted_at?: string | null
          task_id: string
        }
        Update: {
          created_at?: string
          file_id?: string | null
          id?: string
          status?: string | null
          student_id?: string
          submission_text?: string | null
          submitted_at?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_submissions_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_by: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          set_id: string | null
          status: string | null
          subject: string | null
          title: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          set_id?: string | null
          status?: string | null
          subject?: string | null
          title: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          set_id?: string | null
          status?: string | null
          subject?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
        ]
      }
      uploads: {
        Row: {
          bucket_name: string
          created_at: string
          description: string | null
          file_type: string | null
          file_url: string | null
          filename: string
          id: string
          mime_type: string | null
          original_name: string | null
          set_id: string | null
          size: number | null
          storage_path: string
          subject: string | null
          uploaded_by: string
          visibility: string
        }
        Insert: {
          bucket_name: string
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          filename: string
          id?: string
          mime_type?: string | null
          original_name?: string | null
          set_id?: string | null
          size?: number | null
          storage_path: string
          subject?: string | null
          uploaded_by: string
          visibility?: string
        }
        Update: {
          bucket_name?: string
          created_at?: string
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          filename?: string
          id?: string
          mime_type?: string | null
          original_name?: string | null
          set_id?: string | null
          size?: number | null
          storage_path?: string
          subject?: string | null
          uploaded_by?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploads_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uploads_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_same_school: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      is_student_in_set: {
        Args: { set_id: string }
        Returns: boolean
      }
      is_teacher: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_teacher_of_set: {
        Args: { set_id: string }
        Returns: boolean
      }
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
