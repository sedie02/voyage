/**
 * Supabase Database Types
 * Auto-generated types from database schema
 *
 * Genereer met: npm run db:generate
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type TravelStyle = 'adventure' | 'beach' | 'culture' | 'nature' | 'mixed';
export type DayPart = 'morning' | 'afternoon' | 'evening' | 'full_day';
export type PollStatus = 'active' | 'closed' | 'archived';
export type ParticipantRole = 'owner' | 'editor' | 'viewer' | 'guest';

export interface Database {
  public: {
    Tables: {
      trips: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          destination: string;
          start_date: string;
          end_date: string;
          travel_style: TravelStyle | null;
          destination_lat: number | null;
          destination_lng: number | null;
          destination_country: string | null;
          destination_city: string | null;
          owner_id: string | null;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          destination: string;
          start_date: string;
          end_date: string;
          travel_style?: TravelStyle | null;
          destination_lat?: number | null;
          destination_lng?: number | null;
          destination_country?: string | null;
          destination_city?: string | null;
          owner_id?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          destination?: string;
          start_date?: string;
          end_date?: string;
          travel_style?: TravelStyle | null;
          destination_lat?: number | null;
          destination_lng?: number | null;
          destination_country?: string | null;
          destination_city?: string | null;
          owner_id?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      trip_participants: {
        Row: {
          id: string;
          trip_id: string;
          user_id: string | null;
          guest_name: string | null;
          guest_email: string | null;
          role: ParticipantRole;
          invited_by: string | null;
          invited_at: string;
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          user_id?: string | null;
          guest_name?: string | null;
          guest_email?: string | null;
          role?: ParticipantRole;
          invited_by?: string | null;
          invited_at?: string;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          user_id?: string | null;
          guest_name?: string | null;
          guest_email?: string | null;
          role?: ParticipantRole;
          invited_by?: string | null;
          invited_at?: string;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Voeg andere tables toe naar behoefte...
    };
    Views: {
      trip_overview: {
        Row: {
          id: string;
          title: string;
          destination: string;
          start_date: string;
          end_date: string;
          participant_count: number;
          day_count: number;
          activity_count: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: {
      travel_style: TravelStyle;
      day_part: DayPart;
      poll_status: PollStatus;
      participant_role: ParticipantRole;
    };
  };
}
