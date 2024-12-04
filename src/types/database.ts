export interface RatingFactor {
  id: string;
  class_code: string;
  state: string;
  rate: number;
  effective_date: string;
  expiration_date: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  performed_by: string;
  performed_at: string;
}