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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bicycles: {
        Row: {
          color: string | null
          created_at: string
          customer_id: string
          id: string
          marca: string
          modelo: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          customer_id: string
          id?: string
          marca: string
          modelo: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          marca?: string
          modelo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bicycles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          apellido: string
          created_at: string
          direccion: string | null
          id: string
          nombre: string
          telefono: string
          updated_at: string
        }
        Insert: {
          apellido: string
          created_at?: string
          direccion?: string | null
          id?: string
          nombre: string
          telefono: string
          updated_at?: string
        }
        Update: {
          apellido?: string
          created_at?: string
          direccion?: string | null
          id?: string
          nombre?: string
          telefono?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          gallery_item_id: string
          id: string
          orden: number
          storage_path: string
          tipo: string | null
        }
        Insert: {
          gallery_item_id: string
          id?: string
          orden?: number
          storage_path: string
          tipo?: string | null
        }
        Update: {
          gallery_item_id?: string
          id?: string
          orden?: number
          storage_path?: string
          tipo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_gallery_item_id_fkey"
            columns: ["gallery_item_id"]
            isOneToOne: false
            referencedRelation: "gallery_items"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_items: {
        Row: {
          categoria: string | null
          check_1: string | null
          check_2: string | null
          check_3: string | null
          check_4: string | null
          created_at: string
          descripcion: string | null
          fecha: string | null
          id: string
          orden: number
          publicado: boolean
          titulo: string
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          check_1?: string | null
          check_2?: string | null
          check_3?: string | null
          check_4?: string | null
          created_at?: string
          descripcion?: string | null
          fecha?: string | null
          id?: string
          orden?: number
          publicado?: boolean
          titulo: string
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          check_1?: string | null
          check_2?: string | null
          check_3?: string | null
          check_4?: string | null
          created_at?: string
          descripcion?: string | null
          fecha?: string | null
          id?: string
          orden?: number
          publicado?: boolean
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      google_reviews_cache: {
        Row: {
          business_name: string | null
          fetched_at: string
          google_maps_uri: string | null
          place_id: string
          rating: number | null
          reviews: Json
          updated_at: string
          user_rating_count: number | null
        }
        Insert: {
          business_name?: string | null
          fetched_at?: string
          google_maps_uri?: string | null
          place_id: string
          rating?: number | null
          reviews?: Json
          updated_at?: string
          user_rating_count?: number | null
        }
        Update: {
          business_name?: string | null
          fetched_at?: string
          google_maps_uri?: string | null
          place_id?: string
          rating?: number | null
          reviews?: Json
          updated_at?: string
          user_rating_count?: number | null
        }
        Relationships: []
      }
      inventory_items: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          id: string
          imagen_url: string | null
          nombre: string
          precio_unitario: number
          stock_actual: number
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          nombre: string
          precio_unitario: number
          stock_actual?: number
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: string
          imagen_url?: string | null
          nombre?: string
          precio_unitario?: number
          stock_actual?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_inventory_items: {
        Row: {
          cantidad: number
          inventory_item_id: string
          service_id: string
        }
        Insert: {
          cantidad: number
          inventory_item_id: string
          service_id: string
        }
        Update: {
          cantidad?: number
          inventory_item_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_inventory_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_inventory_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          nombre: string
          orden: number
          slug: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre: string
          orden?: number
          slug?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre?: string
          orden?: number
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          activo: boolean
          categoria: string | null
          categoria_id: string | null
          created_at: string
          descripcion: string
          id: string
          imagen_url: string | null
          orden: number | null
          plazo: string | null
          precio_base: number
          titulo: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          categoria?: string | null
          categoria_id?: string | null
          created_at?: string
          descripcion?: string
          id?: string
          imagen_url?: string | null
          orden?: number | null
          plazo?: string | null
          precio_base: number
          titulo: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categoria?: string | null
          categoria_id?: string | null
          created_at?: string
          descripcion?: string
          id?: string
          imagen_url?: string | null
          orden?: number | null
          plazo?: string | null
          precio_base?: number
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      site_settings: {
        Row: {
          about_check_1: string | null
          about_check_2: string | null
          about_check_1_descripcion: string | null
          about_check_2_descripcion: string | null
          about_descripcion: string | null
          about_titulo: string | null
          descripcion: string | null
          direccion: string | null
          email: string | null
          facebook: string | null
          google_maps_url: string | null
          google_place_id: string | null
          hero_eyebrow: string | null
          hero_imagen_url: string | null
          hero_titulo: string | null
          horarios: string | null
          how_it_works_descripcion: string | null
          how_it_works_subtitulo: string | null
          how_it_works_titulo: string | null
          how_we_work_paso1_descripcion: string | null
          how_we_work_paso1_titulo: string | null
          how_we_work_paso2_descripcion: string | null
          how_we_work_paso2_titulo: string | null
          how_we_work_paso3_descripcion: string | null
          how_we_work_paso3_titulo: string | null
          how_we_work_paso4_descripcion: string | null
          how_we_work_paso4_titulo: string | null
          id: boolean
          instagram: string | null
          logo_url: string | null
          nombre_negocio: string
          reviews_subtitulo: string | null
          reviews_titulo: string | null
          services_subtitulo: string | null
          services_titulo: string | null
          telefono: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          about_check_1?: string | null
          about_check_2?: string | null
          about_check_1_descripcion?: string | null
          about_check_2_descripcion?: string | null
          about_descripcion?: string | null
          about_titulo?: string | null
          descripcion?: string | null
          direccion?: string | null
          email?: string | null
          facebook?: string | null
          google_maps_url?: string | null
          google_place_id?: string | null
          hero_eyebrow?: string | null
          hero_imagen_url?: string | null
          hero_titulo?: string | null
          horarios?: string | null
          how_it_works_descripcion?: string | null
          how_it_works_subtitulo?: string | null
          how_it_works_titulo?: string | null
          how_we_work_paso1_descripcion?: string | null
          how_we_work_paso1_titulo?: string | null
          how_we_work_paso2_descripcion?: string | null
          how_we_work_paso2_titulo?: string | null
          how_we_work_paso3_descripcion?: string | null
          how_we_work_paso3_titulo?: string | null
          how_we_work_paso4_descripcion?: string | null
          how_we_work_paso4_titulo?: string | null
          id?: boolean
          instagram?: string | null
          logo_url?: string | null
          nombre_negocio?: string
          reviews_subtitulo?: string | null
          reviews_titulo?: string | null
          services_subtitulo?: string | null
          services_titulo?: string | null
          telefono?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          about_check_1?: string | null
          about_check_2?: string | null
          about_check_1_descripcion?: string | null
          about_check_2_descripcion?: string | null
          about_descripcion?: string | null
          about_titulo?: string | null
          descripcion?: string | null
          direccion?: string | null
          email?: string | null
          facebook?: string | null
          google_maps_url?: string | null
          google_place_id?: string | null
          hero_eyebrow?: string | null
          hero_imagen_url?: string | null
          hero_titulo?: string | null
          horarios?: string | null
          how_it_works_descripcion?: string | null
          how_it_works_subtitulo?: string | null
          how_it_works_titulo?: string | null
          how_we_work_paso1_descripcion?: string | null
          how_we_work_paso1_titulo?: string | null
          how_we_work_paso2_descripcion?: string | null
          how_we_work_paso2_titulo?: string | null
          how_we_work_paso3_descripcion?: string | null
          how_we_work_paso3_titulo?: string | null
          how_we_work_paso4_descripcion?: string | null
          how_we_work_paso4_titulo?: string | null
          id?: boolean
          instagram?: string | null
          logo_url?: string | null
          nombre_negocio?: string
          reviews_subtitulo?: string | null
          reviews_titulo?: string | null
          services_subtitulo?: string | null
          services_titulo?: string | null
          telefono?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          cantidad: number
          created_at: string
          created_by: string
          id: string
          inventory_item_id: string
          motivo: string | null
          stock_anterior: number
          stock_posterior: number
          tipo: string
          work_order_id: string | null
        }
        Insert: {
          cantidad: number
          created_at?: string
          created_by: string
          id?: string
          inventory_item_id: string
          motivo?: string | null
          stock_anterior: number
          stock_posterior: number
          tipo: string
          work_order_id?: string | null
        }
        Update: {
          cantidad?: number
          created_at?: string
          created_by?: string
          id?: string
          inventory_item_id?: string
          motivo?: string | null
          stock_anterior?: number
          stock_posterior?: number
          tipo?: string
          work_order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_inventory_items: {
        Row: {
          consumed_at: string | null
          id: string
          inventory_item_id: string | null
          name_snapshot: string
          quantity: number
          subtotal: number
          unit_price: number
          work_order_id: string
        }
        Insert: {
          consumed_at?: string | null
          id?: string
          inventory_item_id?: string | null
          name_snapshot: string
          quantity: number
          subtotal: number
          unit_price: number
          work_order_id: string
        }
        Update: {
          consumed_at?: string | null
          id?: string
          inventory_item_id?: string | null
          name_snapshot?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_inventory_items_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_inventory_items_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_photos: {
        Row: {
          created_at: string
          descripcion: string | null
          id: string
          storage_path: string
          tipo: string
          work_order_id: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: string
          storage_path: string
          tipo: string
          work_order_id: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: string
          storage_path?: string
          tipo?: string
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_photos_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_order_services: {
        Row: {
          description_snapshot: string | null
          id: string
          quantity: number
          service_id: string | null
          subtotal: number
          title_snapshot: string
          unit_price: number
          work_order_id: string
        }
        Insert: {
          description_snapshot?: string | null
          id?: string
          quantity: number
          service_id?: string | null
          subtotal: number
          title_snapshot: string
          unit_price: number
          work_order_id: string
        }
        Update: {
          description_snapshot?: string | null
          id?: string
          quantity?: number
          service_id?: string | null
          subtotal?: number
          title_snapshot?: string
          unit_price?: number
          work_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_order_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_order_services_work_order_id_fkey"
            columns: ["work_order_id"]
            isOneToOne: false
            referencedRelation: "work_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      work_orders: {
        Row: {
          bicycle_id: string
          created_at: string
          created_by: string
          customer_id: string
          estado: string
          fecha_estimada_entrega: string | null
          id: string
          observaciones: string | null
          total: number
          updated_at: string
        }
        Insert: {
          bicycle_id: string
          created_at?: string
          created_by: string
          customer_id: string
          estado?: string
          fecha_estimada_entrega?: string | null
          id?: string
          observaciones?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          bicycle_id?: string
          created_at?: string
          created_by?: string
          customer_id?: string
          estado?: string
          fecha_estimada_entrega?: string | null
          id?: string
          observaciones?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_orders_bicycle_id_fkey"
            columns: ["bicycle_id"]
            isOneToOne: false
            referencedRelation: "bicycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_work_order_inventory_item: {
        Args: { p_work_order_inventory_item_id: string }
        Returns: Json
      }
      create_work_order: { Args: { payload: Json }; Returns: Json }
      get_work_order_detail: {
        Args: { p_work_order_id: string }
        Returns: Json
      }
      register_stock_movement: {
        Args: {
          p_cantidad: number
          p_inventory_item_id: string
          p_motivo?: string
          p_tipo: string
          p_work_order_id?: string
        }
        Returns: Json
      }
      update_work_order_status: {
        Args: { p_new_status: string; p_work_order_id: string }
        Returns: Json
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
