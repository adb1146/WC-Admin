import { DatabaseSchema } from '../types/schema';
import { supabase } from './supabase';
import { insuranceSchema } from '../types/insuranceSchema';

export async function loadDynamicSchema(): Promise<DatabaseSchema> {
  try {
    // For now, return the static schema until we implement proper schema introspection
    return insuranceSchema;
  } catch (error) {
    console.error('Error loading schema:', error);
    throw error;
  }
}