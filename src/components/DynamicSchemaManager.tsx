import React, { useState, useEffect } from 'react';
import { DatabaseSchema } from '../types/schema';
import { loadDynamicSchema } from '../lib/schemaLoader';
import { SchemaManager } from './SchemaManager';
import { LoadingSpinner } from './LoadingSpinner';
import { Database, AlertTriangle, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { HelpPage } from './HelpPage';

export function DynamicSchemaManager() {
  const [schema, setSchema] = useState<DatabaseSchema | null>(null);
  const [activeTable, setActiveTable] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadSchema();
  }, [refreshKey]);

  // Set up real-time subscription for schema changes
  useEffect(() => {
    const channel = supabase
      .channel('any')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: '*'
      }, () => {
        setRefreshKey(prev => prev + 1);
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  async function loadSchema() {
    try {
      setLoading(true);
      setError(null);
      const loadedSchema = await loadDynamicSchema();
      setSchema(loadedSchema);
      if (!activeTable && loadedSchema.tables.length > 0) {
        setActiveTable(loadedSchema.tables[0].name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schema');
      toast.error('Failed to load database schema');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Schema</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadSchema}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeTableDef = schema.tables.find(t => t.name === activeTable);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center">
            <Database className="w-5 h-5 mr-2 flex-shrink-0" />
            Database Tables
          </h2>
          <div className="mt-2 space-y-2">
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="w-full px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              Refresh Schema
            </button>
            <button
              onClick={() => {
                setShowHelp(true);
                setActiveTable(null);
              }}
              className="w-full px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded flex items-center justify-center"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              Help & Documentation
            </button>
          </div>
        </div>
        <nav className="mt-2">
          {schema.tables.map(table => (
            <button
              key={table.name}
              onClick={() => setActiveTable(table.name)}
              className={`
                w-full px-4 py-2 text-left text-sm
                ${activeTable === table.name
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'}
              `}
            >
              {table.displayName}
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {showHelp ? (
            <HelpPage />
          ) : activeTableDef ? (
            <SchemaManager
              schema={schema}
              table={activeTableDef}
            />
          ) : (
            <div className="text-center text-gray-500 mt-8">
              Select a table to manage or view the documentation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}