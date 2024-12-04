import React, { useState, useEffect } from 'react';
import { DataTable } from './DataTable';
import { ImportExport } from './ImportExport';
import { logAuditEvent } from '../lib/auditLogger';
import { useAuth } from './AuthProvider';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { TableData, TableConfig } from '../types/tableTypes';

interface TableManagerProps<T extends TableData> {
  config: TableConfig<T>;
  FormComponent: React.ComponentType<{
    initialData?: T;
    onSubmit: (data: Omit<T, 'id' | 'last_modified' | 'modified_by'>) => void;
    onCancel: () => void;
  }>;
}

export function TableManager<T extends TableData>({ 
  config,
  FormComponent
}: TableManagerProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const subscription = supabase
      .channel(`${config.tableName}_changes`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: config.tableName 
      }, () => {
        loadData();
      })
      .subscribe();

    loadData();

    return () => {
      subscription.unsubscribe();
    };
  }, [config.tableName]);

  async function loadData() {
    const { data: items, error } = await supabase
      .from(config.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error(`Failed to load ${config.displayName.toLowerCase()}`);
      return;
    }

    setData(items);
  }

  async function handleSubmit(formData: Omit<T, 'id' | 'last_modified' | 'modified_by'>) {
    try {
      if (editingItem) {
        const { error } = await supabase
          .from(config.tableName)
          .update({
            ...formData,
            last_modified: new Date().toISOString(),
            modified_by: user?.email,
          })
          .eq('id', editingItem.id);

        if (error) throw error;

        await logAuditEvent({
          table_name: config.tableName,
          record_id: editingItem.id,
          action: 'UPDATE',
          old_data: editingItem,
          new_data: formData,
          performed_by: user?.email || 'unknown',
        });

        toast.success(`${config.displayName} updated successfully`);
      } else {
        const { error } = await supabase
          .from(config.tableName)
          .insert([{
            ...formData,
            last_modified: new Date().toISOString(),
            modified_by: user?.email,
          }]);

        if (error) throw error;

        await logAuditEvent({
          table_name: config.tableName,
          record_id: 'new',
          action: 'INSERT',
          new_data: formData,
          performed_by: user?.email || 'unknown',
        });

        toast.success(`${config.displayName} created successfully`);
      }

      setIsFormOpen(false);
      setEditingItem(null);
      loadData();
    } catch (error) {
      toast.error(`Failed to save ${config.displayName.toLowerCase()}`);
    }
  }

  async function handleDelete(itemsToDelete: T[]) {
    if (!confirm(`Are you sure you want to delete the selected ${config.displayName.toLowerCase()}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from(config.tableName)
        .delete()
        .in(
          'id',
          itemsToDelete.map(item => item.id)
        );

      if (error) throw error;

      await Promise.all(itemsToDelete.map(item =>
        logAuditEvent({
          table_name: config.tableName,
          record_id: item.id,
          action: 'DELETE',
          old_data: item,
          performed_by: user?.email || 'unknown',
        })
      ));

      toast.success(`${config.displayName} deleted successfully`);
      loadData();
    } catch (error) {
      toast.error(`Failed to delete ${config.displayName.toLowerCase()}`);
    }
  }

  async function handleImport(importedData: T[]) {
    try {
      const { error } = await supabase
        .from(config.tableName)
        .insert(importedData.map(item => ({
          ...item,
          last_modified: new Date().toISOString(),
          modified_by: user?.email,
        })));

      if (error) throw error;

      await logAuditEvent({
        table_name: config.tableName,
        record_id: 'bulk_import',
        action: 'INSERT',
        new_data: { count: importedData.length },
        performed_by: user?.email || 'unknown',
      });

      toast.success(`Successfully imported ${importedData.length} ${config.displayName.toLowerCase()}`);
      loadData();
    } catch (error) {
      toast.error(`Failed to import ${config.displayName.toLowerCase()}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{config.displayName}</h2>
        <div className="flex items-center gap-4">
          <ImportExport onImport={handleImport} data={data} />
          <button
            onClick={() => {
              setEditingItem(null);
              setIsFormOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add {config.displayName}</span>
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingItem ? 'Edit' : 'Add'} {config.displayName}
            </h3>
            <FormComponent
              initialData={editingItem || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingItem(null);
              }}
            />
          </div>
        </div>
      )}

      <DataTable
        config={config}
        data={data}
        onEdit={item => {
          setEditingItem(item);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}