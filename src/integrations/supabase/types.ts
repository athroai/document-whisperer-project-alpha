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
      ai_progress_signals: {
        Row: {
          avg_confidence: number
          created_at: string
          id: string
          last_confidence: string
          last_session_id: string | null
          needs_review: boolean
          sessions_count: number
          subject: string
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_confidence?: number
          created_at?: string
          id?: string
          last_confidence: string
          last_session_id?: string | null
          needs_review?: boolean
          sessions_count?: number
          subject: string
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_confidence?: number
          created_at?: string
          id?: string
          last_confidence?: string
          last_session_id?: string | null
          needs_review?: boolean
          sessions_count?: number
          subject?: string
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      athro_characters: {
        Row: {
          avatar_url: string
          created_at: string
          exam_boards: Json
          full_description: string
          id: string
          name: string
          short_description: string
          subject: string
          supported_languages: Json | null
          supports_math_notation: boolean | null
          supports_special_characters: boolean | null
          tone: string
          topics: Json
        }
        Insert: {
          avatar_url: string
          created_at?: string
          exam_boards?: Json
          full_description: string
          id: string
          name: string
          short_description: string
          subject: string
          supported_languages?: Json | null
          supports_math_notation?: boolean | null
          supports_special_characters?: boolean | null
          tone: string
          topics?: Json
        }
        Update: {
          avatar_url?: string
          created_at?: string
          exam_boards?: Json
          full_description?: string
          id?: string
          name?: string
          short_description?: string
          subject?: string
          supported_languages?: Json | null
          supports_math_notation?: boolean | null
          supports_special_characters?: boolean | null
          tone?: string
          topics?: Json
        }
        Relationships: []
      }
      availability_blocks: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          label: string | null
          recurring: string | null
          start_time: string
          student_id: string
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          label?: string | null
          recurring?: string | null
          start_time: string
          student_id: string
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          label?: string | null
          recurring?: string | null
          start_time?: string
          student_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string
          description: string | null
          end_time: string
          event_type: string
          id: string
          set_id: string | null
          source_session_id: string | null
          start_time: string
          student_id: string | null
          suggested: boolean | null
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
          source_session_id?: string | null
          start_time: string
          student_id?: string | null
          suggested?: boolean | null
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
          source_session_id?: string | null
          start_time?: string
          student_id?: string | null
          suggested?: boolean | null
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
            foreignKeyName: "calendar_events_source_session_id_fkey"
            columns: ["source_session_id"]
            isOneToOne: false
            referencedRelation: "study_sessions"
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
      diagnostic_quiz_results: {
        Row: {
          completed_at: string | null
          id: string
          score: number
          student_id: string
          subject: string
          total_questions: number
        }
        Insert: {
          completed_at?: string | null
          id?: string
          score: number
          student_id: string
          subject: string
          total_questions: number
        }
        Update: {
          completed_at?: string | null
          id?: string
          score?: number
          student_id?: string
          subject?: string
          total_questions?: number
        }
        Relationships: []
      }
      diagnostic_results: {
        Row: {
          completed_at: string | null
          id: string
          percentage_accuracy: number | null
          student_id: string
          subject_name: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          percentage_accuracy?: number | null
          student_id: string
          subject_name: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          percentage_accuracy?: number | null
          student_id?: string
          subject_name?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          character_id: string
          created_at: string
          file_type: string
          filename: string
          id: string
          mime_type: string | null
          original_name: string
          session_id: string
          size: number | null
          storage_path: string
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          file_type: string
          filename: string
          id?: string
          mime_type?: string | null
          original_name: string
          session_id: string
          size?: number | null
          storage_path: string
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          file_type?: string
          filename?: string
          id?: string
          mime_type?: string | null
          original_name?: string
          session_id?: string
          size?: number | null
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      external_calendar_events: {
        Row: {
          calendar_source: string | null
          created_at: string | null
          end_time: string | null
          event_title: string | null
          id: string
          start_time: string | null
          student_id: string
        }
        Insert: {
          calendar_source?: string | null
          created_at?: string | null
          end_time?: string | null
          event_title?: string | null
          id?: string
          start_time?: string | null
          student_id: string
        }
        Update: {
          calendar_source?: string | null
          created_at?: string | null
          end_time?: string | null
          event_title?: string | null
          id?: string
          start_time?: string | null
          student_id?: string
        }
        Relationships: []
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
      message_documents: {
        Row: {
          created_at: string
          document_id: string
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          document_id: string
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string
          document_id?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_step: string
          has_completed_availability: boolean | null
          has_completed_diagnostic: boolean | null
          has_completed_subjects: boolean | null
          has_connected_calendar: boolean | null
          has_generated_plan: boolean | null
          id: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_step: string
          has_completed_availability?: boolean | null
          has_completed_diagnostic?: boolean | null
          has_completed_subjects?: boolean | null
          has_connected_calendar?: boolean | null
          has_generated_plan?: boolean | null
          id?: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: string
          has_completed_availability?: boolean | null
          has_completed_diagnostic?: boolean | null
          has_completed_subjects?: boolean | null
          has_connected_calendar?: boolean | null
          has_generated_plan?: boolean | null
          id?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          confidence_scores: Json
          created_at: string
          email: string
          exam_board: string | null
          id: string
          name: string | null
          preferred_language: string | null
          role: string
          school_id: string | null
          welsh_eligible: boolean | null
        }
        Insert: {
          confidence_scores?: Json
          created_at?: string
          email: string
          exam_board?: string | null
          id: string
          name?: string | null
          preferred_language?: string | null
          role: string
          school_id?: string | null
          welsh_eligible?: boolean | null
        }
        Update: {
          confidence_scores?: Json
          created_at?: string
          email?: string
          exam_board?: string | null
          id?: string
          name?: string | null
          preferred_language?: string | null
          role?: string
          school_id?: string | null
          welsh_eligible?: boolean | null
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
      recall_entries: {
        Row: {
          content: string
          created_at: string
          difficulty_level: number | null
          id: string
          last_reviewed: string
          next_review: string | null
          student_id: string
          subject: string
          topic: string
        }
        Insert: {
          content: string
          created_at?: string
          difficulty_level?: number | null
          id?: string
          last_reviewed?: string
          next_review?: string | null
          student_id: string
          subject: string
          topic: string
        }
        Update: {
          content?: string
          created_at?: string
          difficulty_level?: number | null
          id?: string
          last_reviewed?: string
          next_review?: string | null
          student_id?: string
          subject?: string
          topic?: string
        }
        Relationships: [
          {
            foreignKeyName: "recall_entries_student_id_fkey"
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
      student_availability: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          start_time: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
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
      student_subject_preferences: {
        Row: {
          confidence_level: number
          created_at: string | null
          id: string
          priority: number | null
          student_id: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          confidence_level: number
          created_at?: string | null
          id?: string
          priority?: number | null
          student_id: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          confidence_level?: number
          created_at?: string | null
          id?: string
          priority?: number | null
          student_id?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      student_subjects: {
        Row: {
          created_at: string | null
          help_level: string
          id: string
          student_id: string
          subject_name: string
        }
        Insert: {
          created_at?: string | null
          help_level: string
          id?: string
          student_id: string
          subject_name: string
        }
        Update: {
          created_at?: string | null
          help_level?: string
          id?: string
          student_id?: string
          subject_name?: string
        }
        Relationships: []
      }
      study_plan_sessions: {
        Row: {
          calendar_event_id: string | null
          created_at: string | null
          end_time: string
          id: string
          is_pomodoro: boolean | null
          plan_id: string
          pomodoro_break_minutes: number | null
          pomodoro_work_minutes: number | null
          start_time: string
          subject: string
          topic: string | null
        }
        Insert: {
          calendar_event_id?: string | null
          created_at?: string | null
          end_time: string
          id?: string
          is_pomodoro?: boolean | null
          plan_id: string
          pomodoro_break_minutes?: number | null
          pomodoro_work_minutes?: number | null
          start_time: string
          subject: string
          topic?: string | null
        }
        Update: {
          calendar_event_id?: string | null
          created_at?: string | null
          end_time?: string
          id?: string
          is_pomodoro?: boolean | null
          plan_id?: string
          pomodoro_break_minutes?: number | null
          pomodoro_work_minutes?: number | null
          start_time?: string
          subject?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "study_plan_sessions_calendar_event_id_fkey"
            columns: ["calendar_event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plan_sessions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "study_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          start_date: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          start_date: string
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          confidence_after: number | null
          confidence_before: number | null
          created_at: string
          duration_minutes: number | null
          end_time: string | null
          id: string
          needs_review: boolean | null
          notes: string | null
          start_time: string
          status: string | null
          student_id: string
          subject: string
          summary: string | null
          topic: string | null
          transcript: Json | null
        }
        Insert: {
          confidence_after?: number | null
          confidence_before?: number | null
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          needs_review?: boolean | null
          notes?: string | null
          start_time: string
          status?: string | null
          student_id: string
          subject: string
          summary?: string | null
          topic?: string | null
          transcript?: Json | null
        }
        Update: {
          confidence_after?: number | null
          confidence_before?: number | null
          created_at?: string
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          needs_review?: boolean | null
          notes?: string | null
          start_time?: string
          status?: string | null
          student_id?: string
          subject?: string
          summary?: string | null
          topic?: string | null
          transcript?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_student_id_fkey"
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
      uploaded_materials: {
        Row: {
          file_type: string | null
          file_url: string
          id: string
          related_subject: string | null
          student_id: string
          uploaded_at: string | null
        }
        Insert: {
          file_type?: string | null
          file_url: string
          id?: string
          related_subject?: string | null
          student_id: string
          uploaded_at?: string | null
        }
        Update: {
          file_type?: string | null
          file_url?: string
          id?: string
          related_subject?: string | null
          student_id?: string
          uploaded_at?: string | null
        }
        Relationships: []
      }
      uploads: {
        Row: {
          created_at: string | null
          description: string | null
          file_type: string | null
          file_url: string | null
          filename: string | null
          id: string
          mime_type: string | null
          original_name: string | null
          size: number | null
          storage_path: string | null
          subject: string | null
          uploaded_by: string | null
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          filename?: string | null
          id?: string
          mime_type?: string | null
          original_name?: string | null
          size?: number | null
          storage_path?: string | null
          subject?: string | null
          uploaded_by?: string | null
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_type?: string | null
          file_url?: string | null
          filename?: string | null
          id?: string
          mime_type?: string | null
          original_name?: string | null
          size?: number | null
          storage_path?: string | null
          subject?: string | null
          uploaded_by?: string | null
          visibility?: string | null
        }
        Relationships: [
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
