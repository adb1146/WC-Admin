import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AuditLogEntry {
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  performed_by: string;
}

export async function logAuditEvent(entry: AuditLogEntry) {
  if (!entry.performed_by) {
    console.warn('No user specified for audit log entry');
    return;
  }

  const { error } = await supabase.from('audit_logs').insert([{
    ...entry,
    performed_at: new Date().toISOString(),
    // Ensure data is properly serialized
    old_data: entry.old_data ? JSON.stringify(entry.old_data) : null,
    new_data: entry.new_data ? JSON.stringify(entry.new_data) : null
  }]);

  if (error) {
    console.warn('Audit logging failed:', error);
  }
}