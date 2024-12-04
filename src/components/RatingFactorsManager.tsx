import React, { useState, useEffect } from 'react';
import { RatingFactorsTable } from './RatingFactorsTable';
import { RatingFactorForm } from './RatingFactorForm';
import { RatingFactor, RatingFactorFormData } from '../types/ratingFactor';
import { supabase } from '../lib/supabase';
import { ImportExport } from './ImportExport';
import { logAuditEvent } from '../lib/auditLogger';
import { useAuth } from './AuthProvider';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export function RatingFactorsManager() {
  const [factors, setFactors] = useState<RatingFactor[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFactor, setEditingFactor] = useState<RatingFactor | null>(null);
  const { user } = useAuth();

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('rating_factors_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'rating_factors' 
      }, payload => {
        loadRatingFactors();
      })
      .subscribe();

    loadRatingFactors();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadRatingFactors() {
    const { data, error } = await supabase
      .from('rating_factors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load rating factors');
      return;
    }

    setFactors(data || []);
  }

  async function handleSubmit(data: RatingFactorFormData) {
    try {
      if (editingFactor) {
        const oldData = factors.find(f => f.id === editingFactor.id);
        const { error } = await supabase
          .from('rating_factors')
          .update({
            ...data,
            last_modified: new Date().toISOString(),
            modified_by: user?.email,
          })
          .eq('id', editingFactor.id);

        if (error) throw error;
        
        await logAuditEvent({
          table_name: 'rating_factors',
          record_id: editingFactor.id,
          action: 'UPDATE',
          old_data: oldData,
          new_data: data,
          performed_by: user?.email || 'unknown',
        });

        toast.success('Rating factor updated successfully');
      } else {
        const { error } = await supabase.from('rating_factors').insert([
          {
            ...data,
            last_modified: new Date().toISOString(),
            modified_by: user?.email,
          },
        ]);

        if (error) throw error;
        
        await logAuditEvent({
          table_name: 'rating_factors',
          record_id: 'new',
          action: 'INSERT',
          old_data: undefined,
          new_data: data,
          performed_by: user?.email || 'unknown',
        });

        toast.success('Rating factor created successfully');
      }

      setIsFormOpen(false);
      setEditingFactor(null);
      loadRatingFactors();
    } catch (error) {
      toast.error('Failed to save rating factor');
    }
  }

  async function handleDelete(factorsToDelete: RatingFactor[]) {
    if (!confirm('Are you sure you want to delete the selected rating factors?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('rating_factors')
        .delete()
        .in(
          'id',
          factorsToDelete.map(f => f.id)
        );

      if (error) throw error;

      toast.success('Rating factors deleted successfully');
      loadRatingFactors();
    } catch (error) {
      toast.error('Failed to delete rating factors');
    }
  }

  async function handleImport(importedData: RatingFactor[]) {
    try {
      const { error } = await supabase
        .from('rating_factors')
        .insert(importedData.map(data => ({
          ...data,
          last_modified: new Date().toISOString(),
          modified_by: user?.email,
        })));

      if (error) throw error;
      
      await logAuditEvent({
        table_name: 'rating_factors',
        record_id: 'bulk_import',
        action: 'INSERT',
        new_data: { count: importedData.length },
        performed_by: user?.email || 'unknown',
      });

      toast.success(`Successfully imported ${importedData.length} rating factors`);
      loadRatingFactors();
    } catch (error) {
      toast.error('Failed to import rating factors');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Rating Factors</h2>
        <div className="flex items-center gap-4">
          <ImportExport onImport={handleImport} data={factors} />
          <button
            onClick={() => {
              setEditingFactor(null);
              setIsFormOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Rating Factor</span>
          </button>
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingFactor ? 'Edit' : 'Add'} Rating Factor
            </h3>
            <RatingFactorForm
              initialData={editingFactor || undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingFactor(null);
              }}
            />
          </div>
        </div>
      )}

      <RatingFactorsTable
        data={factors}
        onEdit={factor => {
          setEditingFactor(factor);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
}