import React, { useState, useEffect } from 'react';
import { DatabaseSchema, TableDefinition } from '../types/schema';
import { SchemaTable } from './SchemaTable';
import { SchemaForm } from './SchemaForm';
import { supabase } from '../lib/supabase';
import { logAuditEvent } from '../lib/auditLogger';
import { useAuth } from './AuthProvider';
import { Plus, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AIAssistant } from './AIAssistant';
import { DataInsights } from './DataInsights';

interface SchemaManagerProps {
  schema: DatabaseSchema;
  table: TableDefinition;
}

export function SchemaManager({ schema, table }: SchemaManagerProps) {
  const [data, setData] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dependentRecords, setDependentRecords] = useState<Record<string, number>>({});
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const subscription = supabase
      .channel(`${table.name}_changes`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table.name
      }, () => {
        loadData();
      })
      .subscribe();

    loadData();

    return () => {
      subscription.unsubscribe();
    };
  }, [table.name]);

  async function loadData() {
    setIsLoading(true);
    setError(null);
    
    const query = supabase.from(table.name).select('*');
    
    // Add related data for foreign keys
    table.fields
      .filter(f => f.type === 'foreignKey' && f.foreignKey)
      .forEach(field => {
        query.select(`${field.name}:${field.foreignKey!.table}(id,${field.foreignKey!.displayField})`);
      });

    const { data: items, error } = await query;

    if (error) {
      setError(`Failed to load ${table.displayName.toLowerCase()}: ${error.message}`);
      toast.error(`Failed to load ${table.displayName.toLowerCase()}`);
      setIsLoading(false);
      return;
    }

    // Load dependent record counts
    const dependencies = schema.relationships
      .filter(r => r.to.table === table.name)
      .map(r => r.from.table);

    const counts: Record<string, number> = {};
    for (const depTable of dependencies) {
      const { count } = await supabase
        .from(depTable)
        .select('*', { count: 'exact', head: true })
        .in(table.name + '_id', items.map(item => item.id));
      
      if (count) counts[depTable] = count;
    }
    setDependentRecords(counts);
    setData(items);
    setIsLoading(false);
  }

  async function handleSubmit(formData: Record<string, any>) {
    try {
      // Create a transaction for data changes and audit logging
      const { data: result, error: submitError } = await supabase.rpc('handle_data_change', {
        p_table_name: table.name,
        p_record_id: editingItem?.id,
        p_old_data: editingItem ? JSON.stringify(editingItem) : null,
        p_new_data: JSON.stringify(formData),
        p_action: editingItem ? 'UPDATE' : 'INSERT',
        p_user_email: user?.email
      });
      // Remove system fields from new records
      if (!editingItem) {
        ['id', 'created_at', 'updated_at'].forEach(field => {
          delete formData[field];
        });
      }

      // Validate required fields
      const requiredFields = table.fields.filter(f => f.required);
      for (const field of requiredFields) {
        if (!formData[field.name] && formData[field.name] !== 0) {
          throw new Error(`${field.name} is required`);
        }
      }

      // Validate field constraints
      for (const field of table.fields) {
        const value = formData[field.name];
        if (value != null) {
          if (field.type === 'string' && field.maxLength && value.length > field.maxLength) {
            throw new Error(`${field.name} exceeds maximum length of ${field.maxLength}`);
          }
          if (field.type === 'number') {
            if (field.min != null && value < field.min) {
              throw new Error(`${field.name} must be at least ${field.min}`);
            }
            if (field.max != null && value > field.max) {
              throw new Error(`${field.name} must be at most ${field.max}`);
            }
          }
        }
      }

      if (submitError) {
        throw submitError;
      }

      toast.success(`${table.displayName} ${editingItem ? 'updated' : 'created'} successfully`);
      setIsFormOpen(false);
      setEditingItem(null);
      loadData();
    } catch (error) {
      toast.error(`Failed to save ${table.displayName.toLowerCase()}`);
    }
  }

  async function handleDelete(itemsToDelete: any[]) {
    const message = itemsToDelete.length > 1
      ? `Are you sure you want to delete these ${itemsToDelete.length} items?`
      : `Are you sure you want to delete this ${table.displayName.toLowerCase()}?`;

    if (!confirm(message)) return;

    try {
      // Check for dependent records
      for (const item of itemsToDelete) {
        const dependencies = schema.relationships
          .filter(r => r.to.table === table.name)
          .map(r => r.from.table);

        for (const depTable of dependencies) {
          const { count, error } = await supabase
            .from(depTable)
            .select('*', { count: 'exact', head: true })
            .eq(table.name + '_id', item.id);

          if (error) throw error;
          if (count && count > 0) {
            throw new Error(`Cannot delete: This ${table.displayName.toLowerCase()} is referenced by ${count} records in ${depTable}`);
          }
        }
      }

      const { error } = await supabase
        .from(table.name)
        .delete()
        .in('id', itemsToDelete.map(item => item.id));

      if (error) throw error;

      await Promise.all(itemsToDelete.map(item =>
        logAuditEvent({
          table_name: table.name,
          record_id: item.id,
          action: 'DELETE',
          old_data: item,
          performed_by: user?.email || 'unknown',
        })
      ));

      toast.success(`${table.displayName} deleted successfully`);
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to delete ${table.displayName.toLowerCase()}`);
    }
  }

  // Helper function to clean form data before submission
  function cleanFormData(data: Record<string, any>) {
    const cleaned: Record<string, any> = {};
    
    // Only include fields that are defined in the schema
    for (const field of table.fields) {
      if (data[field.name] !== undefined) {
        cleaned[field.name] = data[field.name];
      }
    }
    
    return cleaned;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{table.displayName}</h2>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsFormOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add {table.displayName}</span>
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingItem ? 'Edit' : 'Add'} {table.displayName}
            </h3>
            <button
              onClick={() => {
                setIsFormOpen(false);
                setEditingItem(null);
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            </div>
            <SchemaForm
              table={table}
              initialData={editingItem}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingItem(null);
              }}
            />
          </div>
        </div>
      )}
      <DataInsights data={data} />
      <SchemaTable
        table={table}
        schema={schema}
        isLoading={isLoading}
        data={data}
        onEdit={item => {
          // Show dependent records warning if any exist
          const deps = Object.entries(dependentRecords)
            .filter(([_, count]) => count > 0)
            .map(([table, count]) => `${count} records in ${table}`);
          
          if (deps.length > 0) {
            toast.info(
              `This record has dependent records: ${deps.join(', ')}. ` +
              `Please review carefully before making changes.`
            );
          }

          setEditingItem(item);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
      />
      <AIAssistant table={table} />
    </div>
  );
}