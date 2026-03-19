export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "user" | "admin";
export type MatchPhase =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarter"
  | "semi"
  | "third_place"
  | "final";
export type MatchStatus = "scheduled" | "live" | "finished";
export type PlayerPosition = "goalkeeper" | "defender" | "midfielder" | "forward";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          avatar_url: string | null;
          role: UserRole;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          avatar_url?: string | null;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          avatar_url?: string | null;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      groups: {
        Row: {
          id: string;
          name: string;
        };
        Insert: {
          id?: string;
          name: string;
        };
        Update: {
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          flag_url: string | null;
          group_id: string | null;
          api_id: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          short_name: string;
          flag_url?: string | null;
          group_id?: string | null;
          api_id?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          short_name?: string;
          flag_url?: string | null;
          group_id?: string | null;
          api_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "teams_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          }
        ];
      };
      matches: {
        Row: {
          id: string;
          api_id: number | null;
          phase: MatchPhase;
          group_id: string | null;
          home_team_id: string | null;
          away_team_id: string | null;
          home_score: number | null;
          away_score: number | null;
          status: MatchStatus;
          match_date: string;
        };
        Insert: {
          id?: string;
          api_id?: number | null;
          phase: MatchPhase;
          group_id?: string | null;
          home_team_id?: string | null;
          away_team_id?: string | null;
          home_score?: number | null;
          away_score?: number | null;
          status?: MatchStatus;
          match_date: string;
        };
        Update: {
          id?: string;
          api_id?: number | null;
          phase?: MatchPhase;
          group_id?: string | null;
          home_team_id?: string | null;
          away_team_id?: string | null;
          home_score?: number | null;
          away_score?: number | null;
          status?: MatchStatus;
          match_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_home_team_id_fkey";
            columns: ["home_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_away_team_id_fkey";
            columns: ["away_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      players: {
        Row: {
          id: string;
          name: string;
          team_id: string;
          position: PlayerPosition;
          api_id: number | null;
        };
        Insert: {
          id?: string;
          name: string;
          team_id: string;
          position: PlayerPosition;
          api_id?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          team_id?: string;
          position?: PlayerPosition;
          api_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      predictions: {
        Row: {
          id: string;
          user_id: string;
          submitted_at: string | null;
          is_complete: boolean;
          tournament_winner_team_id: string | null;
          mvp_player_id: string | null;
          top_scorer_player_id: string | null;
          best_goalkeeper_player_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          submitted_at?: string | null;
          is_complete?: boolean;
          tournament_winner_team_id?: string | null;
          mvp_player_id?: string | null;
          top_scorer_player_id?: string | null;
          best_goalkeeper_player_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          submitted_at?: string | null;
          is_complete?: boolean;
          tournament_winner_team_id?: string | null;
          mvp_player_id?: string | null;
          top_scorer_player_id?: string | null;
          best_goalkeeper_player_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "predictions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      match_predictions: {
        Row: {
          id: string;
          prediction_id: string;
          match_id: string;
          home_score: number;
          away_score: number;
        };
        Insert: {
          id?: string;
          prediction_id: string;
          match_id: string;
          home_score: number;
          away_score: number;
        };
        Update: {
          id?: string;
          prediction_id?: string;
          match_id?: string;
          home_score?: number;
          away_score?: number;
        };
        Relationships: [
          {
            foreignKeyName: "match_predictions_prediction_id_fkey";
            columns: ["prediction_id"];
            isOneToOne: false;
            referencedRelation: "predictions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "match_predictions_match_id_fkey";
            columns: ["match_id"];
            isOneToOne: false;
            referencedRelation: "matches";
            referencedColumns: ["id"];
          }
        ];
      };
      group_predictions: {
        Row: {
          id: string;
          prediction_id: string;
          group_id: string;
          first_team_id: string;
          second_team_id: string;
          third_team_id: string;
        };
        Insert: {
          id?: string;
          prediction_id: string;
          group_id: string;
          first_team_id: string;
          second_team_id: string;
          third_team_id: string;
        };
        Update: {
          id?: string;
          prediction_id?: string;
          group_id?: string;
          first_team_id?: string;
          second_team_id?: string;
          third_team_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "group_predictions_prediction_id_fkey";
            columns: ["prediction_id"];
            isOneToOne: false;
            referencedRelation: "predictions";
            referencedColumns: ["id"];
          }
        ];
      };
      scoring_rules: {
        Row: {
          id: string;
          rule_key: string;
          points: number;
          label: string;
        };
        Insert: {
          id?: string;
          rule_key: string;
          points: number;
          label: string;
        };
        Update: {
          id?: string;
          rule_key?: string;
          points?: number;
          label?: string;
        };
        Relationships: [];
      };
      scores: {
        Row: {
          id: string;
          user_id: string;
          total_points: number;
          breakdown: Json;
          last_calculated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_points: number;
          breakdown?: Json;
          last_calculated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_points?: number;
          breakdown?: Json;
          last_calculated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "scores_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      settings: {
        Row: {
          key: string;
          value: string;
        };
        Insert: {
          key: string;
          value: string;
        };
        Update: {
          key?: string;
          value?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      match_phase: MatchPhase;
      match_status: MatchStatus;
      player_position: PlayerPosition;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
