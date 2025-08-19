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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          compareceu: boolean
          created_at: string | null
          data: string | null
          email: string | null
          empresa_id: number | null
          hora: string | null
          id: number
          lembrete_enviado: boolean
          lembrete_enviado_2: boolean
          name: string | null
          number: string | null
          serviço: string | null
          status: boolean
        }
        Insert: {
          compareceu?: boolean
          created_at?: string | null
          data?: string | null
          email?: string | null
          empresa_id?: number | null
          hora?: string | null
          id?: number
          lembrete_enviado?: boolean
          lembrete_enviado_2?: boolean
          name?: string | null
          number?: string | null
          serviço?: string | null
          status?: boolean
        }
        Update: {
          compareceu?: boolean
          created_at?: string | null
          data?: string | null
          email?: string | null
          empresa_id?: number | null
          hora?: string | null
          id?: number
          lembrete_enviado?: boolean
          lembrete_enviado_2?: boolean
          name?: string | null
          number?: string | null
          serviço?: string | null
          status?: boolean
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          company_id: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          company_id?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          company_id?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_empresa: {
        Row: {
          api_whatsapp: string | null
          auto_resposta: boolean | null
          created_at: string | null
          empresa_id: number
          horario_funcionamento: Json | null
          id: number
          llm_enabled: boolean | null
          llm_provider: string | null
          mensagem_fora_horario: string | null
          nome_remetente_padrao: string | null
          prompt_sistema: string | null
          reports_enabled: boolean | null
          reports_frequency: string | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          api_whatsapp?: string | null
          auto_resposta?: boolean | null
          created_at?: string | null
          empresa_id: number
          horario_funcionamento?: Json | null
          id?: number
          llm_enabled?: boolean | null
          llm_provider?: string | null
          mensagem_fora_horario?: string | null
          nome_remetente_padrao?: string | null
          prompt_sistema?: string | null
          reports_enabled?: boolean | null
          reports_frequency?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_whatsapp?: string | null
          auto_resposta?: boolean | null
          created_at?: string | null
          empresa_id?: number
          horario_funcionamento?: Json | null
          id?: number
          llm_enabled?: boolean | null
          llm_provider?: string | null
          mensagem_fora_horario?: string | null
          nome_remetente_padrao?: string | null
          prompt_sistema?: string | null
          reports_enabled?: boolean | null
          reports_frequency?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: true
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_notificacoes: {
        Row: {
          canais_preferidos: Json
          configuracoes_personalizadas: Json | null
          created_at: string
          empresa_id: number
          horarios_permitidos: Json
          id: number
          limites_por_tipo: Json
          tipos_ativos: Json
          updated_at: string
        }
        Insert: {
          canais_preferidos?: Json
          configuracoes_personalizadas?: Json | null
          created_at?: string
          empresa_id: number
          horarios_permitidos?: Json
          id?: never
          limites_por_tipo?: Json
          tipos_ativos?: Json
          updated_at?: string
        }
        Update: {
          canais_preferidos?: Json
          configuracoes_personalizadas?: Json | null
          created_at?: string
          empresa_id?: number
          horarios_permitidos?: Json
          id?: never
          limites_por_tipo?: Json
          tipos_ativos?: Json
          updated_at?: string
        }
        Relationships: []
      }
      convites_empresa: {
        Row: {
          accepted_by: string | null
          company_id: number
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          name: string | null
          role_id: string | null
          scopes: Json
          status: string
          token_hash: string
          updated_at: string | null
        }
        Insert: {
          accepted_by?: string | null
          company_id: number
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by?: string | null
          name?: string | null
          role_id?: string | null
          scopes?: Json
          status?: string
          token_hash: string
          updated_at?: string | null
        }
        Update: {
          accepted_by?: string | null
          company_id?: number
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          name?: string | null
          role_id?: string | null
          scopes?: Json
          status?: string
          token_hash?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convites_empresa_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convites_empresa_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convites_empresa_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "convites_empresa_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "papeis_empresa"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string | null
          host: string | null
          id: number
          instance: string | null
          limite_leads: number | null
          limite_mensagens: number | null
          max_agents: number | null
          name_empresa: string
          plano: string | null
          prompt: string | null
          telefone: string | null
          token: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string | null
          host?: string | null
          id?: number
          instance?: string | null
          limite_leads?: number | null
          limite_mensagens?: number | null
          max_agents?: number | null
          name_empresa: string
          plano?: string | null
          prompt?: string | null
          telefone?: string | null
          token?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string | null
          host?: string | null
          id?: number
          instance?: string | null
          limite_leads?: number | null
          limite_mensagens?: number | null
          max_agents?: number | null
          name_empresa?: string
          plano?: string | null
          prompt?: string | null
          telefone?: string | null
          token?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      kanban_colunas: {
        Row: {
          cor: string | null
          created_at: string
          id: number
          nome: string
          ordem: number
          pipeline_id: number
          updated_at: string
          webhook_ativo: boolean
          webhook_url: string | null
        }
        Insert: {
          cor?: string | null
          created_at?: string
          id?: number
          nome: string
          ordem: number
          pipeline_id: number
          updated_at?: string
          webhook_ativo?: boolean
          webhook_url?: string | null
        }
        Update: {
          cor?: string | null
          created_at?: string
          id?: number
          nome?: string
          ordem?: number
          pipeline_id?: number
          updated_at?: string
          webhook_ativo?: boolean
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kanban_colunas_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_erros_agent: {
        Row: {
          chatid: string | null
          created_at: string | null
          description: string | null
          empresa_id: number
          id: number
          json: Json | null
          queue: boolean | null
          sessionid: string | null
          workflowname: string | null
        }
        Insert: {
          chatid?: string | null
          created_at?: string | null
          description?: string | null
          empresa_id: number
          id?: number
          json?: Json | null
          queue?: boolean | null
          sessionid?: string | null
          workflowname?: string | null
        }
        Update: {
          chatid?: string | null
          created_at?: string | null
          description?: string | null
          empresa_id?: number
          id?: number
          json?: Json | null
          queue?: boolean | null
          sessionid?: string | null
          workflowname?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_erros_agent_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_erros_whatsapp: {
        Row: {
          chatid: string | null
          created_at: string | null
          description: string | null
          empresa_id: number
          id: number
          json: Json | null
          queue: boolean | null
          sessionid: string | null
          workflowname: string | null
        }
        Insert: {
          chatid?: string | null
          created_at?: string | null
          description?: string | null
          empresa_id: number
          id?: number
          json?: Json | null
          queue?: boolean | null
          sessionid?: string | null
          workflowname?: string | null
        }
        Update: {
          chatid?: string | null
          created_at?: string | null
          description?: string | null
          empresa_id?: number
          id?: number
          json?: Json | null
          queue?: boolean | null
          sessionid?: string | null
          workflowname?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_erros_whatsapp_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      membros_empresa: {
        Row: {
          company_id: number
          created_at: string | null
          id: string
          invited_by: string | null
          role_id: string | null
          scopes: Json
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id: number
          created_at?: string | null
          id?: string
          invited_by?: string | null
          role_id?: string | null
          scopes?: Json
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: number
          created_at?: string | null
          id?: string
          invited_by?: string | null
          role_id?: string | null
          scopes?: Json
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membros_empresa_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membros_empresa_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membros_empresa_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "papeis_empresa"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membros_empresa_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      memoria_ai: {
        Row: {
          created_at: string
          data_atual: string | null
          empresa_id: number | null
          id: number
          message: Json
          session_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          data_atual?: string | null
          empresa_id?: number | null
          id?: number
          message: Json
          session_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          data_atual?: string | null
          empresa_id?: number | null
          id?: number
          message?: Json
          session_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          created_at: string
          dados_contexto: Json | null
          empresa_id: number
          expires_at: string | null
          id: number
          lida: boolean
          mensagem: string
          read_at: string | null
          tipo: string
          titulo: string
          urgencia: string
        }
        Insert: {
          created_at?: string
          dados_contexto?: Json | null
          empresa_id: number
          expires_at?: string | null
          id?: never
          lida?: boolean
          mensagem: string
          read_at?: string | null
          tipo: string
          titulo: string
          urgencia?: string
        }
        Update: {
          created_at?: string
          dados_contexto?: Json | null
          empresa_id?: number
          expires_at?: string | null
          id?: never
          lida?: boolean
          mensagem?: string
          read_at?: string | null
          tipo?: string
          titulo?: string
          urgencia?: string
        }
        Relationships: []
      }
      novos_leads: {
        Row: {
          created_at: string | null
          empresa_id: number
          etapa: number | null
          followup_count: number | null
          id: number
          kanban_coluna_id: number | null
          name: string | null
          number: string | null
          origem: string | null
          pipeline_id: number | null
          posicao_kanban: number | null
          qualificacao: string | null
          resumo_conversa: string | null
          tags: Json | null
          threadId: string | null
          timeout: string | null
          ultimo_followup: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          empresa_id: number
          etapa?: number | null
          followup_count?: number | null
          id?: number
          kanban_coluna_id?: number | null
          name?: string | null
          number?: string | null
          origem?: string | null
          pipeline_id?: number | null
          posicao_kanban?: number | null
          qualificacao?: string | null
          resumo_conversa?: string | null
          tags?: Json | null
          threadId?: string | null
          timeout?: string | null
          ultimo_followup?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          empresa_id?: number
          etapa?: number | null
          followup_count?: number | null
          id?: number
          kanban_coluna_id?: number | null
          name?: string | null
          number?: string | null
          origem?: string | null
          pipeline_id?: number | null
          posicao_kanban?: number | null
          qualificacao?: string | null
          resumo_conversa?: string | null
          tags?: Json | null
          threadId?: string | null
          timeout?: string | null
          ultimo_followup?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "novos_leads_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      numero_bloqueados: {
        Row: {
          bloqueado_por: string | null
          created_at: string | null
          empresa_id: number
          id: number
          motivo: string | null
          name: string | null
          number: string | null
        }
        Insert: {
          bloqueado_por?: string | null
          created_at?: string | null
          empresa_id: number
          id?: number
          motivo?: string | null
          name?: string | null
          number?: string | null
        }
        Update: {
          bloqueado_por?: string | null
          created_at?: string | null
          empresa_id?: number
          id?: number
          motivo?: string | null
          name?: string | null
          number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "numero_bloqueados_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      papeis_empresa: {
        Row: {
          company_id: number | null
          created_at: string | null
          description: string | null
          id: string
          is_preset: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          company_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_preset?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          company_id?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_preset?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "papeis_empresa_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      papeis_permissoes: {
        Row: {
          permission: string
          role_id: string
        }
        Insert: {
          permission: string
          role_id: string
        }
        Update: {
          permission?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "papeis_permissoes_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "papeis_empresa"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
        Row: {
          ativo: boolean
          created_at: string
          empresa_id: number
          id: number
          moeda: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          empresa_id: number
          id?: number
          moeda?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          empresa_id?: number
          id?: number
          moeda?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          empresa_id: number | null
          id: string
          nome: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          empresa_id?: number | null
          id: string
          nome?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          empresa_id?: number | null
          id?: string
          nome?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_global: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string | null
          scopes: Json
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          scopes?: Json
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          scopes?: Json
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_global_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_global_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
      audit_log: {
        Args: {
          action_name: string
          actor_id: string
          company_uuid: number
          metadata_json?: Json
          target_type_name: string
          target_uuid?: string
        }
        Returns: string
      }
      check_company_agent_limit: {
        Args: { company_uuid: number }
        Returns: boolean
      }
      create_default_company_roles: {
        Args: { company_uuid: number }
        Returns: undefined
      }
      get_company_agent_usage: {
        Args: { company_uuid: number }
        Returns: Json
      }
      get_empresa_by_email: {
        Args: { email_address: string }
        Returns: {
          empresa_id: number
          nome: string
        }[]
      }
      get_empresa_by_phone: {
        Args: { phone_number: string }
        Returns: {
          empresa_id: number
          nome: string
        }[]
      }
      get_user_empresa_id: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin_by_email: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      map_etapa_to_kanban_column: {
        Args: { lead_etapa: number; pipeline_id: number }
        Returns: number
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
